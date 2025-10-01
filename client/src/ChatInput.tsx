import { useState } from "react";

interface ChatInputProps {
  sendMessage: (message: string) => Promise<void>;
  isStreaming: boolean;
  stopStreaming: () => void;
}

export default function ChatInput({ sendMessage, isStreaming, stopStreaming }: ChatInputProps) {
  const [input, setInput] = useState("");

  return (
    <form
      className="form-actions"
      onSubmit={e => {
        e.preventDefault();
        if (!input.trim() || isStreaming) {
          return;
        } else {
          void sendMessage(input.trim());
          setInput("");
        }
      }}
    >
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="What would you like to learn next?"
        autoFocus={true}
      />
      <button type="submit" disabled={isStreaming || !input.trim()}>
        Send
      </button>
      <button type="button" onClick={stopStreaming} disabled={!isStreaming}>
        Stop
      </button>
    </form>
  );
}