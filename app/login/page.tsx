"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Users, MessageSquare, TrendingUp, Shield } from "lucide-react"

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      router.push("/")
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        })

        window.google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
          theme: "outline",
          size: "large",
          width: 300,
          shape: "rectangular",
          text: "signin_with",
        })
      }
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [router])

  const handleCredentialResponse = async (response: any) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: response.credential }),
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/")
      } else {
        console.error("Authentication failed")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error during authentication:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="clean-background min-h-screen flex items-center justify-center p-4">
      <div className="login-container w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Mini CRM</h1>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold login-text mb-4">Supercharge Your Customer Relationships</h2>

          <p className="text-lg login-subtitle mb-8">
            AI-powered CRM platform that helps you create targeted campaigns, manage customers, and grow your business
            with intelligent automation.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="feature-card flex items-center space-x-3 p-4 rounded-lg hover-lift">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm login-text">Customer Management</h3>
                <p className="text-xs login-subtitle">Organize & track customers</p>
              </div>
            </div>

            <div className="feature-card flex items-center space-x-3 p-4 rounded-lg hover-lift">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm login-text">AI Campaigns</h3>
                <p className="text-xs login-subtitle">Smart targeting & messaging</p>
              </div>
            </div>

            <div className="feature-card flex items-center space-x-3 p-4 rounded-lg hover-lift">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm login-text">Analytics</h3>
                <p className="text-xs login-subtitle">Real-time insights</p>
              </div>
            </div>

            <div className="feature-card flex items-center space-x-3 p-4 rounded-lg hover-lift">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm login-text">Secure</h3>
                <p className="text-xs login-subtitle">Enterprise-grade security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md login-card">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold gradient-text">Welcome Back</CardTitle>
              <CardDescription className="login-subtitle">
                Sign in with your Google account to access your CRM dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="spinner"></div>
                  <p className="text-sm login-subtitle">Signing you in...</p>
                </div>
              ) : (
                <>
                  <div id="google-signin-button" className="hover-lift"></div>

                  <div className="flex items-center space-x-2 text-sm login-subtitle">
                    <Shield className="w-4 h-4" />
                    <span>Secure authentication powered by Google OAuth 2.0</span>
                  </div>
                </>
              )}

              <div className="text-center">
                <p className="text-xs login-subtitle mb-2">Trusted by businesses worldwide</p>
                <div className="flex items-center justify-center space-x-4 text-xs login-subtitle">
                  <span>🔒 SSL Encrypted</span>
                  <span>•</span>
                  <span>🛡️ GDPR Compliant</span>
                  <span>•</span>
                  <span>⚡ Fast & Reliable</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
