import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, DollarSign, AlertCircle } from "lucide-react"
import { useToast } from '../../hooks/use-toast'
import { dashboardAPI } from "../../lib/api"

interface WithdrawalFormData {
  amount: number
  reason?: string
}

export function RequestWithdrawalPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<WithdrawalFormData>({
    amount: 0,
    reason: ""
  })

  // Handle input changes
  const handleInputChange = (field: keyof WithdrawalFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      console.log('=== SUBMITTING WITHDRAWAL REQUEST ===')
      console.log('Form data:', formData)

      // Validation
      if (formData.amount <= 0) {
        setError('Withdrawal amount must be greater than 0')
        return
      }

      if (formData.amount < 10) {
        setError('Minimum withdrawal amount is GHS 10.00')
        return
      }

      // Prepare submission data
      const submitData = {
        amount: formData.amount,
        reason: formData.reason || null
      }

      console.log('Submitting withdrawal request:', submitData)

      // Call API to create withdrawal request
      const response = await dashboardAPI.requestWithdrawal(submitData)

      console.log('Withdrawal request created:', response.data)

      // Success - show toast and redirect
      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request for GHS ${formData.amount.toFixed(2)} has been submitted successfully.`,
        variant: "default",
      })

      // Redirect to withdrawals page
      navigate('/withdrawals')

    } catch (error: any) {
      console.error('Failed to submit withdrawal request:', error)
      
      let errorMessage = 'Failed to submit withdrawal request. Please try again.'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        errorMessage = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`).join('\n')
      }
      
      setError(errorMessage)
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/withdrawals')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Withdrawals
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Request Withdrawal</h1>
            <p className="text-muted-foreground">Submit a new withdrawal request</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#37b7ff]" />
              Withdrawal Information
            </CardTitle>
            <CardDescription>
              Enter the amount you wish to withdraw. All requests are subject to admin approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                  </div>
                </div>
              )}

              {/* Important Notice */}
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Important Information:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Minimum withdrawal amount is GHS 10.00</li>
                      <li>All withdrawal requests require admin approval</li>
                      <li>Processing time is typically 1-3 business days</li>
                      <li>You will be notified once your request is processed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Withdrawal Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (GHS) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    min="10"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the amount you wish to withdraw (minimum GHS 10.00)
                </p>
              </div>

              {/* Reason (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Withdrawal (Optional)</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="Optional: Provide a reason for this withdrawal request..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.reason?.length || 0}/500 characters
                </p>
              </div>

              {/* Summary */}
              {formData.amount > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Withdrawal Summary</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Requested Amount:</span>
                      <span className="font-medium">GHS {formData.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-yellow-600 font-medium">Pending Approval</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Time:</span>
                      <span>1-3 business days</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-[#37b7ff] hover:bg-[#2a8fc7] text-white"
                  disabled={loading || formData.amount <= 0}
                >
                  {loading ? 'Submitting Request...' : 'Submit Withdrawal Request'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/withdrawals')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>

              {/* Terms */}
              <div className="text-xs text-muted-foreground text-center">
                By submitting this request, you agree to our withdrawal terms and conditions.
                All requests are subject to verification and admin approval.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
