import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import Customer from "@/models/Customer"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get all orders with pagination
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const orders = await Order.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit)

    const totalOrders = await Order.countDocuments()
    const totalPages = Math.ceil(totalOrders / limit)

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const ordersData = await request.json()

    // Validate if input is an array
    if (!Array.isArray(ordersData)) {
      return NextResponse.json({ error: "Expected an array of orders" }, { status: 400 })
    }

    const createdOrders = []

    for (const orderData of ordersData) {
      const { customerId, customerName, amount, description, orderDate } = orderData

      // Skip invalid entries
      if (!customerId || !customerName || !amount) {
        console.warn("Skipping invalid order:", orderData)
        continue
      }

      // Generate unique order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const order = new Order({
        orderId,
        customerId,
        customerName,
        amount,
        description: description || "",
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        status: "completed",
      })

      await order.save()

      // Update customer's lastActive and visit count
      await Customer.findOneAndUpdate(
        { customerId },
        {
          $inc: { visitCount: 1 },
          $set: { lastActive: new Date() },
        },
        { upsert: false }
      )

      createdOrders.push(order)
    }

    if (createdOrders.length === 0) {
      return NextResponse.json({ error: "No valid orders were created" }, { status: 400 })
    }

    return NextResponse.json({ message: "Orders created", orders: createdOrders }, { status: 201 })
  } catch (error) {
    console.error("Error creating orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { orderId, status } = await request.json()

    // Validate input
    if (!orderId || !["pending", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid order ID or status" }, { status: 400 })
    }

    // Update the order status
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    )

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Order status updated", order: updatedOrder }, { status: 200 })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}