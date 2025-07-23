"use client"

import { useEffect, useState } from "react"
import { Wallet, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { DialogProvider } from "@/components/ui/dialog-context"
import { WithdrawalForm } from "./withdrawal-form/withdrawal-form"

type Withdrawal = {
  id: number
  amount: number
  date: string
  status: string
  method: string
  campaignTitle: string
  campaignId: number
}

type Campaign = {
  id: number
  user_id: number
  title: string
  current_amount: string
  status: string
}

type WithdrawalDetails = {
  campaign_id: number
  amount: string
  payment_method: string
  status: string
}

type WalletStats = {
  available_balance: string
  total_withdrawn: string
  total_withdrawals: number
  currency: string
  last_withdrawal: {
    date: string | null
    details: WithdrawalDetails | null
  }
  status: string
  updated_at: string
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "pending":
      return <Clock className="h-4 w-4 text-orange-600" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600" />
    default:
      return null
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "default"
    case "pending":
      return "secondary"
    case "failed":
      return "destructive"
    default:
      return "secondary"
  }
}

export function WithdrawalsPage() {
  const [withdrawalList, setWithdrawalList] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(false)
  const [walletStats, setWalletStats] = useState<WalletStats>({
    available_balance: "0.00",
    total_withdrawn: "0.00",
    total_withdrawals: 0,
    currency: "GHS",
    last_withdrawal: {
      date: null,
      details: null
    },
    status: "active",
    updated_at: ""
  })
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    const fetchWalletStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://127.0.0.1:8000/api/v1/wallet-stats')
        const data = await response.json()
        if (data.success) {
          setWalletStats(data.data)
        }

        // Fetch campaigns
        const campaignsResponse = await fetch('http://127.0.0.1:8000/api/v1/campaigns/public')
        const campaignsData = await campaignsResponse.json()
        if (campaignsData.data) {
          setCampaigns(campaignsData.data)
        }
      } catch (error) {
        console.error("Failed to fetch wallet stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWalletStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Withdrawals</h2>
          <p className="text-muted-foreground">Manage your campaign fund withdrawals</p>
        </div>
        <DialogProvider>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Wallet className="mr-2 h-4 w-4" />
                Request Withdrawal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
                <DialogDescription>
                  Enter your mobile money details to withdraw funds from your campaign.
                </DialogDescription>
              </DialogHeader>
              <WithdrawalForm />
            </DialogContent>
          </Dialog>
        </DialogProvider>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletStats.currency} {Number(walletStats.total_withdrawn).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Successfully withdrawn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletStats.currency} {Number(walletStats.available_balance).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Track your withdrawal requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {walletStats.last_withdrawal?.details ? (
                <TableRow>
                  <TableCell className="font-medium">
                    {campaigns.find((c: Campaign) => 
                      c.id === Number(walletStats.last_withdrawal.details?.campaign_id)
                    )?.title || 'Unknown Campaign'}
                  </TableCell>
                  <TableCell>
                    {walletStats.currency} {Number(walletStats.last_withdrawal.details.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {walletStats.last_withdrawal.details.payment_method}
                  </TableCell>
                  <TableCell>
                    {walletStats.last_withdrawal.date ? 
                      new Date(walletStats.last_withdrawal.date).toLocaleDateString() : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(walletStats.last_withdrawal.details.status)}
                      <Badge variant={getStatusVariant(walletStats.last_withdrawal.details.status) as any}>
                        {walletStats.last_withdrawal.details.status}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No withdrawal history available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
