"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Eye, MessageSquare, Home } from "lucide-react"

interface Campaign {
  _id: string
  name: string
  description: string
  status: "draft" | "active" | "completed"
  targetCount: number
  sentCount: number
  deliveredCount: number
  failedCount: number
  createdAt: string
  message: string
  rules: any[]
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchCampaigns()
  }, [router])

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/campaigns", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCampaigns(data)
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { bg: "bg-gray-100", text: "text-gray-800" },
      active: { bg: "bg-blue-100", text: "text-blue-800" },
      completed: { bg: "bg-green-100", text: "text-green-800" },
    }

    const variant = variants[status as keyof typeof variants] || variants.draft

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant.bg} ${variant.text}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getDeliveryRate = (delivered: number, sent: number) => {
    if (sent === 0) return "0%"
    return `${Math.round((delivered / sent) * 100)}%`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/")} className="nav-button">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            </div>
            <Button onClick={() => router.push("/campaigns/create")} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {campaigns.length === 0 ? (
          <Card className="interactive-card">
            <CardHeader className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <CardTitle className="text-xl font-bold text-gray-900">No Campaigns Yet</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Create your first campaign to start engaging with customers
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-12">
              <Button onClick={() => router.push("/campaigns/create")} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="interactive-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Campaign History</CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Monitor your campaign performance and delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="table-header">Campaign Name</TableHead>
                      <TableHead className="table-header">Status</TableHead>
                      <TableHead className="table-header">Target Audience</TableHead>
                      <TableHead className="table-header">Sent</TableHead>
                      <TableHead className="table-header">Delivered</TableHead>
                      <TableHead className="table-header">Failed</TableHead>
                      <TableHead className="table-header">Delivery Rate</TableHead>
                      <TableHead className="table-header">Created</TableHead>
                      <TableHead className="table-header">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign._id}>
                        <TableCell className="table-cell">
                          <div>
                            <div className="font-semibold text-gray-900">{campaign.name}</div>
                            <div className="text-sm text-gray-600">{campaign.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell className="table-cell font-semibold">{campaign.targetCount}</TableCell>
                        <TableCell className="table-cell font-semibold">{campaign.sentCount}</TableCell>
                        <TableCell className="table-cell font-semibold">{campaign.deliveredCount}</TableCell>
                        <TableCell className="table-cell font-semibold">{campaign.failedCount}</TableCell>
                        <TableCell className="table-cell font-semibold">
                          {getDeliveryRate(campaign.deliveredCount, campaign.sentCount)}
                        </TableCell>
                        <TableCell className="table-cell">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="nav-button"
                                onClick={() => setSelectedCampaign(campaign)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-900">
                                  {selectedCampaign?.name}
                                </DialogTitle>
                                <DialogDescription className="text-gray-600 font-medium">
                                  Campaign details and performance metrics
                                </DialogDescription>
                              </DialogHeader>
                              {selectedCampaign && (
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                    <p className="text-gray-600">{selectedCampaign.description}</p>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Message</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                      <p className="text-gray-700">{selectedCampaign.message}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <h5 className="font-semibold text-blue-900">Target Audience</h5>
                                      <p className="text-2xl font-bold text-blue-600">{selectedCampaign.targetCount}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                      <h5 className="font-semibold text-green-900">Delivery Rate</h5>
                                      <p className="text-2xl font-bold text-green-600">
                                        {getDeliveryRate(selectedCampaign.deliveredCount, selectedCampaign.sentCount)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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
