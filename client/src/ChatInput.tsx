import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  sendMessage: (message: string) => Promise<void>;
  isStreaming: boolean;
  stopStreaming: () => void;
}

const EXAMPLE_PROMPTS = [
  "Pretend you’re quizzing me in a debate format: argue one side of Federalism vs Anti-Federalism then let me respond.",
  "Can you walk me through a practice problem using the Pythagorean theorem?",
  "I have biology test coming up on Cellular Respiration. Help me prepare a study guide that covers the chemical and metabolic compounds, reactions, processes and cycles that take place. What are the stages of cellular respiration? What other concepts and vocabulary will I need to know?",
  "Why is the number phi called the Golden Ratio? What does it have to do with the Fibonacci sequence? Can I use phi to compute Fn?"
];

export default function ChatInput({ sendMessage, isStreaming, stopStreaming }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showPrompts, setShowPrompts] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Modal scroll: block page scroll when modal open
  useEffect(() => {
    if (showPrompts) {
      document.body.classList.add("example-prompts-open");
    } else {
      document.body.classList.remove("example-prompts-open");
    }
    return () => {
      document.body.classList.remove("example-prompts-open");
    };
  }, [showPrompts]);

  // Dismiss menu on click outside or ESC
  useEffect(() => {
    if (!showPrompts) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setShowPrompts(false);
      }
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPrompts(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escHandler);
    };
  }, [showPrompts]);

  return (
    <>
      <div className="actions">
        <a
          className={`print-link${isStreaming ? " disabled" : ""}`}
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
          className="example-prompts-link"
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
      {showPrompts && (
        <div className="example-prompts-overlay">
          <div className="example-prompts-menu" ref={menuRef} tabIndex={-1}>
            <div className="example-prompts-header">
              <div>Example Prompts</div>
              <button
                className="example-prompts-close"
                type="button"
                onClick={() => setShowPrompts(false)}
                aria-label="Close example prompts menu"
              >×</button>
            </div>
            <div className="example-prompts-content">
              <ul>
                {EXAMPLE_PROMPTS.map((p, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="example-prompt-link"
                      tabIndex={0}
                      onClick={e => {
                        e.preventDefault();
                        setInput(p);
                        setShowPrompts(false);
                        setTimeout(() => {
                          inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          inputRef.current?.focus();
                        }, 0);
                      }}
                    >
                      {p}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="example-prompts-footer">
              <button
                className="example-prompts-cancel"
                type="button"
                onClick={() => setShowPrompts(false)}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
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