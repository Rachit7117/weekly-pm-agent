import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateJSON<T>(prompt: string, model = 'gemini-2.0-flash'): Promise<T> {
  const geminiModel = genAI.getGenerativeModel({
    model,
    generationConfig: { responseMimeType: 'application/json' },
  })
  const result = await geminiModel.generateContent(prompt)
  const text = result.response.text()
  return JSON.parse(text) as T
}

export async function generateText(prompt: string, model = 'gemini-2.0-flash'): Promise<string> {
  const geminiModel = genAI.getGenerativeModel({ model })
  const result = await geminiModel.generateContent(prompt)
  return result.response.text()
}
