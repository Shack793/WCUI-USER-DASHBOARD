"use client"

import { useEffect, useState } from "react"
import { DollarSign, Target, Wallet, AlertCircle } from "lucide-react"
import { dashboardAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

interface ChartDataPoint {
  month: string
  donations: string | number
  withdrawals: string | number
}

interface RecentContribution {
  id: number
  contributor: string
  campaign: string
  amount: string
  date: string
}

interface DashboardApiResponse {
  user_id?: number
  totalCampaigns: number
  totalContributions: string
  withdrawals: string
  expiredCampaigns: number
  walletStats?: {
    balance: string
    total_withdrawn: string
    withdrawal_count: number
    currency: string
    last_withdrawal_at: string | null
    status: string
  }
  withdrawalHistory?: Array<{
    id: number
    amount: string
    date: string
    status: string
    method: string
  }>
  chartData: ChartDataPoint[]
  recentContributions: RecentContribution[]
}

// Chart configuration

const chartConfig = {
  donations: {
    label: "Donations",
    color: "hsl(var(--chart-1))",
  },
  withdrawals: {
    label: "Withdrawals",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

// Constants for the dashboard display

export function DashboardContent() {
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardApiResponse | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping dashboard data fetch')
        return
      }

      console.log('🔍 Current authenticated user:', user)
      console.log('🔍 Authentication status:', isAuthenticated)
      console.log('🔍 Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing')

      try {
        setLoading(true)
        console.log('🔍 Fetching user dashboard data...')
        
        // Debug the request being made
        const token = localStorage.getItem('authToken')
        console.log('🔍 Making request to:', 'https://crowdfundingapi.wgtesthub.com/api/v1/userdashboard')
        console.log('🔍 With token:', token ? `${token.substring(0, 20)}...` : 'No token')
        console.log('🔍 Full token for debugging:', token)
        
        // Test authentication directly
        if (token) {
          try {
            const testResponse = await fetch('https://crowdfundingapi.wgtesthub.com/api/v1/user', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            })
            console.log('🔍 Auth test response status:', testResponse.status)
            if (testResponse.ok) {
              const userData = await testResponse.json()
              console.log('🔍 Auth test user data:', userData)
            } else {
              console.log('🔍 Auth test failed:', await testResponse.text())
            }
          } catch (authError) {
            console.log('🔍 Auth test error:', authError)
          }
        }
        
        const { data } = await dashboardAPI.getUserDashboard()
        console.log('🔍 Raw API response:', data)
        
        if (data) {
          console.log('🔍 Dashboard data structure:', {
            user_id: data.user_id, // Add user ID logging
            totalCampaigns: data.totalCampaigns,
            totalContributions: data.totalContributions,
            withdrawals: data.withdrawals,
            expiredCampaigns: data.expiredCampaigns,
            hasChartData: !!data.chartData,
            hasRecentContributions: !!data.recentContributions,
            chartDataLength: data.chartData?.length,
            recentContributionsLength: data.recentContributions?.length,
            dataKeys: Object.keys(data)
          })
          
          // Critical check: If user_id is undefined, the backend authentication is not working
          if (data.user_id === undefined || data.user_id === null) {
            console.error('🚨 CRITICAL: Backend is not filtering by authenticated user!')
            console.error('🚨 This means either:')
            console.error('🚨 1. The route /api/v1/userdashboard is not protected with auth:sanctum middleware')
            console.error('🚨 2. The authentication guard is not working properly')
            console.error('🚨 3. The controller is not getting the authenticated user context')
            toast({
              title: "Authentication Error",
              description: "Backend authentication is not working properly. Please contact support.",
              variant: "destructive",
            })
            return
          }
          
          // Check if the API returned user-specific data
          if (data.user_id && user?.id && data.user_id.toString() !== user.id.toString()) {
            console.warn('⚠️ API returned data for different user!', {
              frontendUserId: user.id,
              apiUserId: data.user_id
            })
          }
          
          setDashboardData(data)
        } else {
          console.error("Failed to load dashboard data")
          toast({
            title: "Error",
            description: "Failed to load dashboard data",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error)
        console.error("Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          headers: error.config?.headers
        })
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated, user, toast])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          {loading ? "Loading dashboard data..." : `Welcome back, ${user?.name || 'User'}! Here's what's happening with your campaigns.`}
        </p>
        {user && (
          <p className="text-xs text-muted-foreground mt-2">
            User ID: {user.id} | Email: {user.email}
          </p>
        )}
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalCampaigns || 0}</div>
            <p className="text-xs text-muted-foreground">Total campaign count</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {dashboardData ? Number(dashboardData.totalContributions).toLocaleString() : '0'}</div>
            <p className="text-xs text-muted-foreground">Total contributions received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {dashboardData ? Number(dashboardData.withdrawals).toLocaleString() : '0'}</div>
            <p className="text-xs text-muted-foreground">Total withdrawals made</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Campaigns</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.expiredCampaigns || 0}</div>
            <p className="text-xs text-muted-foreground">Campaigns that have ended</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-5">
        {/* Chart */}
        <Card className="lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle>Donation & Withdraw Progress</CardTitle>
            <CardDescription>Progress report for last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={dashboardData?.chartData || []}>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => {
                    // Format "2025-07" to "Jul"
                    const date = new Date(value + '-01')
                    return date.toLocaleDateString('en-US', { month: 'short' })
                  }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `GHS ${Number(value).toLocaleString()}`} 
                />
                <ChartTooltip 
                  cursor={false} 
                  content={<ChartTooltipContent indicator="dashed" />} 
                />
                <Bar 
                  dataKey="donations" 
                  fill="var(--color-donations)" 
                  radius={4}
                />
                <Bar 
                  dataKey="withdrawals" 
                  fill="var(--color-withdrawals)" 
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Contributions */}
        <Card className="lg:col-span-1 xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Contributions</CardTitle>
            <CardDescription>Latest contributions received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {dashboardData?.recentContributions && dashboardData.recentContributions.length > 0 ? (
                dashboardData.recentContributions.map((contribution: RecentContribution) => (
                <div key={contribution.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder.svg" alt={contribution.contributor} />
                    <AvatarFallback>
                      {contribution.contributor
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none truncate">{contribution.contributor}</p>
                    <p className="text-sm text-muted-foreground truncate">{contribution.campaign}</p>
                  </div>
                  <div className="ml-auto font-medium text-right">GHS {Number(contribution.amount).toLocaleString()}</div>
                </div>
              ))
              ) : (
                <div className="text-center text-muted-foreground">
                  {loading ? "Loading contributions..." : "No recent contributions"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
