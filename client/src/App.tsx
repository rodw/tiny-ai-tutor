import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import useChat from "./hooks/useChat";

import "./styles/style.css";
import "./App.css";
import "./styles/print.css";

export default function App() {
  const { messages, sendMessage, isStreaming, stopStreaming } = useChat();

  return (
    <div className="app-cont">

      <div className="site-head">
        <h1>Tiny AI Tutor</h1>
        <img className="logo-img" src="/logo-192.png" alt="Tiny AI Tutor"/>
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




