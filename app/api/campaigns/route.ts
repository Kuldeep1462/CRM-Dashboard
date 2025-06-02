import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Campaign from "@/models/Campaign"
import Customer from "@/models/Customer"
import CommunicationLog from "@/models/CommunicationLog"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { name, description, rules, message } = await request.json()

    // Validate required fields
    if (!name || !message || !rules || rules.length === 0) {
      return NextResponse.json({ error: "Name, message, and rules are required" }, { status: 400 })
    }

    // Build MongoDB query from rules
    const query = buildMongoQuery(rules)

    // Get matching customers
    const customers = await Customer.find(query)

    // Create campaign
    const campaign = new Campaign({
      name,
      description,
      rules,
      message,
      targetCount: customers.length,
      status: "active",
      createdBy: user.id,
    })

    await campaign.save()

    // Simulate message delivery
    await simulateMessageDelivery(campaign._id, customers, message)

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error("Error creating campaign:", error)
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

  // For simplicity, we'll use AND for all conditions
  // In a real implementation, you'd parse the logic operators
  return { $and: conditions }
}

async function simulateMessageDelivery(campaignId: string, customers: any[], message: string) {
  const deliveryPromises = customers.map(async (customer) => {
    // Simulate 90% success rate
    const isSuccess = Math.random() > 0.1
    const status = isSuccess ? "SENT" : "FAILED"

    // Personalize message
    const personalizedMessage = message.replace("{name}", customer.name)

    // Create communication log
    const log = new CommunicationLog({
      campaignId,
      customerId: customer._id,
      message: personalizedMessage,
      status,
      sentAt: new Date(),
    })

    await log.save()

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100))

    return { customerId: customer._id, status }
  })

  const results = await Promise.all(deliveryPromises)

  // Update campaign statistics
  const sentCount = results.length
  const deliveredCount = results.filter((r) => r.status === "SENT").length
  const failedCount = results.filter((r) => r.status === "FAILED").length

  await Campaign.findByIdAndUpdate(campaignId, {
    sentCount,
    deliveredCount,
    failedCount,
    status: "completed",
  })
}
