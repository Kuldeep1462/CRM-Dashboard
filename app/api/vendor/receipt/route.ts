import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import CommunicationLog from "@/models/CommunicationLog"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { messageId, status } = await request.json()

    // Validate required fields
    if (!messageId || !status) {
      return NextResponse.json({ error: "Message ID and status are required" }, { status: 400 })
    }

    // Update communication log
    const log = await CommunicationLog.findByIdAndUpdate(
      messageId,
      {
        status,
        deliveredAt: status === "DELIVERED" ? new Date() : undefined,
      },
      { new: true },
    )

    if (!log) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, log })
  } catch (error) {
    console.error("Error updating delivery status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
