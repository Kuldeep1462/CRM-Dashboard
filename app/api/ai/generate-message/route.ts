import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

const GEMINI_API_KEY = process.env.OPENAI_API_KEY
const GEMINI_MODEL = "gemini-2.0-flash"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { campaignName, description } = await request.json()

    console.log("Generating message with Gemini for:", { campaignName, description })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a marketing copywriter specializing in personalized customer communications. Create engaging, personalized marketing messages that:

1. Use a friendly, conversational tone
2. Include personalization placeholder {name}
3. Are concise but compelling
4. Include a clear call-to-action
5. Are appropriate for Indian customers (use ₹ for currency)

Return only the message text, no additional formatting or explanation.

Create a personalized marketing message for a campaign called "${campaignName}" with description: "${description}". The message should be engaging and include the {name} placeholder for personalization.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error:", response.status, errorText)
      throw new Error(`API request failed: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log("Gemini API response:", JSON.stringify(data, null, 2))

    // Extract the text from Gemini's response
    const message = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    console.log("Generated message:", message)

    if (!message) {
      throw new Error("No message generated")
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error generating message:", error)

    // Return a fallback message
    const fallbackMessage = `Hi {name}, we have a special offer just for you! Don't miss out on this exclusive deal. Shop now and save big! 🎉`

    return NextResponse.json({
      message: fallbackMessage,
      note: "Fallback message used due to AI service error",
    })
  }
}
