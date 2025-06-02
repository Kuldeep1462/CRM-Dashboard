import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    // Decode the Google JWT token
    const decoded = jwt.decode(credential) as any

    if (!decoded) {
      return NextResponse.json({ error: "Invalid credential" }, { status: 400 })
    }

    // Extract user information
    const user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    }

    // Create our own JWT token
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })

    return NextResponse.json({
      token,
      user,
    })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
