/*
 * Renders user (student) and assistant (tutor) messages in chat transcript box.
 */
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { ChatGptMessageWithId } from "../types/ChatGptMessageWithId";

import "katex/dist/contrib/mhchem";
import 'katex/dist/katex.min.css';
import './ChatMessages.css';

interface ChatMessagesProps {
  /** current chat history */
  messages: ChatGptMessageWithId[];
  /** is currently reading reply from server */
  isStreaming: boolean;
}

export default function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
  return (
    <div className={`chat-cont${isStreaming ? " is-streaming" : ""}`}>
      {messages
        .filter(m => m.role !== "system")
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
                        return <code>{children}</code>;
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
                    img({ src, alt }) {
                      if (src && src.trim()) {
                        return (
                          <div className="md-img-wrap">
                            <a
                              className="ext-link md-img-src-link"
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img className="md-img" src={src} alt=""/>
                            </a>
                            <a
                              className="ext-link md-img-search-link"
                              href={`https://duckduckgo.com/?q=${encodeURIComponent(src)}&iax=images&ia=images&safesearch=strict`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Source: ${src}`}
                            >
                              [{alt || src}]
                            </a>
                          </div>
                        );
                      } else {
                        return null;
                      }
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
  );
}
