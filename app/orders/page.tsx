"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, ShoppingCart, Home, Search, Calendar, DollarSign } from "lucide-react"

interface Order {
  _id: string
  orderId: string
  customerId: string
  customerName: string
  amount: number
  status: "pending" | "completed" | "cancelled"
  orderDate: string
  description: string
  createdAt: string
}

interface NewOrder {
  customerId: string
  customerName: string
  amount: string
  description: string
  orderDate: string
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newOrder, setNewOrder] = useState<NewOrder>({
    customerId: "",
    customerName: "",
    amount: "",
    description: "",
    orderDate: new Date().toISOString().split("T")[0],
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchOrders()
  }, [router])

  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredOrders(filtered)
  }, [orders, searchTerm])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || data)
        setFilteredOrders(data.orders || data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrder.customerId || !newOrder.customerName || !newOrder.amount) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newOrder,
          amount: Number.parseFloat(newOrder.amount),
        }),
      })

      if (response.ok) {
        const createdOrder = await response.json()
        setOrders((prev) => [createdOrder, ...prev])
        setNewOrder({
          customerId: "",
          customerName: "",
          amount: "",
          description: "",
          orderDate: new Date().toISOString().split("T")[0],
        })
        setIsDialogOpen(false)
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Failed to create order")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
      completed: { bg: "bg-green-100", text: "text-green-800" },
      cancelled: { bg: "bg-red-100", text: "text-red-800" },
    }

    const variant = variants[status as keyof typeof variants] || variants.completed

    return <Badge className={`${variant.bg} ${variant.text}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTotalRevenue = () => {
    return orders.filter((order) => order.status === "completed").reduce((sum, order) => sum + order.amount, 0)
  }

  if (isLoading) {
    return (
      <div className="clean-background flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="clean-background min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/")} className="nav-button">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900">Create New Order</DialogTitle>
                  <DialogDescription className="text-gray-600 font-medium">
                    Add a new customer order to the system
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <div>
                    <Label htmlFor="customerId" className="text-sm font-semibold text-gray-700">
                      Customer ID *
                    </Label>
                    <Input
                      id="customerId"
                      value={newOrder.customerId}
                      onChange={(e) => setNewOrder((prev) => ({ ...prev, customerId: e.target.value }))}
                      placeholder="CUST-123456"
                      className="form-input mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerName" className="text-sm font-semibold text-gray-700">
                      Customer Name *
                    </Label>
                    <Input
                      id="customerName"
                      value={newOrder.customerName}
                      onChange={(e) => setNewOrder((prev) => ({ ...prev, customerName: e.target.value }))}
                      placeholder="John Doe"
                      className="form-input mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                      Amount (₹) *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newOrder.amount}
                      onChange={(e) => setNewOrder((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="1500.00"
                      className="form-input mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderDate" className="text-sm font-semibold text-gray-700">
                      Order Date
                    </Label>
                    <Input
                      id="orderDate"
                      type="date"
                      value={newOrder.orderDate}
                      onChange={(e) => setNewOrder((prev) => ({ ...prev, orderDate: e.target.value }))}
                      className="form-input mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newOrder.description}
                      onChange={(e) => setNewOrder((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Order details..."
                      className="form-input mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1 nav-button"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1 btn-primary">
                      {isSubmitting ? "Creating..." : "Create Order"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="interactive-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Orders</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
              <p className="text-xs text-gray-600 mt-1">All time orders</p>
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Revenue</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{getTotalRevenue().toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">From completed orders</p>
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Avg Order Value</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ₹{orders.length > 0 ? Math.round(getTotalRevenue() / orders.length).toLocaleString() : 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Average per order</p>
            </CardContent>
          </Card>
        </div>

        {orders.length === 0 ? (
          <Card className="interactive-card">
            <CardHeader className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <CardTitle className="text-xl font-bold text-gray-900">No Orders Yet</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Start by adding your first customer order
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-12">
              <Button onClick={() => setIsDialogOpen(true)} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add First Order
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="interactive-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Order History</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Track and manage all customer orders
              </CardDescription>
              <div className="flex items-center space-x-2 mt-4">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID, customer ID, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm form-input"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Order ID</TableHead>
                      <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Order Date</TableHead>
                      <TableHead className="font-semibold text-gray-700">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium text-gray-900">{order.orderId}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-sm text-gray-600">{order.customerId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900">₹{order.amount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-gray-700">{formatDate(order.orderDate)}</TableCell>
                        <TableCell className="text-gray-600 max-w-xs truncate">
                          {order.description || "No description"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
