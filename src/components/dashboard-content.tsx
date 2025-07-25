"use client"

import { useEffect, useState } from "react"
import { DollarSign, Target, Wallet, AlertCircle } from "lucide-react"
import api from "@/lib/api"
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
  totalCampaigns: number
  totalContributions: string
  withdrawals: number
  expiredCampaigns: number
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
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardApiResponse | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping dashboard data fetch')
        return
      }

      try {
        setLoading(true)
        const { data } = await api.get('/api/v1/userdashboard')
        if (data) {
          console.log('Dashboard data loaded:', data)
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
  }, [isAuthenticated, toast])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          {loading ? "Loading dashboard data..." : "Welcome back! Here's what's happening with your campaigns."}
        </p>
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
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
            <div className="text-2xl font-bold">GHS {dashboardData?.withdrawals || 0}</div>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart */}
        <Card className="col-span-4">
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
        <Card className="col-span-3">
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
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{contribution.contributor}</p>
                    <p className="text-sm text-muted-foreground">{contribution.campaign}</p>
                  </div>
                  <div className="ml-auto font-medium">GHS {Number(contribution.amount).toLocaleString()}</div>
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
