import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import useChat from "./hooks/useChat";

import "./styles/globals.css";
import styles from "./App.module.css";

export default function App() {
  const { messages, sendMessage, isStreaming, stopStreaming } = useChat();

  return (
    <div className={styles["app-cont"]}>

      <div className={styles["site-head"]}>
        <h1>Tiny AI Tutor</h1>
        <img className={styles["logo-img"]} src="/logo-192.png" alt="Tiny AI Tutor"/>
      </div>

      <ChatMessages
        messages={messages}
        isStreaming={isStreaming}
      />

      <ChatInput
        sendMessage={sendMessage}
        isStreaming={isStreaming}
        stopStreaming={stopStreaming}
      />

    </div>
  );
}




