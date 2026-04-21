import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CaptionOption {
  headline: string;
  description: string;
}

export async function generateCaptions(
  productDescription: string,
  imageUri?: string
): Promise<CaptionOption[]> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `Bạn là một content creator chuyên viết caption viral cho TikTok/Reels bán hàng tại Việt Nam.
Nhiệm vụ: Dựa trên hình ảnh hoặc mô tả sản phẩm, hãy tạo ra 5 option caption.
Yêu cầu phong cách:
- Giọng văn tự nhiên, như người thật nói.
- Hơi "lầy", bắt trend, relatable.
- Dùng từ đơn giản, không quá trang trọng.
- Ưu tiên so sánh thú vị (ví dụ: giá = 2 ly trà sữa, đẹp như crush, etc.).
- Dòng tiêu đề PHẢI VIẾT HOA và gây tò mò.
- Mô tả ngắn gọn (1-2 câu), có giải thích và twist hài hước.
- Tránh lặp lại, mỗi option mang một vibe khác nhau.`;

  const contents: any[] = [];
  
  if (imageUri) {
    const base64Data = imageUri.split(",")[1];
    const mimeType = imageUri.split(",")[0].split(":")[1].split(";")[0];
    contents.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    });
  }

  contents.push({
    text: `Hãy tạo caption cho sản phẩm này: ${productDescription}`,
  });

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: "Tiêu đề IN HOA gây tò mò" },
            description: { type: Type.STRING, description: "Mô tả ngắn kèm twist" },
          },
          required: ["headline", "description"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
}
