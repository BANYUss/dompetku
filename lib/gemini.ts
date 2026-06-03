import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
})

/** Extract a JSON array from Gemini output (strips markdown backticks). */
export function extractJsonArray(text: string): unknown[] | null {
  const clean = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()
  const match  = clean.match(/\[[\s\S]*\]/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0])
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}
