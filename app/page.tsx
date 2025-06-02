"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, MessageSquare, TrendingUp, Sparkles, Zap, Target } from "lucide-react"

interface DashboardStats {
  totalCustomers: number
  totalOrders: number
  totalCampaigns: number
  totalRevenue: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalOrders: 0,
    totalCampaigns: 0,
    totalRevenue: 0,
  })
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
    fetchDashboardStats()
  }, [router])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="clean-background flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your CRM dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="clean-background min-h-screen">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold gradient-text">Mini CRM</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={user?.picture || "/placeholder.svg?height=32&width=32"}
                    alt={user?.name || "User"}
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                  <span className="text-sm text-gray-600 font-medium">Welcome, {user?.name}</span>
                </div>
                <Button variant="outline" onClick={handleLogout} className="nav-button">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
            <p className="text-gray-600 font-medium">
              Manage your customers, orders, campaigns, and grow your business
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="dashboard-card hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">Total Customers</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</div>
                <p className="text-xs text-gray-600 mt-1">Active customer base</p>
              </CardContent>
            </Card>

            <Card className="dashboard-card hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">Total Orders</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalOrders}</div>
                <p className="text-xs text-gray-600 mt-1">Completed orders</p>
              </CardContent>
            </Card>

            <Card className="dashboard-card hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">Campaigns</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.totalCampaigns}</div>
                <p className="text-xs text-gray-600 mt-1">Marketing campaigns</p>
              </CardContent>
            </Card>

            <Card className="dashboard-card hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">Total Revenue</CardTitle>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">₹{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-gray-600 mt-1">Total earnings</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="dashboard-card hover-lift">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900 font-bold">Create Campaign</CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                      Build audience segments with AI
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full nav-button"
                  onClick={() => router.push("/campaigns/create")}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Button>
              </CardContent>
            </Card>

            <Card className="dashboard-card hover-lift">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900 font-bold">View Campaigns</CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                      Monitor performance and delivery
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full nav-button" onClick={() => router.push("/campaigns")}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View All Campaigns
                </Button>
              </CardContent>
            </Card>

            <Card className="dashboard-card hover-lift">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900 font-bold">Customer Data</CardTitle>
                    <CardDescription className="text-gray-600 font-medium">Manage customer information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full nav-button" onClick={() => router.push("/customers")}>
                  <Zap className="w-4 h-4 mr-2" />
                  View Customers
                </Button>
              </CardContent>
            </Card>

            <Card className="dashboard-card hover-lift">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900 font-bold">Order Management</CardTitle>
                    <CardDescription className="text-gray-600 font-medium">Track and manage orders</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full nav-button" onClick={() => router.push("/orders")}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Orders
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Feature Highlights */}
          <div className="dashboard-card rounded-lg p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold gradient-text mb-3">Powered by Gemini AI</h3>
              <p className="text-gray-600 font-medium">Advanced features to supercharge your marketing campaigns</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-gray-900 font-bold mb-2">AI Rule Builder</h4>
                <p className="text-sm text-gray-600 font-medium">
                  Convert natural language to targeting rules automatically
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-gray-900 font-bold mb-2">Smart Campaigns</h4>
                <p className="text-sm text-gray-600 font-medium">
                  AI-generated personalized messages for better engagement
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-gray-900 font-bold mb-2">Order Tracking</h4>
                <p className="text-sm text-gray-600 font-medium">
                  Complete order management with real-time revenue tracking
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
