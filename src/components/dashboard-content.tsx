"use client"


import { DollarSign, Target, Wallet, AlertCircle } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

// Mock data - replace with API calls
const dashboardStats = {
  totalDonations: 9265,
  activeCampaigns: 33,
  withdrawals: 400,
  totalUsers: 34,
}

const campaignStats = [
  { title: "Upcoming Campaigns", value: 4, color: "bg-purple-500" },
  { title: "Expired Campaigns", value: 0, color: "bg-red-500" },
]

const withdrawalStats = [
  { title: "Pending Withdrawal", value: "1", color: "bg-orange-500" },
  { title: "Cancelled Withdrawals", value: "1", color: "bg-red-500" },
]

const chartData = [
  { month: "Jan", donations: 2400, withdrawals: 400 },
  { month: "Feb", donations: 1398, withdrawals: 300 },
  { month: "Mar", donations: 9800, withdrawals: 200 },
  { month: "Apr", donations: 3908, withdrawals: 278 },
  { month: "May", donations: 4800, withdrawals: 189 },
  { month: "Jun", donations: 3800, withdrawals: 239 },
]

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

const recentDonations = [
  {
    id: 1,
    donorName: "John Doe",
    campaignTitle: "Help Build School",
    amount: "$250",
    date: "2 hours ago",
    status: "Completed",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 2,
    donorName: "Jane Smith",
    campaignTitle: "Medical Emergency Fund",
    amount: "$150",
    date: "5 hours ago",
    status: "Completed",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 3,
    donorName: "Mike Johnson",
    campaignTitle: "Community Garden",
    amount: "$75",
    date: "1 day ago",
    status: "Completed",
    avatar: "/placeholder-user.jpg",
  },
]

export function DashboardContent() {
  const stats = dashboardStats

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your campaigns.</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {stats.totalDonations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {stats.withdrawals}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Donation Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Donations</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {campaignStats.map((stat, index) => (
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
        {withdrawalStats.map((stat, index) => (
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
              <BarChart accessibilityLayer data={chartData}>
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
              {recentDonations.map((donation) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  )
}
