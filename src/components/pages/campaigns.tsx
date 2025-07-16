"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Calendar, DollarSign, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dashboardAPI } from "../../lib/api"

// Helper function to get proper image URL
const getImageUrl = (url: string | null) => {
  console.log('=== getImageUrl called (campaigns) ===')
  console.log('Input URL:', url)

  if (!url) {
    console.log('No URL provided, returning placeholder')
    return '/placeholder.svg?height=400&width=600'
  }

  if (url.startsWith('http')) {
    console.log('URL is absolute, returning as-is:', url)
    return url
  }

  const fullUrl = `http://127.0.0.1:8000${url}`
  console.log('URL is relative, returning full URL:', fullUrl)
  return fullUrl
};

// Helper function to format currency as GHS
const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `GHS ${numAmount.toLocaleString()}`;
};

// Interface for campaign data from API
interface Campaign {
  id: number
  user_id: number
  category_id: number
  title: string
  slug: string
  description: string
  goal_amount: string
  current_amount: string
  start_date: string
  end_date: string
  status: string
  is_boosted: boolean
  boost_ends_at: string | null
  visibility: string
  thumbnail: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}





export function CampaignsPage() {
  const navigate = useNavigate()
  const [campaignList, setCampaignList] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to calculate days left
  const calculateDaysLeft = (endDate: string): number => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await dashboardAPI.getDashboardCampaigns()
        setCampaignList(response.data)
      } catch (error: any) {
        console.error("Failed to fetch campaigns:", error)
        setError(error.response?.data?.message || "Failed to fetch campaigns")
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Campaigns</h2>
            <p className="text-muted-foreground">Manage and track your fundraising campaigns</p>
          </div>
          <Button onClick={() => navigate('/campaigns/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Campaigns</h2>
            <p className="text-muted-foreground">Manage and track your fundraising campaigns</p>
          </div>
          <Button onClick={() => navigate('/campaigns/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading campaigns: {error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Campaigns</h2>
          <p className="text-muted-foreground">Manage and track your fundraising campaigns</p>
        </div>
        <Button onClick={() => navigate('/campaigns/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {campaignList.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No campaigns found. Create your first campaign to get started!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaignList.map((campaign) => {
            const goalAmount = parseFloat(campaign.goal_amount)
            const currentAmount = parseFloat(campaign.current_amount)
            const progressPercentage = goalAmount > 0 ? Math.round((currentAmount / goalAmount) * 100) : 0
            const daysLeft = calculateDaysLeft(campaign.end_date)

            return (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                        {campaign.status}
                      </Badge>
                      {campaign.is_boosted && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                          <Zap className="mr-1 h-3 w-3" />
                          Boosted
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      {daysLeft > 0 ? `${daysLeft} days left` : "Completed"}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={getImageUrl(campaign.image_url)}
                        alt={campaign.title}
                        className="w-full h-56 object-cover rounded-lg"
                        onLoad={() => {
                          console.log('✅ Campaign image loaded successfully:', getImageUrl(campaign.image_url))
                        }}
                        onError={(e) => {
                          console.log('❌ Campaign image failed to load:', campaign.image_url)
                          console.log('Original URL:', campaign.image_url)
                          console.log('Processed URL:', getImageUrl(campaign.image_url))
                          console.log('Setting fallback to placeholder')
                          e.currentTarget.src = '/placeholder.svg?height=400&width=600'
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-[#37b7ff]"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <DollarSign className="mr-1 h-4 w-4" />
                        {formatCurrency(currentAmount)} raised
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {campaign.visibility}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Goal: {formatCurrency(goalAmount)}
                    </div>
                    <div className="pt-4">
                      <Button
                        onClick={() => navigate(`/campaigns/${campaign.id}/boost`)}
                        className={`w-full font-semibold shadow-lg transform transition-all hover:scale-[1.02] ${
                          campaign.is_boosted
                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                            : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                        }`}
                        size="sm"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {campaign.is_boosted ? "Extend Boost" : "Boost Campaign"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
