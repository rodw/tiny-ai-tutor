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
import styles from './ChatMessages.module.css';

interface ChatMessagesProps {
  /** current chat history */
  messages: ChatGptMessageWithId[];
  /** is currently reading reply from server */
  isStreaming: boolean;
}

export default function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
  return (
      <div className={[styles["chat-cont"], isStreaming ? styles["is-streaming"] : ""].join(" ")}>
      {messages
        .filter(m => m.role !== "system")
        .map((m) => (
          <div
            key={m.id}
            className={[
              styles["chat-msg"],
              styles["md-msg"],
              m.role === "user" ? styles["usr-sent"] : styles["tut-sent"]
            ].join(" ")}>
            <span className={styles["msg-sender"]}>
              {m.role === "user" ? "You" : "Tutor"}
            </span>
            <div className={styles["msg-body"]}>
              {m.role === "assistant" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeSanitize, rehypeKatex]}
                  components={{
                    code({ className, children }) {
                      if (className) {
                        return (
                          <pre className={`${styles["code-block"]} ${className || ""}`}>
                            <code>{children}</code>
                          </pre>
                        );
                      } else {
                        return <code>{children}</code>;
                      }
                    },
                    table({ children }) {
                      return (
                        <div className={styles["tbl-wrap"]}>
                          <table>{children}</table>
                        </div>
                      );
                    },
                    a({ href, children }) {
                      return (
                        <a
                          className={styles["ext-link"]}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      );
                    },
                    img({ src, alt }) {
                      if (src && src.trim()) {
                        return (
                          <div className={styles["md-img-wrap"]}>
                            <a
                              className={`${styles["ext-link"]} ${styles["md-img-src-link"]}`}
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                className={styles["md-img"]}
                                src={src}
                                alt=""
                              />
                            </a>
                            <a
                              className={`${styles["ext-link"]} ${styles["md-img-search-link"]}`}
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
