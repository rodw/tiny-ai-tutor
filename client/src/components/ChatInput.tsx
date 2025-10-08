/*
 * Renders input form and action buttons at bottom of chat transcript box.
 */
import { useState, useRef } from "react";
import ExamplePrompts from "./ExamplePrompts";

import styles from "./ChatInput.module.css";

interface ChatInputProps {
  /** post user message content to server */
  sendMessage: (message: string) => Promise<void>;
  /** is currently reading reply from server */
  isStreaming: boolean;
  /** abort reading reply from server */
  stopStreaming: () => void;
}

export default function ChatInput({ sendMessage, isStreaming, stopStreaming }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showPrompts, setShowPrompts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className={`${styles["actions"]} no-print`}>
        <a
          className={isStreaming ? styles["disabled"] : ""}
          href="#"
          onClick={e => {
            e.preventDefault();
            if (!isStreaming) window.print();
          }}
          aria-disabled={isStreaming}
          tabIndex={isStreaming ? -1 : 0}
        >
          Print Transcript
        </a>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            setShowPrompts((v) => !v);
          }}
          tabIndex={0}
        >
          Example Prompts
        </a>
      </div>
      <ExamplePrompts
        isOpen={showPrompts}
        onClose={() => setShowPrompts(false)}
        onSelect={setInput}
        inputRef={inputRef}
      />
      <form
        className={`${styles["form-actions"]} no-print`}
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
          ref={inputRef}
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
    </>
  );
}