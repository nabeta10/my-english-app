// "use client" は、useStateなどの機能を使うために必要な「おまじない」です。
"use client";

import { useState } from "react";

export default function Home() {
  // 画面の状態を管理するための「useState」という仕組みを使います。
  // 1. 入力欄の文字を保存する場所 (inputValue)
  // 2. 会話の履歴（メッセージのリスト）を保存する場所 (messages)
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);

  // 送信ボタンが押されたときの処理
  const handleSendMessage = () => {
    // 入力欄が空っぽの場合は何もしない
    if (!inputValue.trim()) return;

    // 新しいメッセージを作成
    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user", // 送信者を 'user' とする
    };

    // 会話履歴に新しいメッセージを追加する
    // ...messages は「今までの履歴」という意味です
    setMessages([...messages, newMessage]);

    // 入力欄を空にする
    setInputValue("");
  };

  return (
    <div className="font-sans max-w-2xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center my-8">
        AI英会話サービス
      </h1>

      {/* 会話の履歴を表示するエリア */}
      <div className="bg-gray-100 h-96 p-4 rounded-lg overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 ${
              message.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
      </div>

      {/* メッセージ入力欄と送信ボタン */}
      <div className="flex">
        <input
          type="text"
          className="flex-grow border rounded-l-lg p-2"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="メッセージを入力..."
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-r-lg"
          onClick={handleSendMessage}
        >
          送信
        </button>
      </div>
    </div>
  );
}