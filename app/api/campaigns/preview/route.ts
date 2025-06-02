import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Customer from "@/models/Customer"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { rules } = await request.json()

    if (!rules || rules.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    // Build MongoDB query from rules
    const query = buildMongoQuery(rules)

    // Count matching customers
    const count = await Customer.countDocuments(query)

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error previewing audience:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function buildMongoQuery(rules: any[]) {
  const conditions: any[] = []

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    const condition: any = {}

    // Handle different field types
    if (rule.field === "lastActive") {
      const days = Number.parseInt(rule.value)
      const date = new Date()
      date.setDate(date.getDate() - days)

      if (rule.operator === ">") {
        condition[rule.field] = { $gt: date }
      } else if (rule.operator === "<") {
        condition[rule.field] = { $lt: date }
      }
    } else {
      const value = Number.parseFloat(rule.value) || rule.value

      switch (rule.operator) {
        case ">":
          condition[rule.field] = { $gt: value }
          break
        case "<":
          condition[rule.field] = { $lt: value }
          break
        case ">=":
          condition[rule.field] = { $gte: value }
          break
        case "<=":
          condition[rule.field] = { $lte: value }
          break
        case "=":
          condition[rule.field] = value
          break
      }
    }

    conditions.push(condition)
  }

  // Combine conditions with AND/OR logic
  if (conditions.length === 1) {
    return conditions[0]
  }

  return { $and: conditions }
}
