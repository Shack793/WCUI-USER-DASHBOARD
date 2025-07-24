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

interface DashboardStats {
  activeCampaigns: number
  totalDonations: number
  withdrawals: number
}

interface CampaignStat {
  title: string
  value: number
  color: string
}

interface ChartDataPoint {
  month: string
  donations: number
  withdrawals: number
}

interface RecentDonation {
  id: number
  donorName: string
  campaignTitle: string
  amount: string
  date: string
  status: string
  avatar?: string
}

interface WithdrawalStat {
  title: string
  value: number | string
  color: string
}

interface DashboardData {
  stats: DashboardStats
  campaignStats: CampaignStat[]
  chartData: ChartDataPoint[]
  recentDonations: RecentDonation[]
  withdrawalStats: WithdrawalStat[]
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
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      activeCampaigns: 0,
      totalDonations: 0,
      withdrawals: 0
    },
    campaignStats: [],
    chartData: [],
    recentDonations: [],
    withdrawalStats: [
      { title: "Pending Withdrawals", value: 0, color: "bg-orange-500" },
      { title: "Cancelled Withdrawals", value: 0, color: "bg-red-500" }
    ]
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping dashboard data fetch')
        return
      }

      try {
        setLoading(true)
        const { data } = await api.get('/api/v1/userdashboard')
        if (data.success) {
          console.log('Dashboard data loaded:', data.data)
          setDashboardData(data.data)
        } else {
          console.error("Failed to load dashboard data:", data.message)
          toast({
            title: "Error",
            description: data.message || "Failed to load dashboard data",
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
  }, [isAuthenticated]) // Add isAuthenticated to dependencies

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          {loading ? "Loading dashboard data..." : "Welcome back! Here's what's happening with your campaigns."}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">Active campaign count</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {dashboardData.stats.totalDonations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total donations received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {dashboardData.stats.withdrawals}</div>
            <p className="text-xs text-muted-foreground">Total withdrawals made</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {dashboardData.campaignStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`h-4 w-4 rounded ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Withdrawal Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {dashboardData.withdrawalStats.map((stat: WithdrawalStat, index: number) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`h-4 w-4 rounded ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
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
              <BarChart accessibilityLayer data={dashboardData.chartData}>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `GHS ${value}`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="donations" fill="var(--color-donations)" radius={4} />
                <Bar dataKey="withdrawals" fill="var(--color-withdrawals)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Latest donations received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {dashboardData.recentDonations.length > 0 ? (
                dashboardData.recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={donation.avatar || "/placeholder.svg"} alt={donation.donorName} />
                    <AvatarFallback>
                      {donation.donorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{donation.donorName}</p>
                    <p className="text-sm text-muted-foreground">{donation.campaignTitle}</p>
                  </div>
                  <div className="ml-auto font-medium">{donation.amount}</div>
                </div>
              ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No recent donations
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
