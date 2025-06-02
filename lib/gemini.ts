const GEMINI_API_KEY = process.env.OPENAI_API_KEY
const GEMINI_MODEL = "gemini-2.0-flash"

export async function generateWithGemini(prompt: string, temperature = 0.5, maxTokens = 1000) {
  try {
    console.log(`Generating with Gemini (${GEMINI_MODEL}):`, prompt.substring(0, 100) + "...")

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
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: maxTokens,
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

    // Extract the text from Gemini's response
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!result) {
      throw new Error("No response from Gemini API")
    }

    return result
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    throw error
  }
}
