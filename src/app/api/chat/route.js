// app/api/chat/route.js

import OpenAI from "openai";

// OpenAIクライアントを初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Vercelに設定したAPIキーを安全に読み込む
});

export async function POST(req) {
  try {
    // APIキーの存在確認
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      return new Response(JSON.stringify({ 
        error: "API key not configured" 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ユーザーからのメッセージを受け取る
    const { message } = await req.json();

    if (!message || message.trim() === "") {
      return new Response(JSON.stringify({ 
        error: "Message is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Sending request to OpenAI with message:", message);

    // OpenAI APIにリクエストを送信
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 軽量で高性能なモデルを使用
      messages: [
        { role: "system", content: "You are a friendly English conversation partner. Help the user practice English conversation in a natural and encouraging way." },
        { role: "user", content: message },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    // AIからの返答を取得
    const aiResponse = completion.choices[0].message.content;
    console.log("OpenAI response:", aiResponse);

    // AIからの返答をフロントエンドに返す
    return new Response(JSON.stringify({ reply: aiResponse }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // エラーハンドリング
    console.error("Error calling OpenAI API:", error);
    console.error("Error details:", error.message);
    console.error("Error status:", error.status);
    console.error("Error code:", error.code);
    
    let errorMessage = "Failed to fetch response from AI.";
    
    if (error.status === 401) {
      errorMessage = "Invalid API key";
    } else if (error.status === 429) {
      errorMessage = "Rate limit exceeded or quota insufficient. Please check your OpenAI billing.";
    } else if (error.status === 403) {
      errorMessage = "Access denied. Please check your API key permissions.";
    } else if (error.code === 'insufficient_quota') {
      errorMessage = "OpenAI credit balance is insufficient. Please add credits to your account.";
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.message 
    }), {
      status: error.status || 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
