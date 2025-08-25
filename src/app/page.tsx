"use client";

export const dynamic = "force-dynamic"; // ★★★ この行を追加 ★★★

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

// ★★★ ここから追加 ★★★
// メッセージ一つ一つの「型」を定義します
interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}
// ★★★ ここまで追加 ★★★

export default function Home() {
  const { data: session, status } = useSession();
  const [inputValue, setInputValue] = useState("");
  // ★★★ ここを修正 ★★★
  // messages が Message の配列であることを指定します
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { // ← 型を指定
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
        const aiMessage: Message = { // ← 型を指定
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
      const errorMessage: Message = { // ← 型を指定
        id: updatedMessages.length + 1,
        text: "エラーが発生しました。しばらくしてからもう一度お試しください。",
        sender: "ai",
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ... ここから下の return (...) の部分は変更ありません ...
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">AI英会話サービスへようこそ</h1>
        <p className="mb-8">ログインしてください</p>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
        >
          Googleでログイン
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">読み込み中...</div>;
  }

  return (
    <div className="font-sans max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">AI英会話サービス</h1>
        <div>
          <span className="text-sm mr-4">{session?.user?.name}</span>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded"
          >
            ログアウト
          </button>
        </div>
      </div>
      
      <div className="bg-gray-100 h-96 p-4 rounded-lg overflow-y-auto mb-4">
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
        {isLoading && <div className="text-left"><span className="inline-block p-2 rounded-lg bg-gray-300 animate-pulse">...</span></div>}
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