"use client";

import { useState } from "react";

// メッセージ一つ一つの「型」を定義します
interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputValue }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage: Message = {
          id: updatedMessages.length + 1,
          text: data.reply,
          sender: "ai",
        };
        setMessages([...updatedMessages, aiMessage]);
      } else {
        throw new Error(data.error || "APIリクエストに失敗しました。");
      }
    } catch (error) {
      console.error("エラー:", error);
      const errorMessage: Message = {
        id: updatedMessages.length + 1,
        text: "エラーが発生しました。しばらくしてからもう一度お試しください。",
        sender: "ai",
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">AI英会話サービス</h1>
      </div>
      
      <div className="bg-gray-100 h-96 p-4 rounded-lg overflow-y-auto mb-4">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center mt-8">
            メッセージを入力してAIとの英会話を始めましょう！
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg max-w-sm ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <span className="inline-block p-2 rounded-lg bg-gray-300 animate-pulse">
              AIが返答を考えています...
            </span>
          </div>
        )}
      </div>

      <div className="flex">
        <input
          type="text"
          className="flex-grow border rounded-l-lg p-2"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          placeholder="メッセージを入力..."
          disabled={isLoading}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-r-lg disabled:bg-gray-400"
          onClick={handleSendMessage}
          disabled={isLoading}
        >
          送信
        </button>
      </div>
    </div>
  );
}