import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy for chatbot interactions
  // In a real app, this would verify the request origin and fetch the vendor's API key from Firestore
  app.post("/api/chat-proxy", async (req, res) => {
    const { message, chatbotId, history, apiKey, systemPrompt } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "Missing API Key" });
    }

    try {
      const genai = (await import("@google/genai")) as any;
      const genAI = new genai.GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const chat = model.startChat({
        history: history || [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      // Include system prompt if provided
      const prompt = systemPrompt ? `System: ${systemPrompt}\n\nUser: ${message}` : message;
      
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({ text });
    } catch (error: any) {
      console.error("Chat Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
