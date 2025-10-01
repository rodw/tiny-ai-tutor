import { useCallback, useRef, useState } from "react";

const TEXT_DECODER = new TextDecoder();
const DATA_COLON = "data:";
const FRAME_DELIM = "\n\n";

interface ChatGptMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

function createMessage(role: ChatGptMessage["role"], content: string, id?: string): ChatGptMessage {
  return { id: id || crypto.randomUUID(), role, content };
}

export function useChat() {
  const [messages, setMessages] = useState<ChatGptMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userText: string) => {
    let newMsgs: ChatGptMessage[] = [];
    setMessages(prevMsgs => {
      newMsgs = [...prevMsgs, createMessage("user", userText)];
      return newMsgs;
    });

    setIsStreaming(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const resp = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: newMsgs.map(({ role, content }) => ({ role, content }))
      }),
      headers: { "Content-Type": "application/json" },
      signal: abortRef.current.signal
    });

    const reader = resp.body?.getReader();

    if (!reader) {
      setIsStreaming(false);
      return;
    } else {
      let responseText = "";
      setMessages(prevMsgs => [...prevMsgs, createMessage("assistant", responseText)]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        } else {
          const chunk = TEXT_DECODER.decode(value, { stream: true });
          for (const frame of chunk.split(FRAME_DELIM)) {
            const line = frame.trim();
            if (!line.startsWith(DATA_COLON)) {
              continue;
            } else {
              const payload = JSON.parse(line.slice(DATA_COLON.length).trim());
              if (payload.delta) {
                responseText += payload.delta;
                setMessages(prevMsgs => {
                  const copy = prevMsgs.slice();
                  const tailMsg = copy[copy.length - 1];
                  copy[copy.length - 1] = { ...tailMsg, content:responseText };
                  return copy;
                });
              } else if (payload.done || payload.error) {
                setIsStreaming(false);
              }
            }
          }
        }
      }
    }
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { messages, sendMessage, isStreaming, stopStreaming };
}
