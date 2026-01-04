import express from "express";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "./apikey.js";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

// Gemini SDKを初期化
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// 外部SDKから取得したものを想定した擬似メタデータ
const fakeMetadataFromSdk = {
  cameraId: "B1-ENT-03",
  location: "Basement Entrance",
  period: "2026-01-01 ~ 2026-01-04",
  hourlySummary: [
    {
      date: "2026-01-01",
      hours: [
        { hour: "00-06", objectCount: 1, motionEvents: 1 },
        { hour: "06-12", objectCount: 4, motionEvents: 2 },
        { hour: "12-18", objectCount: 5, motionEvents: 3 },
        { hour: "18-24", objectCount: 2, motionEvents: 1 }
      ]
    },
    {
      date: "2026-01-02",
      hours: [
        { hour: "00-06", objectCount: 27, motionEvents: 14 },
        { hour: "06-12", objectCount: 3, motionEvents: 1 },
        { hour: "12-18", objectCount: 4, motionEvents: 2 },
        { hour: "18-24", objectCount: 6, motionEvents: 3 }
      ]
    },
    {
      date: "2026-01-03",
      hours: [
        { hour: "00-06", objectCount: 2, motionEvents: 1 },
        { hour: "06-12", objectCount: 5, motionEvents: 2 },
        { hour: "12-18", objectCount: 6, motionEvents: 3 },
        { hour: "18-24", objectCount: 3, motionEvents: 1 }
      ]
    },
    {
      date: "2026-01-04",
      hours: [
        { hour: "00-06", objectCount: 1, motionEvents: 1 },
        { hour: "06-12", objectCount: 4, motionEvents: 2 },
        { hour: "12-18", objectCount: 5, motionEvents: 3 },
        { hour: "18-24", objectCount: 2, motionEvents: 1 }
      ]
    }
  ]
};

// メタデータ取得
app.get("/metadata", (req, res) => {
  res.json(fakeMetadataFromSdk);
});

// AIで分析
app.post("/analyze", async (req, res) => {
  const metadata = req.body;

const prompt = `
  以下は防犯用監視カメラのメタデータです。
  事件の発生時間は不明です。

  4日間のデータを比較し、
  通常と異なる変化が見られる日時・時間帯を抽出してください。
  断定はせず、調査の参考としてください。

  【出力条件】
  最大3行
  箇条書き不可
  簡潔な文章のみ
  結論と理由、調査優先度を含める

  【出力例（形式例・内容は仮）】
  2025年12月28日 18:00〜24:00に、他の日よりも人の出入りが増加しています。
  通常より活動が集中しており、イベントや一時的な利用増加の可能性が考えられます。
  調査の参考として、この時間帯を補足的に確認する価値があります。

  【注意】
  上記の出力例は形式のみの参考です。
  実際のメタデータに基づいて回答してください。

  ${JSON.stringify(metadata, null, 2)}
`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  res.json({ text: result.text });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
