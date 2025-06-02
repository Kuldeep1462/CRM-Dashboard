import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Customer from "@/models/Customer"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const customers = await Customer.find({}).sort({ createdAt: -1 })

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()
    const isArray = Array.isArray(data)

    const customersToProcess = isArray ? data : [data]

    const createdCustomers = []

    for (const customer of customersToProcess) {
      const { customerId, name, email, phone, visitCount, lastActive } = customer

      if (!name || !email) {
        return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: `Invalid email format: ${email}` }, { status: 400 })
      }

      // Generate customer ID if not provided
      const finalCustomerId = customerId || `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const existingCustomer = await Customer.findOne({
        $or: [{ email }, { customerId: finalCustomerId }],
      })

      if (existingCustomer) {
        // Update existing customer
        existingCustomer.name = name
        existingCustomer.phone = phone || existingCustomer.phone
        existingCustomer.visitCount = visitCount !== undefined ? visitCount : existingCustomer.visitCount
        existingCustomer.lastActive = lastActive ? new Date(lastActive) : existingCustomer.lastActive

        await existingCustomer.save()
        createdCustomers.push(existingCustomer)
      } else {
        // Create new customer
        const newCustomer = new Customer({
          customerId: finalCustomerId,
          name,
          email,
          phone: phone || "",
          visitCount: visitCount || 1,
          lastActive: lastActive ? new Date(lastActive) : new Date(),
        })
        await newCustomer.save()
        createdCustomers.push(newCustomer)
      }
    }

    return NextResponse.json(isArray ? createdCustomers : createdCustomers[0], { status: isArray ? 201 : 201 })
  } catch (error: any) {
    console.error("Error creating customer(s):", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
