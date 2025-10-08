import express from "express";
import fs from "fs";
import OpenAI from "openai";
import path from "path";
import url from "url";
import { debuglog, DebugLoggerFunction } from 'util';
import { loadEnv } from './loadEnv.js';

// load "system-prompt.md"
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const SYSTEM_PROMPT = fs.readFileSync(path.resolve(__dirname, "system-prompt.md"), "utf8");

// load config from  process.env /.env file
const env = loadEnv();

// init debug_log if appropriate
const [DEBUG_ENABLED, debug_log] = initDebug();

// init OpenAI API with given key
const openai = new OpenAI({ apiKey: env.OPENAI_KEY });
debug_log('using OPENAI_MODEL "%s".', env.OPENAI_MODEL);

// init express app
const app = express();
app.use(express.json());

// define our one and only endpoint
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

    let debug_buf = DEBUG_ENABLED ? "" : undefined;
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) {
        res.write(`data: ${JSON.stringify({ delta: delta.content })}\n\n`);
        if (DEBUG_ENABLED && debug_buf) { debug_buf += delta.content; }
      }
    }
    res.write('data: { "done": true }\n\n');
    if (DEBUG_ENABLED) { debug_log("ASSISTANT RESPONSE:\n%s", debug_buf); }
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err?.message ?? "Unknown error" })}\n\n`);
    if (DEBUG_ENABLED) { debug_log("ENCOUNTERED ERROR STREAMING ASSISTANT RESPONSE: %", err); }
  } finally {
    res.end();
  }
});

// listen and report
app.listen(env.SERVER_PORT, () => {
  console.log(`Server listening on http://localhost:${env.SERVER_PORT}`);
});

// some utils used above
interface ChatGptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function initDebug(): [boolean, DebugLoggerFunction] {
  const re = /(^|,)\s*(tiny[-_]ai[-_]tutor[-_]server)\s*(,|$)/i;
  const node_debug = env.NODE_DEBUG ?? process.env.NODE_DEBUG;
  const match = re.exec(node_debug ?? '');
  const debug_enabled = match != null;
  const logger = debug_enabled ? debuglog(match![2]) : () => {};
  if (debug_enabled) {
    logger('DEBUG_ENABLED for "%s" since env.NODE_DEBUG=%s', match[2], node_debug);
  }
  return [debug_enabled, logger];
}
