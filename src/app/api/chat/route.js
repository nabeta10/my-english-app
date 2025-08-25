// app/api/chat/route.js

import OpenAI from "openai";

// OpenAIクライアントを初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Vercelに設定したAPIキーを安全に読み込む
});

export async function POST(req) {
  try {
    // ユーザーからのメッセージを受け取る
    const { message } = await req.json();

    // OpenAI APIにリクエストを送信
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // ここで使用するAIモデルを指定
      messages: [
        { role: "system", content: "You are a friendly English conversation partner." },
        { role: "user", content: message },
      ],
    });

    // AIからの返答を取得
    const aiResponse = completion.choices[0].message.content;

    // AIからの返答をフロントエンドに返す
    return new Response(JSON.stringify({ reply: aiResponse }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // エラーハンドリング
    console.error("Error calling OpenAI API:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch response from AI." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
