"use client"

import { useEffect, useState } from "react"
import { Wallet, DollarSign, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { DialogProvider } from "@/components/ui/dialog-context"
import { WithdrawalForm } from "./withdrawal-form/withdrawal-form"

type Withdrawal = {
  transaction_id: string
  amount: number
  date: string
  status: string
  method: string
  currency: string
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
  const { toast } = useToast()
  const [withdrawalList, setWithdrawalList] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
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
  
  const fetchData = async (showSuccessToast = false) => {
    try {
      setLoading(true)
      // Fetch wallet stats
      const { data: walletData } = await api.get('/api/v1/wallet-stats')
      if (walletData.success) {
        console.log('Wallet stats loaded:', walletData.data)
        setWalletStats(walletData.data)
      } else {
        console.error("Failed to load wallet stats:", walletData.message)
        toast({
          title: "Error",
          description: "Failed to load wallet statistics",
          variant: "destructive",
        })
      }

      // Fetch withdrawal history
      const { data: historyData } = await api.get('/api/v1/wallet/withdrawal-history')
      if (historyData.success) {
        console.log('Withdrawal history loaded:', historyData.data)
        setWithdrawalList(historyData.data.withdrawals)
      } else {
        console.error("Failed to load withdrawal history:", historyData.message)
        toast({
          title: "Error",
          description: "Failed to load withdrawal history",
          variant: "destructive",
        })
      }

      // Show success toast if requested (after successful withdrawal)
      if (showSuccessToast) {
        setLastRefresh(new Date())
        toast({
          title: "✅ Data Refreshed",
          description: "Withdrawal data has been updated successfully",
          duration: 3000,
        })
      }
    } catch (error: any) {
      console.error("Failed to fetch data:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Manual refresh function that can be called externally
  const refreshData = () => fetchData(true)

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Withdrawals</h2>
          <p className="text-muted-foreground">Manage your campaign fund withdrawals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletStats.total_withdrawals}</div>
            <p className="text-xs text-muted-foreground">Number of transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{walletStats.status}</div>
            <p className="text-xs text-muted-foreground">Last updated: {new Date(walletStats.updated_at).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>Track your withdrawal requests and their status</CardDescription>
            </div>
            {lastRefresh && (
              <div className="text-xs text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            )}
          </div>
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
              {withdrawalList.length > 0 ? (
                withdrawalList.map((withdrawal) => (
                  <TableRow key={withdrawal.transaction_id}>
                    <TableCell className="font-medium">
                      {withdrawal.transaction_id}
                    </TableCell>
                    <TableCell>
                      {withdrawal.currency} {Number(withdrawal.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      Mobile Money
                    </TableCell>
                    <TableCell>
                      {new Date(withdrawal.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(withdrawal.status)}
                        <Badge variant={getStatusVariant(withdrawal.status) as any}>
                          {withdrawal.status}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
