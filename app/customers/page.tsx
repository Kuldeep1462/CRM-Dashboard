"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Home } from "lucide-react"

interface Customer {
  _id: string
  customerId: string
  name: string
  email: string
  phone: string
  visitCount: number
  lastActive: string
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchCustomers()
  }, [router])

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm),
    )
    setFilteredCustomers(filtered)
  }, [customers, searchTerm])

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
        setFilteredCustomers(data)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCustomerSegment = (visitCount: number, dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays >= 182) {
      return <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    } else if (visitCount > 10) {
      return <Badge className="bg-yellow-100 text-yellow-800">VIP</Badge>
    } else if (visitCount > 5) {
      return <Badge className="bg-blue-100 text-blue-800">Regular</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">New</Badge>
    }
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  if (isLoading) {
    return (
      <div className="clean-background flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading customers...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {customers.length === 0 ? (
          <Card className="interactive-card">
            <CardHeader className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <CardTitle className="text-xl font-bold text-gray-900">No Customers Yet</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Customer data will appear here once you start ingesting data through the API
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="interactive-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Customer Database</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Manage and view all customer information
              </CardDescription>
              <div className="flex items-center space-x-2 mt-4">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers by name, email, customer ID, or phone..."
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
                      <TableHead className="font-semibold text-gray-700">Customer ID</TableHead>
                      <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-700">Visits</TableHead>
                      <TableHead className="font-semibold text-gray-700">Last Active</TableHead>
                      <TableHead className="font-semibold text-gray-700">Segment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-medium text-gray-900">{customer.customerId}</TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-gray-900 font-medium">{customer.email}</div>
                            <div className="text-gray-600">{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900">{customer.visitCount}</TableCell>
                        <TableCell className="text-gray-700">{formatLastActive(customer.lastActive)}</TableCell>
                        <TableCell>{getCustomerSegment(customer.visitCount, customer.lastActive)}</TableCell>
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
