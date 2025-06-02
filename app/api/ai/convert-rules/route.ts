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

    const { input } = await request.json()

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 })
    }

    console.log("Converting natural language with Gemini:", input)

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
                  text: `You are an AI assistant that converts natural language descriptions into structured rules for customer segmentation. 

Available fields:
- totalSpend (number): Total amount spent by customer
- visitCount (number): Number of visits/orders
- lastActive (date): Last activity date

Available operators: >, <, >=, <=, =

Convert the natural language input into a JSON array of rules with this structure:
{
  "rules": [
    {
      "id": "unique_id",
      "field": "field_name",
      "operator": "operator",
      "value": "value",
      "logic": "AND" or "OR" (for rules after the first one)
    }
  ]
}

For date-based conditions like "haven't shopped in X months/days", convert to days and use lastActive field.
For spending conditions, use totalSpend field.
For visit/order frequency, use visitCount field.

Return ONLY valid JSON, no additional text or formatting.

Convert this natural language description to rules: "${input}"`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
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
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    console.log("Extracted AI Response:", aiResponse)

    if (!aiResponse) {
      throw new Error("No response from AI")
    }

    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = aiResponse.trim().replace(/```json\n?|\n?```/g, "")
      const rules = JSON.parse(cleanedResponse)

      console.log("Parsed rules:", rules)

      // Validate the structure
      if (!rules.rules || !Array.isArray(rules.rules)) {
        throw new Error("Invalid rules structure")
      }

      // Add unique IDs if missing
      rules.rules = rules.rules.map((rule, index) => ({
        ...rule,
        id: rule.id || `rule_${Date.now()}_${index}`,
      }))

      return NextResponse.json(rules)
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      console.error("Raw AI response:", aiResponse)

      // Return a default rule based on the input
      const defaultRules = {
        rules: [
          {
            id: `rule_${Date.now()}`,
            field: "totalSpend",
            operator: ">",
            value: "1000",
            logic: "AND",
          },
        ],
      }

      return NextResponse.json(defaultRules)
    }
  } catch (error) {
    console.error("Error converting natural language:", error)
    return NextResponse.json(
      {
        error: "Failed to convert natural language",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
