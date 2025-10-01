import express from "express";
import fs from "fs";
import OpenAI from "openai";
import path from "path";
import url from "url";
import { loadEnv } from './loadEnv.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const SYSTEM_PROMPT = fs.readFileSync(path.resolve(__dirname, "system-prompt.md"), "utf8");

const env = loadEnv();

const openai = new OpenAI({ apiKey: env.OPENAI_KEY });

interface ChatGptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const app = express();

app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const messages: ChatGptMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...((req.body?.messages ?? []) as ChatGptMessage[])
  ];

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
  });

  try {
    const stream = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages,
      stream: true
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) {
        res.write(`data: ${JSON.stringify({ delta: delta.content })}\n\n`);
      }
    }
    res.write('data: { "done": true }\n\n');
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err?.message ?? "Unknown error" })}\n\n`);
  } finally {
    res.end();
  }
});

app.listen(env.SERVER_PORT, () => {
  console.log(`Server listening on http://localhost:${env.SERVER_PORT}`);
});