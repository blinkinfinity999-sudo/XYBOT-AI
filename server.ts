import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middleware (supports large image/audio payloads for multimodal vision)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initialize Google Gen AI
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: Date.now(), service: "XYBOT AI Core" });
});

// Helper to detect retryable errors (e.g. 503 high demand, 429 rate limit, 500 transient)
function isRetryableError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.code || error.statusCode;
  if (status === 503 || status === 429 || status === 500 || status === 502 || status === 504) return true;
  if (status === "UNAVAILABLE" || status === "RESOURCE_EXHAUSTED") return true;

  const msg = (error.message || JSON.stringify(error) || "").toLowerCase();
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("high demand") ||
    msg.includes("unavailable") ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota exceeded") ||
    msg.includes("overloaded") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("service unavailable") ||
    msg.includes("rate limit")
  );
}

// Resilient non-streaming generation helper with automatic retry and model fallback
async function generateContentWithResilience(
  ai: GoogleGenAI,
  preferredModel: string,
  contents: any,
  config: any,
  fallbackModels: string[] = ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.7-flash"]
) {
  const modelsToTry = Array.from(new Set([preferredModel, ...fallbackModels].filter(Boolean)));
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    // For quota 429 or 404, only 1 attempt on this model; for transient 503, max 2 attempts
    let maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[GenAI] Attempt ${attempt} on model '${modelName}' failed:`, err?.message || err);
        
        const errStr = (err?.message || JSON.stringify(err) || "").toLowerCase();
        const isQuotaOrNotFound = errStr.includes("429") || errStr.includes("quota") || errStr.includes("404") || err?.status === 429 || err?.status === 404;

        if (isQuotaOrNotFound || !isRetryableError(err)) {
          break; // Jump immediately to next model in fallback list
        }
        if (attempt < maxAttempts) {
          const jitter = Math.floor(Math.random() * 150);
          await new Promise((resolve) => setTimeout(resolve, 300 * attempt + jitter));
        }
      }
    }
  }

  throw lastError || new Error("All Gemini models are currently experiencing temporary high demand. Please try again shortly.");
}

// Resilient streaming generation helper with automatic retry and model fallback
async function generateContentStreamWithResilience(
  ai: GoogleGenAI,
  preferredModel: string,
  contents: any,
  config: any,
  onChunk: (chunkText: string) => void,
  fallbackModels: string[] = ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.7-flash"]
): Promise<string> {
  const modelsToTry = Array.from(new Set([preferredModel, ...fallbackModels].filter(Boolean)));
  let lastError: any = null;
  let hasStreamedAny = false;

  for (const modelName of modelsToTry) {
    let maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const stream = await ai.models.generateContentStream({
          model: modelName,
          contents,
          config,
        });

        let fullText = "";
        for await (const chunk of stream) {
          const chunkText = chunk.text || "";
          if (chunkText) {
            hasStreamedAny = true;
            fullText += chunkText;
            onChunk(chunkText);
          }
        }
        return fullText;
      } catch (err: any) {
        lastError = err;
        console.warn(`[GenAI Stream] Attempt ${attempt} on model '${modelName}' failed:`, err?.message || err);

        // If we already sent partial tokens to the browser, we cannot restart the stream from zero cleanly
        if (hasStreamedAny) {
          throw err;
        }

        const errStr = (err?.message || JSON.stringify(err) || "").toLowerCase();
        const isQuotaOrNotFound = errStr.includes("429") || errStr.includes("quota") || errStr.includes("404") || err?.status === 429 || err?.status === 404;

        if (isQuotaOrNotFound || !isRetryableError(err)) {
          break; // Jump immediately to next fallback model
        }
        if (attempt < maxAttempts) {
          const jitter = Math.floor(Math.random() * 150);
          await new Promise((resolve) => setTimeout(resolve, 300 * attempt + jitter));
        }
      }
    }
  }

  throw lastError || new Error("All Gemini models are currently experiencing temporary high demand. Please try again shortly.");
}

// Mode-specific configuration provider (aligned with ChatGPT and Google Gemini conversational standards)
function getModeConfig(mode: string = "xy-base") {
  const coreDirective = `You are XYBOT, a state-of-the-art conversational AI assistant engineered to respond with the depth, clarity, warmth, and intelligence of ChatGPT (GPT-4o) and Google Gemini.

Key Guidelines:
1. Natural & Conversational: Talk like an expert, friendly, and articulate human collaborator. Do NOT output robotic sci-fi roleplay clichés (e.g. avoid repeating "Neural matrix initialized" or "Greetings user"). Answer directly and thoughtfully.
2. Markdown & Readability: Structure responses beautifully with descriptive headings (##, ###), clean bullet points, numbered steps, bold key takeaways, and neat comparison tables when appropriate.
3. Code & Technical Excellence: When providing code, write clean, idiomatic, fully functional, and production-ready snippets with exact language tags (e.g. \`\`\`typescript, \`\`\`python, \`\`\`html, \`\`\`json). Provide clear explanations for key architectural decisions.
4. Accuracy & Helpfulness: Always aim for truthful, comprehensive, and practical solutions. If instructions are ambiguous, provide the most plausible solution and briefly offer relevant follow-ups.`;

  switch (mode) {
    case "xy-light":
      return {
        temperature: 0.2,
        systemInstruction: `${coreDirective}

Specialized Mode: XY Light (Fast & Concise)
- Prioritize high speed, brevity, and direct answers.
- Skip unnecessary preamble. Give bulleted recaps, instant answers, or succinct code fixes immediately.`,
      };
    case "xy-creative":
      return {
        temperature: 0.85,
        systemInstruction: `${coreDirective}

Specialized Mode: XY Creative (Brainstorming & Imagination)
- Write vivid, engaging stories, marketing copy, poetry, and screenplays.
- Craft detailed image generation prompts with artistic lighting, cinematic composition, and aesthetic depth.`,
      };
    case "xy-student":
      return {
        temperature: 0.4,
        systemInstruction: `${coreDirective}

Specialized Mode: XY Student (Tutor & Academic Mentor)
- Break down homework, math proofs, physics equations, chemistry problems, coding tasks, and history topics step-by-step.
- Use intuitive analogies, formula breakdowns, study tips, and clear examples so students master concepts easily.`,
      };
    case "xy-neo":
      return {
        temperature: 0.5,
        systemInstruction: `${coreDirective}

Specialized Mode: XY Neo (Deep Analytical Reasoning)
- Approach complex questions with rigorous multi-step breakdown, first-principles logic, and thorough trade-off evaluation.
- Identify edge cases, benchmark considerations, and architectural trade-offs with deep precision.`,
      };
    case "xy-base":
    default:
      return {
        temperature: 0.7,
        systemInstruction: `${coreDirective}

Specialized Mode: XY Base (Balanced Everyday Intelligence)
- Deliver high-caliber conversational responses, deep thinking, problem-solving, and general assistance.`,
      };
  }
}

// 1. Streaming / Standard Chat Endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { messages, model = "gemini-3.7-flash", mode = "xy-base", systemInstruction, userPersona, userName, stream = true } = req.body;
    const ai = getGenAI();

    const modeConfig = getModeConfig(mode);
    let finalSystem = systemInstruction || modeConfig.systemInstruction;
    if (userName) {
      finalSystem += `\n\nUser Profile Context: Addressing user "${userName}".`;
    }
    if (userPersona) {
      finalSystem += `\n\nActive Persona Custom Instructions:\n${userPersona}`;
    }
    const finalTemperature = modeConfig.temperature;

    if (!ai) {
      // Fallback if no API key is provided
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders?.();
        
        const fallbackText = `Hello! I am XYBOT AI (${mode.replace('xy-', 'XY ').toUpperCase()} Mode). Please ensure your GEMINI_API_KEY is configured in the AI Studio Settings panel to activate full real-time neural intelligence.`;
        for (const char of fallbackText) {
          res.write(`data: ${JSON.stringify({ chunk: char })}\n\n`);
          await new Promise((r) => setTimeout(r, 10));
        }
        res.write(`data: ${JSON.stringify({ done: true, suggestions: ["What can you do?", "Help me with homework", "Switch to XY Light mode"] })}\n\n`);
        res.end();
        return;
      } else {
        return res.json({
          text: `Hello! I am XYBOT AI (${mode.replace('xy-', 'XY ').toUpperCase()} Mode). Please set your GEMINI_API_KEY to activate full neural capabilities.`,
          suggestions: ["What can you do?", "Help with coding", "Analyze a concept"]
        });
      }
    }

    // If attachments (e.g. image) exist in the latest message, assemble multimodal contents
    const contents: any[] = [];

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        const parts: any[] = [];
        if (msg.attachments && Array.isArray(msg.attachments)) {
          for (const att of msg.attachments) {
            if (att.base64 && att.mimeType) {
              const cleanBase64 = att.base64.includes(",") ? att.base64.split(",")[1] : att.base64;
              parts.push({
                inlineData: {
                  data: cleanBase64,
                  mimeType: att.mimeType,
                },
              });
            }
          }
        }
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: parts.length > 0 ? parts : [{ text: " " }],
        });
      }
    }

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders?.();

      const fullResponse = await generateContentStreamWithResilience(
        ai,
        model || "gemini-flash-latest",
        contents,
        {
          systemInstruction: finalSystem,
          temperature: finalTemperature,
        },
        (chunkText: string) => {
          res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
        },
        ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.7-flash"]
      );

      // Generate instant smart quick follow-up suggestions dynamically
      const suggestions = generateSmartSuggestions(fullResponse, mode);
      res.write(`data: ${JSON.stringify({ done: true, suggestions })}\n\n`);
      res.end();
    } else {
      const response = await generateContentWithResilience(
        ai,
        model || "gemini-flash-latest",
        contents,
        {
          systemInstruction: finalSystem,
          temperature: finalTemperature,
        },
        ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.7-flash"]
      );

      const text = response.text || "";
      const suggestions = generateSmartSuggestions(text, mode);
      res.json({ text, suggestions });
    }
  } catch (error: any) {
    console.error("Chat API Error:", error);
    const errStr = (error?.message || JSON.stringify(error) || "").toLowerCase();
    const isHighDemandOrQuota = errStr.includes("503") || errStr.includes("429") || errStr.includes("quota") || errStr.includes("high demand") || error?.status === 503 || error?.status === 429;
    
    const userFriendlyMessage = isHighDemandOrQuota
      ? "I am currently experiencing a temporary surge in neural requests. I have preserved your session—click **Regenerate** or send your query again to continue."
      : (error?.message || "An unexpected error occurred during response generation. Please try again.");

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ chunk: userFriendlyMessage })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, suggestions: ["Regenerate response", "Switch to XY Light mode", "Try a shorter query"] })}\n\n`);
      res.end();
    } else {
      res.status(200).json({
        text: userFriendlyMessage,
        suggestions: ["Regenerate response", "Switch to XY Light mode", "Try a shorter query"]
      });
    }
  }
});

// Helper to generate contextual follow-up suggestions
function generateSmartSuggestions(responseText: string, mode: string = "xy-base"): string[] {
  const lower = responseText.toLowerCase();
  if (mode === "xy-student") {
    return [
      "Can you give me a practice problem on this?",
      "Summarize this in simple study notes for my exam",
      "Show another step-by-step example with different numbers",
    ];
  }
  if (mode === "xy-creative") {
    return [
      "Generate an image prompt based on this story",
      "Expand on the emotional depth of the characters",
      "Write an alternative ending with a surprise plot twist",
    ];
  }
  if (mode === "xy-neo") {
    return [
      "Deep dive into the edge cases and mathematical constraints",
      "Evaluate alternative trade-offs and security implications",
      "Provide a formal proof or rigorous benchmark",
    ];
  }
  if (mode === "xy-light") {
    return [
      "Give me a 1-sentence recap",
      "List the top 3 bullet points",
      "Quick code snippet example",
    ];
  }
  if (lower.includes("code") || lower.includes("function") || lower.includes("const") || lower.includes("def ")) {
    return [
      "Can you explain how this works step by step?",
      "Add unit tests and error handling",
      "Optimize this for better performance",
    ];
  } else if (lower.includes("recipe") || lower.includes("cook") || lower.includes("ingredients")) {
    return [
      "What can I substitute for the main ingredient?",
      "How many calories does this approximately have?",
      "Give me wine or beverage pairing suggestions",
    ];
  } else if (lower.includes("math") || lower.includes("formula") || lower.includes("equation")) {
    return [
      "Show the detailed proof or algebraic steps",
      "Can we graph this or solve with a different method?",
      "Give me a real-world example of this concept",
    ];
  }
  return [
    "Tell me more about this in detail",
    "Can you summarize key takeaways in 3 bullets?",
    "Give me practical examples or next steps",
  ];
}

// 2. Vision & OCR Analysis Endpoint (supports both /api/vision and /api/vision/analyze)
const handleVisionRequest = async (req: Request, res: Response) => {
  try {
    const rawImage = req.body.imageBase64 || req.body.image;
    const prompt = req.body.prompt || "Analyze this image in high detail. Describe objects, text, composition, and key insights.";
    const mode = req.body.mode || "general";
    const mimeType = req.body.mimeType || (rawImage?.startsWith("data:image/png") ? "image/png" : "image/jpeg");

    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({ error: "GEMINI_API_KEY is required for Vision analysis." });
    }

    if (!rawImage) {
      return res.status(400).json({ error: "No image payload provided." });
    }

    const cleanBase64 = rawImage.includes(",") ? rawImage.split(",")[1] : rawImage;
    
    let systemPrompt = "You are XYBOT AI Vision Core. Analyze visual inputs with extraordinary precision.";
    if (mode === "ocr") {
      systemPrompt = "You are XYBOT AI OCR Engine. Extract all readable text from this image faithfully, keeping formatting, tables, lists, and language exact. Include a short summary at the end.";
    } else if (mode === "math") {
      systemPrompt = "You are XYBOT AI STEM Solver. Read any math equation, formula, or physics diagram in this image, explain the problem, and provide step-by-step solutions.";
    }

    const response = await generateContentWithResilience(
      ai,
      "gemini-flash-latest",
      {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      {
        systemInstruction: systemPrompt,
      },
      ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.7-flash"]
    );

    res.json({ text: response.text || "" });
  } catch (error: any) {
    console.error("Vision API Error:", error);
    res.status(500).json({ error: error?.message || "Failed to analyze image." });
  }
};

app.post("/api/vision", handleVisionRequest);
app.post("/api/vision/analyze", handleVisionRequest);

// 3. AI Tool Tasks (supports both /api/ai-tool and /api/tools/execute)
const handleToolRequest = async (req: Request, res: Response) => {
  try {
    const tool = req.body.tool || req.body.toolId;
    const content = req.body.content || req.body.input || "";
    const option = req.body.option || "";
    const targetLanguage = req.body.targetLanguage || option;
    const tone = req.body.tone || option;
    const extraInstructions = req.body.extraInstructions || (typeof option === "string" ? option : "");

    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({ error: "GEMINI_API_KEY is required." });
    }

    let systemInstruction = "";
    let prompt = "";

    switch (tool) {
      case "writing":
        systemInstruction = `You are an elite creative and professional AI writer. Tone requested: ${tone || 'engaging and polished'}.`;
        prompt = `Draft, enhance, or create content based on the following input:\n\n${content}\n\nAdditional notes: ${extraInstructions || 'Make it compelling and well-structured.'}`;
        break;
      case "summarizer":
        systemInstruction = "You are an executive AI summarizer. Provide an executive summary, bulleted key takeaways, and action points.";
        prompt = `Summarize the following text comprehensively:\n\n${content}`;
        break;
      case "translator":
        systemInstruction = `You are a master multilingual translator. Translate into ${targetLanguage || 'English'} preserving nuance, idiomatic meaning, and tone. Also provide pronunciation tips if relevant.`;
        prompt = `Translate the following text:\n\n${content}`;
        break;
      case "grammar":
        systemInstruction = "You are a professional editor and linguist. Correct all grammatical, spelling, punctuation, and structural flaws. Provide the corrected text first, then briefly list improvements made.";
        prompt = `Review and correct the grammar of this text:\n\n${content}`;
        break;
      case "code":
        systemInstruction = "You are a principal software architect. Provide clean, secure, efficient, and well-commented code with explanations of the algorithm and complexity.";
        prompt = `Solve, write, or debug the following programming requirement:\n\n${content}\n\nContext/Requirements: ${extraInstructions || 'Optimal solution with comments.'}`;
        break;
      case "math":
        systemInstruction = "You are an advanced mathematical engine. Provide clear step-by-step derivations, formulas, verified calculations, and final answers formatted in clear markdown / LaTeX notation.";
        prompt = `Solve this math/science problem step by step:\n\n${content}`;
        break;
      case "pdf-reader":
        systemInstruction = "You are an AI document analysis engine. Analyze document text, highlight key insights, extract tables or data points, and answer user queries.";
        prompt = `Analyze this document content:\n\n${content}\n\nSpecific inquiry: ${extraInstructions || 'Provide full structured analysis'}`;
        break;
      default:
        systemInstruction = "You are a versatile AI assistant.";
        prompt = content;
    }

    const response = await generateContentWithResilience(
      ai,
      "gemini-flash-latest",
      prompt,
      {
        systemInstruction,
      },
      ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.7-flash"]
    );

    const result = response.text || "";
    res.json({ result, text: result });
  } catch (error: any) {
    console.error("AI Tool Error:", error);
    res.status(500).json({ error: error?.message || "Failed to process tool request." });
  }
};

app.post("/api/ai-tool", handleToolRequest);
app.post("/api/tools/execute", handleToolRequest);

// 4. AI Image Generation Endpoint (supports both /api/image/generate and /api/generate-image)
const handleImageGenRequest = async (req: Request, res: Response) => {
  try {
    const { prompt, style = "Futuristic 3D", aspectRatio = "1:1" } = req.body;
    const ai = getGenAI();

    const enhancedPrompt = `${prompt}, ${style} style, futuristic glowing lighting, octane render, 8k resolution, photorealistic masterpiece, award-winning digital art, volumetric neon light, highly detailed`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: [
              { text: enhancedPrompt }
            ]
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any || "1:1",
            }
          }
        });

        if (response?.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || "image/png";
              return res.json({
                imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                prompt,
                style,
                aspectRatio,
              });
            }
          }
        }
      } catch (geminiImgError: any) {
        console.warn("Nano banana image generation attempt fallback:", geminiImgError?.message);
      }
    }

    // High quality procedural SVG/Canvas futuristic neural art synthesis fallback
    const fallbackImage = createFuturisticArtSvg(prompt, style);
    res.json({
      imageUrl: fallbackImage,
      prompt,
      style,
      aspectRatio,
      isSynthetic: true,
    });
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    const fallback = createFuturisticArtSvg(req.body.prompt || "Cybernetic Vision", req.body.style || "Futuristic");
    res.json({ imageUrl: fallback, prompt: req.body.prompt, style: req.body.style });
  }
};

app.post("/api/image/generate", handleImageGenRequest);
app.post("/api/generate-image", handleImageGenRequest);

// Generates high quality stylized vector neural artwork
function createFuturisticArtSvg(prompt: string, style: string): string {
  const hash = Math.abs(prompt.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
  const hue1 = hash % 360;
  const hue2 = (hue1 + 60 + (hash % 120)) % 360;
  const hue3 = (hue2 + 120) % 360;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue1}, 80%, 8%)" />
        <stop offset="50%" stop-color="hsl(${hue2}, 70%, 14%)" />
        <stop offset="100%" stop-color="hsl(${hue3}, 90%, 6%)" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="hsl(${hue1}, 100%, 65%)" stop-opacity="0.9" />
        <stop offset="60%" stop-color="hsl(${hue2}, 100%, 50%)" stop-opacity="0.4" />
        <stop offset="100%" stop-color="transparent" stop-opacity="0" />
      </radialGradient>
      <filter id="neon" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="16" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)" />
    
    <!-- Cybernetic grid -->
    <g opacity="0.15" stroke="#38bdf8" stroke-width="1.5">
      ${Array.from({ length: 17 }).map((_, i) => `<line x1="${i * 64}" y1="0" x2="${i * 64}" y2="1024" />`).join("")}
      ${Array.from({ length: 17 }).map((_, i) => `<line x1="0" y1="${i * 64}" x2="1024" y2="${i * 64}" />`).join("")}
    </g>

    <!-- Central energy sphere -->
    <circle cx="512" cy="512" r="320" fill="url(#glow)" filter="url(#neon)" />
    
    <!-- Orbit rings -->
    <ellipse cx="512" cy="512" rx="380" ry="140" fill="none" stroke="hsl(${hue1}, 100%, 70%)" stroke-width="4" transform="rotate(-30 512 512)" opacity="0.8" />
    <ellipse cx="512" cy="512" rx="340" ry="110" fill="none" stroke="hsl(${hue2}, 100%, 75%)" stroke-width="3" transform="rotate(45 512 512)" opacity="0.75" />
    <ellipse cx="512" cy="512" rx="280" ry="90" fill="none" stroke="hsl(${hue3}, 100%, 80%)" stroke-width="2" transform="rotate(15 512 512)" opacity="0.9" />

    <!-- Core geometric crystals -->
    <polygon points="512,240 680,420 620,680 404,680 344,420" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.85" filter="url(#neon)" />
    <polygon points="512,290 640,430 590,630 434,630 384,430" fill="hsl(${hue2}, 90%, 50%)" fill-opacity="0.25" stroke="hsl(${hue1}, 100%, 80%)" stroke-width="2" />
    
    <!-- Energy particles -->
    ${Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const r = 200 + ((hash * (i + 1)) % 180);
      const x = 512 + Math.cos(angle) * r;
      const y = 512 + Math.sin(angle) * r;
      const size = 3 + (i % 5);
      return `<circle cx="${x}" cy="${y}" r="${size}" fill="#ffffff" filter="url(#neon)" opacity="0.9" />`;
    }).join("")}

    <!-- Prompt watermark & badge -->
    <rect x="40" y="900" width="944" height="84" rx="20" fill="#000000" fill-opacity="0.7" stroke="hsl(${hue1}, 80%, 40%)" stroke-width="1.5" />
    <text x="70" y="938" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="22" font-weight="700" letter-spacing="1">XYBOT AI CREATIVE ENGINE • ${style.toUpperCase()}</text>
    <text x="70" y="966" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="18" font-weight="400" opacity="0.9">"${prompt.replace(/</g, "&lt;").substring(0, 65)}${prompt.length > 65 ? "..." : ""}"</text>
  </svg>`;

  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

// 5. Speech to text / Audio transcription
app.post("/api/transcribe", async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(400).json({ error: "GEMINI_API_KEY required for transcription" });
    }

    const cleanBase64 = audioBase64.includes(",") ? audioBase64.split(",")[1] : audioBase64;
    const response = await generateContentWithResilience(
      ai,
      "gemini-3.5-transcribe",
      {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          { text: "Transcribe the spoken audio accurately into text without adding commentary." },
        ],
      },
      {},
      ["gemini-3.5-transcribe", "gemini-2.5-flash", "gemini-3.7-flash"]
    );

    res.json({ transcription: response.text || "" });
  } catch (error: any) {
    console.error("Transcription Error:", error);
    res.status(500).json({ error: error?.message || "Failed to transcribe audio" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ XYBOT AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
