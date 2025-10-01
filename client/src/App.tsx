import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import ChatInput from "./ChatInput";
import { useChat } from "./useChat";

import 'katex/dist/katex.min.css';
import "./style.css";

export default function App() {
  const { messages, sendMessage, isStreaming, stopStreaming } = useChat();

  return (
    <div className="app-cont">
      <div className="site-head">
        <h1>Tiny AI Tutor</h1>
        <img className="logo-img" src="/logo-192.png" alt="Tiny AI Tutor"/>
      </div>


      <div className="chat-cont">
        {messages
          .filter(m => m.role != "system")
          .map((m) => (
            <div
              key={m.id}
              className={`chat-msg md-msg ${m.role === "user" ? "usr-sent" : "tut-sent"}`}>
              <span className="msg-sender">
                {m.role === "user" ? "You" : "Tutor"}
              </span>
              <div className="msg-body">
                {m.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeSanitize, rehypeKatex]}
                    components={{
                      code({ className, children }) {
                        if (className) {
                          return (
                            <pre className={`code-block ${className}`}>
                              <code>{children}</code>
                            </pre>
                          );
                        } else {
                          return (
                            <code>{children}</code>
                          );
                        }
                      },
                      table({ children }) {
                        return (
                          <div className="tbl-wrap">
                            <table>{children}</table>
                          </div>
                        );
                      },
                      a({ href, children }) {
                        return (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="ext-link">
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  <p>{m.content}</p>
                )}
              </div>
            </div>
          ))}
      </div>
      <ChatInput
        sendMessage={sendMessage}
        isStreaming={isStreaming}
        stopStreaming={stopStreaming}
      />
    </div>
  );
}




