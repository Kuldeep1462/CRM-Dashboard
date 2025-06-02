"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Wand2, Home, ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Rule {
  id: string
  field: string
  operator: string
  value: string
  logic?: "AND" | "OR"
}

interface Campaign {
  name: string
  description: string
  rules: Rule[]
  message: string
}

export default function CreateCampaign() {
  const [campaign, setCampaign] = useState<Campaign>({
    name: "",
    description: "",
    rules: [{ id: "1", field: "totalSpend", operator: ">", value: "", logic: "AND" }],
    message: "",
  })
  const [previewCount, setPreviewCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [aiSuccess, setAiSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const addRule = () => {
    const newRule: Rule = {
      id: Date.now().toString(),
      field: "totalSpend",
      operator: ">",
      value: "",
      logic: "AND",
    }
    setCampaign((prev) => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }))
  }

  const removeRule = (id: string) => {
    setCampaign((prev) => ({
      ...prev,
      rules: prev.rules.filter((rule) => rule.id !== id),
    }))
  }

  const updateRule = (id: string, field: keyof Rule, value: string) => {
    setCampaign((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)),
    }))
  }

  const previewAudience = async () => {
    try {
      setError(null)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/campaigns/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rules: campaign.rules }),
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewCount(data.count)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to preview audience")
      }
    } catch (error) {
      console.error("Error previewing audience:", error)
      setError("Failed to preview audience. Please try again.")
    }
  }

  const convertNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim()) return

    setIsLoading(true)
    setError(null)
    setAiSuccess(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/convert-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ input: naturalLanguageInput }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.rules && Array.isArray(data.rules)) {
          setCampaign((prev) => ({
            ...prev,
            rules: data.rules,
          }))
          setNaturalLanguageInput("")
          setAiSuccess("Successfully converted natural language to rules.")
        } else {
          setError("Invalid response format from AI")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to convert natural language")
      }
    } catch (error) {
      console.error("Error converting natural language:", error)
      setError("Failed to convert natural language. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const generateMessage = async () => {
    setIsLoading(true)
    setError(null)
    setAiSuccess(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/generate-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignName: campaign.name,
          description: campaign.description,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCampaign((prev) => ({
          ...prev,
          message: data.message,
        }))
        setAiSuccess("Successfully generated message.")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to generate message")
      }
    } catch (error) {
      console.error("Error generating message:", error)
      setError("Failed to generate message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const saveCampaign = async () => {
    if (!campaign.name || !campaign.message || campaign.rules.length === 0) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(campaign),
      })

      if (response.ok) {
        router.push("/campaigns")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to save campaign")
      }
    } catch (error) {
      console.error("Error saving campaign:", error)
      setError("Failed to save campaign. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="clean-background min-h-screen">
      <div className="campaigns-container">
        {/* Header */}
        <header className="campaigns-header shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => router.push("/")} className="nav-button">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
                <Button variant="ghost" onClick={() => router.push("/campaigns")} className="nav-button">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Campaigns
                </Button>
                <h1 className="text-2xl font-bold campaigns-text">Create Campaign</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {aiSuccess && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{aiSuccess}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Campaign Details */}
            <Card className="campaigns-card">
              <CardHeader>
                <CardTitle className="text-xl campaigns-text">Campaign Details</CardTitle>
                <CardDescription className="campaigns-subtitle">Basic information about your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold campaigns-text">
                    Campaign Name
                  </Label>
                  <Input
                    id="name"
                    value={campaign.name}
                    onChange={(e) => setCampaign((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                    className="form-input mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-sm font-semibold campaigns-text">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={campaign.description}
                    onChange={(e) => setCampaign((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your campaign"
                    className="form-input mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Natural Language Converter */}
            <Card className="campaigns-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl campaigns-text">
                  <Wand2 className="h-5 w-5" />
                  AI Rule Builder
                </CardTitle>
                <CardDescription className="campaigns-subtitle">
                  Describe your audience in natural language and let AI convert it to rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="natural-language" className="text-sm font-semibold campaigns-text">
                    Natural Language Input
                  </Label>
                  <Textarea
                    id="natural-language"
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    placeholder="e.g., People who haven't shopped in 6 months and spent over ₹5000"
                    className="form-input mt-1"
                  />
                </div>
                <Button
                  onClick={convertNaturalLanguage}
                  disabled={isLoading || !naturalLanguageInput.trim()}
                  className={
                    naturalLanguageInput.trim()
                      ? "btn-gradient-filled"
                      : "btn-gradient-empty"
                  }
                >
                  {isLoading ? "Converting..." : "Convert to Rules"}
                </Button>
              </CardContent>
            </Card>

            {/* Audience Rules */}
            <Card className="campaigns-card">
              <CardHeader>
                <CardTitle className="text-xl campaigns-text">Audience Rules</CardTitle>
                <CardDescription className="campaigns-subtitle">
                  Define conditions to target specific customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.rules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    {index > 0 && (
                      <Select value={rule.logic} onValueChange={(value) => updateRule(rule.id, "logic", value)}>
                        <SelectTrigger className="w-20 form-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <Select value={rule.field} onValueChange={(value) => updateRule(rule.id, "field", value)}>
                      <SelectTrigger className="w-40 form-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visitCount">Visit Count</SelectItem>
                        <SelectItem value="lastActive">Last Active</SelectItem>
                        <SelectItem value="totalSpend">Total Spend</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={rule.operator} onValueChange={(value) => updateRule(rule.id, "operator", value)}>
                      <SelectTrigger className="w-20 form-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">{">"}</SelectItem>
                        <SelectItem value="<">{"<"}</SelectItem>
                        <SelectItem value=">=">{"≥"}</SelectItem>
                        <SelectItem value="<=">{"≤"}</SelectItem>
                        <SelectItem value="=">{"="}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                      placeholder="Value"
                      className="w-32 form-input"
                    />

                    {campaign.rules.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => removeRule(rule.id)} className="nav-button">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={addRule} className="nav-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                  <Button variant="outline" onClick={previewAudience} className="nav-button">
                    Preview Audience
                  </Button>
                </div>

                {previewCount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="text-blue-800 font-semibold">{previewCount} customers match these criteria</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campaign Message */}
            <Card className="campaigns-card">
              <CardHeader>
                <CardTitle className="text-xl campaigns-text">Campaign Message</CardTitle>
                <CardDescription className="campaigns-subtitle">
                  Create the message that will be sent to your audience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="message" className="text-sm font-semibold campaigns-text">
                    Message Template
                  </Label>
                  <Textarea
                    id="message"
                    value={campaign.message}
                    onChange={(e) => setCampaign((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Hi {name}, here's a special offer for you!"
                    rows={4}
                    className="form-input mt-1"
                  />
                </div>
                <Button variant="outline" onClick={generateMessage} disabled={isLoading} className="nav-button">
                  <Wand2 className="h-4 w-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate with Gemini AI"}
                </Button>
              </CardContent>
            </Card>

            {/* Save Campaign */}
            <div className="flex justify-end">
              <Button onClick={saveCampaign} disabled={isLoading} size="lg" className="btn-gradient-launch">
                {isLoading ? "Saving..." : "Save & Launch Campaign"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
