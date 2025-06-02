import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Customer from "@/models/Customer"
import Order from "@/models/Order"
import Campaign from "@/models/Campaign"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get dashboard statistics
    const [totalCustomers, totalOrders, totalCampaigns, revenueResult] = await Promise.all([
      Customer.countDocuments(),
      Order.countDocuments(),
      Campaign.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    ])

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    return NextResponse.json({
      totalCustomers,
      totalOrders,
      totalCampaigns,
      totalRevenue,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
