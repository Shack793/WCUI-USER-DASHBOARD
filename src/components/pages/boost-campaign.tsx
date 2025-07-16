"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Zap, CreditCard, DollarSign, Clock, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dashboardAPI } from "../../lib/api"
import { paymentsApi } from '@/services/api'
import { useToast } from '../../hooks/use-toast'
import { useAuth } from '../../contexts/auth-context'

interface BoostData {
  plan_id: number
  payment_method_id: number
}

interface MoMoFields {
  customer: string
  msisdn: string
  amount: string
  network: string
  narration: string
}

interface Campaign {
  id: number
  title: string
  description: string
  goal_amount: string
  current_amount: string
  image_url: string | null
}

interface BoostPlan {
  id: number
  name: string
  price: string
  duration_days: number
}

interface PaymentMethod {
  id: number
  name: string
  number: string
  type: string
  is_active: number
  created_at: string | null
  updated_at: string | null
}

// Default boost plans - will be replaced by API data
const defaultBoostPlans: BoostPlan[] = [
  {
    id: 1,
    name: "7 days plan",
    price: "100.00",
    duration_days: 7
  },
  {
    id: 2,
    name: "14 days plan",
    price: "200.00",
    duration_days: 14
  },
  {
    id: 3,
    name: "30 days plan",
    price: "400.00",
    duration_days: 30
  }
]

// Default payment methods - will be replaced by API data
const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    name: "MOMO",
    number: "0598890221",
    type: "mobile_money",
    is_active: 1,
    created_at: null,
    updated_at: null
  },
  {
    id: 2,
    name: "Cash/Manual",
    number: "0501769307",
    type: "bank_transfer",
    is_active: 1,
    created_at: null,
    updated_at: null
  }
]



// Helper function to format currency as GHS
const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `GHS ${numAmount.toLocaleString()}`;
};

export function BoostCampaignPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>() // This will be the campaign slug
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()

  // Helper function for image URLs
  const getImageUrl = (url: string | null) => {
    console.log('=== getImageUrl called ===')
    console.log('Input URL:', url)

    if (!url) {
      console.log('No URL provided, returning placeholder')
      return "/placeholder.svg?height=400&width=600"
    }

    if (url.startsWith("http")) {
      console.log('URL is absolute, returning as-is:', url)
      return url
    }

    const fullUrl = `http://127.0.0.1:8000${url}`
    console.log('URL is relative, returning full URL:', fullUrl)
    return fullUrl
  }
  const [loading, setLoading] = useState(false)
  const [campaignLoading, setCampaignLoading] = useState(true)
  const [plansLoading, setPlansLoading] = useState(true)
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [boostPlans, setBoostPlans] = useState<BoostPlan[]>(defaultBoostPlans)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(defaultPaymentMethods)
  const [selectedPlan, setSelectedPlan] = useState<BoostPlan | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState<BoostData>({
    plan_id: 0,
    payment_method_id: 0
  })
  const [momoFields, setMomoFields] = useState<MoMoFields>({
    customer: "",
    msisdn: "",
    amount: "",
    network: "",
    narration: ""
  })
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'checking' | 'boosting'>('form')
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // Add logging on component mount and test API connectivity
  useEffect(() => {
    console.log('=== BOOST CAMPAIGN PAGE MOUNTED ===')
    console.log('Campaign slug:', id)
    console.log('Environment variables:')
    console.log('- VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
    console.log('- User authenticated:', isAuthenticated)
    console.log('- User:', user)

    // Test API connectivity (page is already protected by ProtectedRoute)
    if (isAuthenticated) {
      console.log('User is authenticated, testing API connectivity...')
      testAPIConnectivity()
    }
  }, [id, isAuthenticated, user])



  // Fetch boost plans from API
  useEffect(() => {
    const fetchBoostPlans = async () => {
      try {
        setPlansLoading(true)
        const response = await dashboardAPI.getBoostPlans()
        console.log('Boost plans response:', response.data)

        // Handle the API response structure
        if (response.data.success && Array.isArray(response.data.data)) {
          setBoostPlans(response.data.data)
        } else {
          console.error('Invalid boost plans response format:', response.data)
        }
      } catch (error: any) {
        console.error("Failed to fetch boost plans:", error)
        // Keep default plans if API fails
      } finally {
        setPlansLoading(false)
      }
    }

    fetchBoostPlans()
  }, [])

  // Fetch payment methods from API
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setPaymentMethodsLoading(true)
        const response = await dashboardAPI.getPaymentMethods()
        console.log('Payment methods response:', response.data)

        // Check authentication status from API response
        if (response.data.authenticated === false) {
          console.warn('⚠️ Payment methods API indicates user is not authenticated')
          console.warn('This might cause issues with boost campaign submission')

          // Show warning toast
          toast({
            title: "Authentication Warning",
            description: "API indicates you may not be fully authenticated. If boost fails, please try logging in again.",
            variant: "default",
          })
        }

        // Handle the API response structure
        if (Array.isArray(response.data.methods)) {
          setPaymentMethods(response.data.methods)
        } else {
          console.error('Invalid payment methods response format:', response.data)
        }
      } catch (error: any) {
        console.error("Failed to fetch payment methods:", error)
        // Keep default payment methods if API fails
      } finally {
        setPaymentMethodsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [toast])

  // Network auto-detection for MoMo
  useEffect(() => {
    const msisdn = momoFields.msisdn || "";
    if (
      msisdn.startsWith("024") || msisdn.startsWith("025") || msisdn.startsWith("053") || msisdn.startsWith("054") || msisdn.startsWith("055") || msisdn.startsWith("059") ||
      msisdn.startsWith("+23324") || msisdn.startsWith("+23325") || msisdn.startsWith("+23353") || msisdn.startsWith("+23354") || msisdn.startsWith("+23355") || msisdn.startsWith("+23359")
    ) {
      setMomoFields((prev) => ({ ...prev, network: "MTN" }));
    } else if (
      msisdn.startsWith("020") || msisdn.startsWith("050") ||
      msisdn.startsWith("+23320") || msisdn.startsWith("+23350")
    ) {
      setMomoFields((prev) => ({ ...prev, network: "VODAFONE" }));
    } else if (
      msisdn.startsWith("027") || msisdn.startsWith("057") || msisdn.startsWith("026") ||
      msisdn.startsWith("+23327") || msisdn.startsWith("+23357") || msisdn.startsWith("+23326")
    ) {
      setMomoFields((prev) => ({ ...prev, network: "AIRTELTIGO" }));
    } else {
      setMomoFields((prev) => ({ ...prev, network: "" }));
    }
  }, [momoFields.msisdn])

  // Set amount when plan is selected
  useEffect(() => {
    if (selectedPlan) {
      setMomoFields(prev => ({
        ...prev,
        amount: selectedPlan.price,
        narration: `Boost campaign for ${selectedPlan.duration_days} days`
      }))
    }
  }, [selectedPlan])

  // Fetch campaign details using authenticated dashboard campaigns endpoint
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return

      try {
        setCampaignLoading(true)
        console.log('=== FETCHING CAMPAIGN DETAILS ===')
        console.log('Campaign ID/slug:', id)

        try {
          // Use the authenticated dashboard campaigns endpoint to get all campaigns
          console.log('Fetching campaigns from:', '/api/v1/dashboard/campaigns')
          const response = await dashboardAPI.getDashboardCampaigns()
          console.log('Dashboard campaigns response:', response.data)

          if (response.data && Array.isArray(response.data)) {
            // Find the campaign by ID or slug
            const campaignId = parseInt(id)
            let foundCampaign = null

            // First try to find by ID (if id is numeric)
            if (!isNaN(campaignId)) {
              foundCampaign = response.data.find((camp: any) => camp.id === campaignId)
              console.log('Searching by ID:', campaignId, 'Found:', !!foundCampaign)
            }

            // If not found by ID, try to find by slug
            if (!foundCampaign) {
              foundCampaign = response.data.find((camp: any) => camp.slug === id)
              console.log('Searching by slug:', id, 'Found:', !!foundCampaign)
            }

            if (foundCampaign) {
              setCampaign(foundCampaign)
              console.log('✅ Campaign loaded successfully:', foundCampaign.title)
              console.log('Campaign ID:', foundCampaign.id)
            } else {
              throw new Error('Campaign not found in dashboard campaigns')
            }
          } else {
            throw new Error('Invalid dashboard campaigns response format')
          }
        } catch (apiError: any) {
          console.error("Dashboard campaigns API fetch failed:", apiError)

          if (apiError.response?.status === 404) {
            setError("Campaign not found")
            toast({
              title: "Campaign Not Found",
              description: "The requested campaign could not be found",
              variant: "destructive",
            })
          } else if (apiError.response?.status === 401) {
            setError("Authentication required")
            toast({
              title: "Authentication Error",
              description: "Please log in to access campaign details",
              variant: "destructive",
            })
          } else {
            console.warn("API fetch failed, using mock data for development")
            // Fallback to mock campaign data for development
            setCampaign({
              id: parseInt(id) || 1,
              title: "Sample Campaign",
              description: "This is a sample campaign description for testing boost functionality",
              goal_amount: "10000.00",
              current_amount: "2500.00",
              image_url: null
            })
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch campaign:", error)
        setError("Failed to load campaign details")
        toast({
          title: "Error",
          description: "Failed to load campaign details",
          variant: "destructive",
        })
      } finally {
        setCampaignLoading(false)
      }
    }

    fetchCampaign()
  }, [id, toast])

  // Handle plan selection
  const handlePlanSelect = (planId: string) => {
    const plan = boostPlans.find(p => p.id === parseInt(planId))
    setSelectedPlan(plan || null)
    setFormData(prev => ({ ...prev, plan_id: parseInt(planId) }))
  }

  // Handle payment method selection
  const handlePaymentMethodSelect = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === parseInt(methodId))
    setSelectedPaymentMethod(method || null)
    setFormData(prev => ({ ...prev, payment_method_id: parseInt(methodId) }))
  }

  // Test API connectivity and authentication
  const testAPIConnectivity = async () => {
    console.log('=== TESTING API CONNECTIVITY ===')

    // Test authenticated dashboard campaigns API
    try {
      console.log('Testing authenticated dashboard campaigns API...')
      const campaignsResponse = await dashboardAPI.getDashboardCampaigns()
      console.log('✅ Dashboard campaigns API response:', campaignsResponse.status, campaignsResponse.data)
    } catch (error: any) {
      console.error('❌ Dashboard campaigns API failed:', error.response?.status, error.response?.data)
    }

    // Test boost plans API
    try {
      console.log('Testing boost plans API...')
      const plansResponse = await dashboardAPI.getBoostPlans()
      console.log('✅ Boost plans API response:', plansResponse.status, plansResponse.data)

      if (plansResponse.data.success && Array.isArray(plansResponse.data.data)) {
        console.log('✅ Boost plans data is valid')
      } else {
        console.warn('⚠️ Boost plans data format unexpected')
      }
    } catch (error: any) {
      console.error('❌ Boost plans API failed:', error.response?.status, error.response?.data)
    }

    // Test payment methods API
    try {
      console.log('Testing payment methods API...')
      const methodsResponse = await dashboardAPI.getPaymentMethods()
      console.log('✅ Payment methods API response:', methodsResponse.status, methodsResponse.data)

      // Check authentication status
      if (methodsResponse.data.authenticated === false) {
        console.warn('⚠️ Payment methods API shows authenticated: false')
        console.warn('This might indicate authentication issues')
      } else {
        console.log('✅ Payment methods API shows user is authenticated')
      }

      if (Array.isArray(methodsResponse.data.methods)) {
        console.log('✅ Payment methods data is valid')
      } else {
        console.warn('⚠️ Payment methods data format unexpected')
      }
    } catch (error: any) {
      console.error('❌ Payment methods API failed:', error.response?.status, error.response?.data)
    }

    // Test dashboard campaigns API and campaign finding
    if (id) {
      try {
        console.log('Testing dashboard campaigns API and campaign finding...')
        const campaignsResponse = await dashboardAPI.getDashboardCampaigns()
        console.log('✅ Dashboard campaigns API response:', campaignsResponse.status)

        if (Array.isArray(campaignsResponse.data)) {
          const campaignId = parseInt(id)
          let foundCampaign = null

          if (!isNaN(campaignId)) {
            foundCampaign = campaignsResponse.data.find((camp: any) => camp.id === campaignId)
          }
          if (!foundCampaign) {
            foundCampaign = campaignsResponse.data.find((camp: any) => camp.slug === id)
          }

          if (foundCampaign) {
            console.log('✅ Campaign found:', foundCampaign.title, 'ID:', foundCampaign.id)
          } else {
            console.warn('⚠️ Campaign not found in dashboard campaigns')
          }
        }
      } catch (error: any) {
        console.error('❌ Dashboard campaigns API failed:', error.response?.status, error.response?.data)
      }
    }

    // Test boost campaign API endpoint structure
    try {
      console.log('Testing boost campaign API endpoint structure...')
      const testCampaignId = 1 // Use a test ID
      const testData = { plan_id: 1, payment_method_id: 1 }
      console.log('Would call:', `/api/v1/boost-campaign/${testCampaignId}`)
      console.log('With data:', testData)
      console.log('⚠️ Skipping actual call to avoid side effects')
    } catch (error: any) {
      console.error('❌ Boost campaign API test failed:', error)
    }

    console.log('=== API CONNECTIVITY TEST COMPLETE ===')
  }

  // Handle form submission - DIRECT API TEST
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== BOOST FORM SUBMITTED - TESTING DEBIT-WALLET API DIRECTLY ===')
    console.log('Form data:', formData)
    console.log('Selected plan:', selectedPlan)
    console.log('Selected payment method:', selectedPaymentMethod)
    console.log('MoMo fields:', momoFields)

    // Clear any previous errors
    setError(null)
    setSuccess(null)

    // Validate required fields
    if (!formData.plan_id) {
      console.error('Validation failed: No plan selected')
      setError('Please select a boost plan')
      return
    }
    if (!formData.payment_method_id) {
      console.error('Validation failed: No payment method selected')
      setError('Please select a payment method')
      return
    }

    // Additional validation for MoMo payment
    if (selectedPaymentMethod?.type === 'mobile_money') {
      if (!momoFields.customer.trim()) {
        console.error('Validation failed: No customer name')
        setError('Please enter customer name')
        return
      }
      if (!momoFields.msisdn.trim()) {
        console.error('Validation failed: No mobile number')
        setError('Please enter mobile number')
        return
      }
      if (!momoFields.network) {
        console.error('Validation failed: Network not detected')
        setError('Network could not be detected. Please check your mobile number')
        return
      }
    }

    console.log('All validations passed, proceeding with direct API call...')

    try {
      setLoading(true)
      console.log('=== TESTING DEBIT-WALLET API DIRECTLY ===')

      // Prepare the exact payload from the form
      const payload = {
        customer: momoFields.customer,
        msisdn: momoFields.msisdn,
        amount: selectedPlan?.price || "1.00",
        network: momoFields.network,
        narration: momoFields.narration
      }

      console.log('Calling debit-wallet endpoint directly with payload:', payload)
      console.log('Endpoint: http://127.0.0.1:8000/api/v1/payments/debit-wallet')

      // Show initial toast
      toast({
        title: "Testing Debit-Wallet API",
        description: "Calling the API directly with fetch()...",
        variant: "default",
      })

      // Call the API directly with fetch
      const response = await fetch('http://127.0.0.1:8000/api/v1/payments/debit-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      console.log('=== DEBIT-WALLET API RESPONSE ===')
      console.log('Response status:', response.status)
      console.log('Response status text:', response.statusText)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      console.log('Response ok:', response.ok)

      // Get the response data
      const responseData = await response.json()
      console.log('=== FULL API RESPONSE ANALYSIS ===')
      console.log('Response data:', responseData)
      console.log('Response data type:', typeof responseData)
      console.log('Response data keys:', Object.keys(responseData))

      // Extract key fields from the response
      console.log('=== RESPONSE FIELD EXTRACTION ===')
      console.log('errorCode:', responseData.errorCode)
      console.log('message:', responseData.message)
      console.log('error:', responseData.error)
      console.log('data object:', responseData.data)

      if (responseData.data) {
        console.log('data.refNo:', responseData.data.refNo)
        console.log('data.transactionId:', responseData.data.transactionId)
        console.log('data.transactionStatus:', responseData.data.transactionStatus)
        console.log('data.msisdn:', responseData.data.msisdn)
        console.log('data.amount:', responseData.data.amount)
        console.log('data.network:', responseData.data.network)
        console.log('data.fee:', responseData.data.fee)
      }

      if (response.ok && responseData.errorCode === "000") {
        // Success response - payment initiated
        const transactionId = responseData.data?.transactionId || responseData.data?.refNo

        // Clear any previous errors and set success message
        setError(null)
        setSuccess(`Payment initiated! Transaction ID: ${transactionId}`)

        toast({
          title: "✅ Payment Initiated Successfully!",
          description: `Transaction ID: ${transactionId}. Check your phone to approve.`,
          variant: "default",
        })

        console.log('✅ SUCCESS: Payment initiated successfully')
        console.log('Transaction ID:', transactionId)
        console.log('Transaction Status:', responseData.data?.transactionStatus)
        console.log('Message:', responseData.message)

        // Show the transaction details
        console.log('=== TRANSACTION DETAILS ===')
        console.log('Amount:', responseData.data?.amount)
        console.log('Network:', responseData.data?.network)
        console.log('Fee:', responseData.data?.fee)
        console.log('Status:', responseData.data?.transactionStatus)

        console.log('=== STARTING STATUS CHECKING ===')
        console.log('Will check status every 3 seconds for 10 times (1 minute total)')
        console.log('Transaction ID to check:', transactionId)

        // Start status checking
        await checkPaymentStatus(transactionId)

      } else if (responseData.errorCode && responseData.errorCode !== "000") {
        // API returned an error code
        const errorMessage = responseData.error || responseData.message || 'Unknown error'

        // Set error state to show below button
        setError(`Error Code ${responseData.errorCode}: ${errorMessage}`)

        // Try multiple ways to show the toast
        try {
          toast({
            title: "❌ Payment Failed",
            description: `Error Code ${responseData.errorCode}: ${errorMessage}`,
            variant: "destructive",
          })
          console.log('✅ Toast called successfully')
        } catch (toastError) {
          console.error('❌ Toast failed:', toastError)
        }

        // Also try alert as backup
        alert(`Payment Failed!\nError Code ${responseData.errorCode}: ${errorMessage}`)

        console.log('❌ ERROR: API returned error code')
        console.log('Error Code:', responseData.errorCode)
        console.log('Error Message:', responseData.error || responseData.message)
        console.log('Transaction Status:', responseData.data?.transactionStatus)

        // Check if this is the specific error code 100
        if (responseData.errorCode === "100" || responseData.errorCode === 100) {
          console.log('=== ERROR CODE 100 DETECTED ===')
          console.log('This is the specific MoMo failure - user cancelled or insufficient balance')
          console.log('DO NOT attempt guest boost - user should try again')
          console.log('No further action needed')
        } else {
          console.log('=== OTHER ERROR CODE DETECTED ===')
          console.log(`Error code ${responseData.errorCode} is NOT the specific failure`)
          console.log('Will attempt guest boost for this error')

          // Attempt guest boost for other error codes
          await attemptGuestBoost(`Payment failed with error code ${responseData.errorCode}: ${errorMessage}`)
        }

      } else {
        // HTTP error response - this is NOT error code 100, so attempt guest boost
        const httpError = `HTTP ${response.status}: ${response.statusText}`
        setError(httpError)

        toast({
          title: "❌ API Call Failed",
          description: `Status: ${response.status} - ${response.statusText}`,
          variant: "destructive",
        })

        console.log('❌ ERROR: HTTP error response')
        console.log('HTTP Status:', response.status)
        console.log('Response data:', responseData)
        console.log('This is NOT error code 100 - will attempt guest boost')

        // Attempt guest boost for HTTP errors
        await attemptGuestBoost('HTTP error - payment could not be processed')
      }

    } catch (error: any) {
      console.error('=== FETCH ERROR ===')
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      console.error('Error name:', error.name)
      console.error('Error stack:', error.stack)

      toast({
        title: "❌ Network Error",
        description: `Failed to call API: ${error.message}`,
        variant: "destructive",
      })

      setError(`Network error: ${error.message}`)

      console.log('Network error occurred - this is NOT error code 100, will attempt guest boost')

      // Attempt guest boost for network errors
      await attemptGuestBoost(`Network error: ${error.message}`)

    } finally {
      setLoading(false)
      console.log('=== API TEST COMPLETED ===')
    }
  }

  // Check payment status every 3 seconds for 5 times (15 seconds total)
  const checkPaymentStatus = async (transactionId: string) => {
    console.log('=== PAYMENT STATUS CHECKING STARTED ===')
    console.log('Transaction ID:', transactionId)

    let pollCount = 0
    const maxPolls = 3 // 5 times (15 seconds total)
    const pollInterval = 2000 // 3 seconds

    for (let i = 0; i < maxPolls; i++) {
      pollCount = i + 1
      console.log(`=== STATUS CHECK ${pollCount}/${maxPolls} ===`)

      // Wait 3 seconds before each check (except first one)
      if (i > 0) {
        console.log('Waiting 3 seconds before next status check...')
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }

      try {
        console.log(`Calling check-status API for transaction: ${transactionId}`)

        // Try different methods for check-status API
        let statusResponse: Response
        let statusData: any

        try {
          // First try POST method
          console.log('Trying POST method for check-status...')
          statusResponse = await fetch('http://127.0.0.1:8000/api/v1/payments/check-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ refNo: transactionId })
          })

          if (statusResponse.status === 405) {
            console.log('POST method not allowed, trying GET method...')
            // Try GET method with query parameter
            statusResponse = await fetch(`http://127.0.0.1:8000/api/v1/payments/check-status?refNo=${transactionId}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              }
            })
          }

          if (statusResponse.status === 405 || statusResponse.status === 404) {
            console.log('Standard endpoints failed, trying alternative endpoint...')
            // Try alternative endpoint structure
            statusResponse = await fetch(`http://127.0.0.1:8000/api/v1/payments/status/${transactionId}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              }
            })
          }
        } catch (fetchError) {
          console.error('All check-status methods failed:', fetchError)
          throw fetchError
        }

        console.log(`Status check response status: ${statusResponse.status}`)

        statusData = await statusResponse.json()
        console.log('Status check response data:', statusData)

        // Show progress toast
        toast({
          title: `Checking Payment Status (${pollCount}/${maxPolls})`,
          description: `Status: ${statusData.status || 'Unknown'}`,
          variant: "default",
        })

        // Check if payment was successful
        if (statusData.status === 'success' || statusData.status === 'completed' || statusData.status === 'approved') {
          console.log('✅ PAYMENT CONFIRMED SUCCESSFUL!')
          console.log('Final status:', statusData.status)

          // Payment successful - record regular boost
          await recordSuccessfulBoost(transactionId, statusData.status)
          return // Exit the polling loop
        }

        // Check if payment failed with error code 100
        if (statusData.errorCode === "100" || statusData.errorCode === 100) {
          console.log('❌ PAYMENT FAILED - ERROR CODE 100 DETECTED')
          console.log('User cancelled or insufficient balance - NO GUEST BOOST')

          setError('Payment failed: User cancelled or insufficient balance')
          toast({
            title: "❌ Payment Failed",
            description: "Payment was cancelled or insufficient balance. Please try again.",
            variant: "destructive",
          })
          return // Exit the polling loop - no guest boost
        }

        // Continue polling for other statuses (pending, processing, etc.)
        console.log(`Status: ${statusData.status || 'Unknown'} - continuing to poll...`)

      } catch (statusError: any) {
        console.error(`Status check ${pollCount} failed:`, statusError)

        // Continue polling even if individual status check fails
        toast({
          title: `Status Check ${pollCount} Failed`,
          description: 'Continuing to check...',
          variant: "default",
        })
      }
    }

    // If we reach here, all 5 status checks completed without success or error code 100
    console.log('=== STATUS CHECKING COMPLETED - NO CONFIRMATION RECEIVED ===')
    console.log('Checked 5 times over 15 seconds - no payment confirmation')
    console.log('Will attempt guest boost as fallback')

    // Show toast before attempting guest boost
    toast({
      title: "Status Check Complete",
      description: "Payment status unclear. Recording as guest boost...",
      variant: "default",
    })

    // Attempt guest boost after timeout
    console.log('Calling attemptGuestBoost function...')
    await attemptGuestBoost('Payment status could not be confirmed after 15 seconds')
    console.log('attemptGuestBoost function completed')
  }

  // Record successful boost when payment is confirmed
  const recordSuccessfulBoost = async (transactionId: string, paymentStatus: string) => {
    if (!campaign?.id) {
      console.log('❌ Cannot record boost - no campaign ID')
      return
    }

    try {
      console.log('=== RECORDING SUCCESSFUL BOOST ===')
      console.log('Transaction ID:', transactionId)
      console.log('Payment Status:', paymentStatus)
      console.log('Campaign ID:', campaign.id)

      toast({
        title: "Recording Boost",
        description: "Payment confirmed! Recording your boost...",
        variant: "default",
      })

      const boostResponse = await dashboardAPI.boostCampaign(campaign.id, formData)
      console.log('Successful boost response:', boostResponse.data)

      if (boostResponse.data.success) {
        setSuccess('Boost successful! Your campaign has been boosted.')
        toast({
          title: '✅ Boost Successful!',
          description: 'Thank you for boosting this campaign!'
        })
        console.log('✅ Successful boost recorded')

        // Redirect to campaigns page after 3 seconds
        console.log('Redirecting to campaigns page in 3 seconds...')
        setTimeout(() => {
          navigate('/campaigns')
        }, 3000)

      } else {
        setError('Payment successful but boost recording failed. Please contact support.')
        toast({
          title: 'Boost Recording Failed',
          description: boostResponse.data.message || 'Failed to record boost.'
        })
        console.log('❌ Boost recording failed:', boostResponse.data.message)
      }

    } catch (boostError: any) {
      console.error('=== SUCCESSFUL BOOST RECORDING ERROR ===')
      console.error('Boost recording error:', boostError)

      setError('Payment successful but boost recording failed. Please contact support.')
      toast({
        title: 'Boost Recording Error',
        description: boostError.message || 'Failed to record boost.'
      })
    }
  }

  // Guest boost function for when payment fails (but not error code 100)
  const attemptGuestBoost = async (reason: string) => {
    console.log('=== GUEST BOOST FUNCTION CALLED ===')
    console.log('Reason:', reason)
    console.log('Campaign object:', campaign)
    console.log('Campaign ID:', campaign?.id)
    console.log('Form data:', formData)

    if (!campaign?.id) {
      console.log('❌ Cannot attempt guest boost - no campaign ID')
      setError('Cannot record boost - campaign not found')
      toast({
        title: "❌ Guest Boost Failed",
        description: "Campaign not found. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('=== ATTEMPTING GUEST BOOST ===')
      console.log('Calling dashboardAPI.boostCampaign...')
      console.log('Parameters: campaignId =', campaign.id, ', formData =', formData)

      toast({
        title: "Recording Guest Boost",
        description: "Payment could not be verified. Recording boost as guest...",
        variant: "default",
      })

      const guestBoostResponse = await dashboardAPI.boostCampaign(campaign.id, formData)
      console.log('=== GUEST BOOST API RESPONSE ===')
      console.log('Response status:', guestBoostResponse.status)
      console.log('Response data:', guestBoostResponse.data)
      console.log('Response data type:', typeof guestBoostResponse.data)
      console.log('Response data keys:', Object.keys(guestBoostResponse.data))

      console.log('=== CHECKING GUEST BOOST SUCCESS ===')
      console.log('guestBoostResponse.data.success:', guestBoostResponse.data.success)
      console.log('Type of success field:', typeof guestBoostResponse.data.success)

      if (guestBoostResponse.data.success) {
        console.log('✅ GUEST BOOST SUCCESS DETECTED')

        setSuccess('Guest boost recorded successfully! Contact support if payment was deducted.')

        console.log('Showing success toast...')
        toast({
          title: '✅ Guest Boost Recorded',
          description: 'Thank you for your boost! Contact support if payment was deducted.',
          variant: "default",
        })

        // Also try alert as backup
        alert('✅ Guest Boost Successful!\nThank you for your boost! Contact support if payment was deducted.')

        console.log('✅ Guest boost recorded successfully')

        // Redirect to campaigns page after 3 seconds
        console.log('Redirecting to campaigns page in 3 seconds...')
        setTimeout(() => {
          console.log('Executing redirect to /campaigns')
          navigate('/campaigns')
        }, 3000)

      } else {
        console.log('❌ GUEST BOOST FAILED')
        console.log('Response data:', guestBoostResponse.data)

        setError('Failed to record guest boost. Please try again.')
        toast({
          title: '❌ Guest Boost Error',
          description: guestBoostResponse.data.message || 'Failed to record boost.',
          variant: "destructive",
        })

        // Also try alert as backup
        alert('❌ Guest Boost Failed!\n' + (guestBoostResponse.data.message || 'Failed to record boost.'))

        console.log('❌ Guest boost failed:', guestBoostResponse.data.message)
      }

    } catch (guestError: any) {
      console.error('=== GUEST BOOST ERROR ===')
      console.error('Guest boost error object:', guestError)
      console.error('Error message:', guestError.message)
      console.error('Error response:', guestError.response)
      console.error('Error response data:', guestError.response?.data)

      setError('Failed to record guest boost. Please contact support.')

      toast({
        title: '❌ Guest Boost Error',
        description: guestError.message || 'Failed to record boost.',
        variant: "destructive",
      })

      // Also try alert as backup
      alert('❌ Guest Boost Error!\n' + (guestError.message || 'Failed to record boost.'))

      console.log('Guest boost function completed with error')
    }

    console.log('=== GUEST BOOST FUNCTION COMPLETED ===')
  }

  // Test API endpoints directly with fetch
  const testAPIEndpointsDirectly = async () => {
    console.log('=== TESTING API ENDPOINTS DIRECTLY WITH FETCH ===')

    // Test debit-wallet endpoint directly
    const testPayload = {
      customer: momoFields.customer || "Test Customer",
      msisdn: momoFields.msisdn || "0598890221",
      amount: "1.00",
      network: momoFields.network || "MTN",
      narration: momoFields.narration || "Test boost payment"
    }

    console.log('Testing debit-wallet endpoint with payload:', testPayload)

    try {
      const debitResponse = await fetch('http://127.0.0.1:8000/api/v1/payments/debit-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(testPayload)
      })

      console.log('✅ Debit-wallet fetch response status:', debitResponse.status)
      console.log('✅ Debit-wallet fetch response headers:', Object.fromEntries(debitResponse.headers.entries()))

      const debitData = await debitResponse.json()
      console.log('✅ Debit-wallet fetch response data:', debitData)

      // Test check-status endpoint if we got a transaction ID
      if (debitData.transactionId) {
        console.log('Testing check-status endpoint with transactionId:', debitData.transactionId)

        try {
          const statusResponse = await fetch('http://127.0.0.1:8000/api/v1/payments/check-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ refNo: debitData.transactionId })
          })

          console.log('✅ Check-status fetch response status:', statusResponse.status)
          const statusData = await statusResponse.json()
          console.log('✅ Check-status fetch response data:', statusData)

        } catch (statusError) {
          console.error('❌ Check-status fetch failed:', statusError)
        }
      } else {
        console.warn('⚠️ No transactionId in debit-wallet response, skipping status check')
      }

    } catch (debitError) {
      console.error('❌ Debit-wallet fetch failed:', debitError)
    }

    // Test boost-campaign endpoint
    if (campaign?.id) {
      console.log('Testing boost-campaign endpoint...')
      const boostPayload = {
        plan_id: selectedPlan?.id || 1,
        payment_method_id: selectedPaymentMethod?.id || 1
      }

      try {
        const boostResponse = await fetch(`http://127.0.0.1:8000/api/v1/boost-campaign/${campaign.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
          },
          body: JSON.stringify(boostPayload)
        })

        console.log('✅ Boost-campaign fetch response status:', boostResponse.status)
        const boostData = await boostResponse.json()
        console.log('✅ Boost-campaign fetch response data:', boostData)

      } catch (boostError) {
        console.error('❌ Boost-campaign fetch failed:', boostError)
      }
    }
  }

  if (campaignLoading) {
    return (
      <div className="space-y-6 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Boost Campaign</h2>
            <p className="text-muted-foreground">Loading campaign details...</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="space-y-6 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Boost Campaign</h2>
            <p className="text-muted-foreground">Campaign not found</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p>Campaign not found or failed to load.</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => navigate('/campaigns')}
                >
                  Back to Campaigns
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Boost Campaign</h2>
          <p className="text-muted-foreground">Increase your campaign's visibility</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
          {/* Campaign Preview */}
          <Card className="shadow-lg border-0" style={{ boxShadow: '0 10px 25px -5px rgba(55, 183, 255, 0.1), 0 8px 10px -6px rgba(55, 183, 255, 0.1)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#37b7ff]" />
                Campaign to Boost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative">
                  <img
                    src={getImageUrl(campaign.image_url)}
                    alt={campaign.title}
                    className="w-full h-48 object-cover rounded-lg"
                    onLoad={() => {
                      console.log('✅ Image loaded successfully:', getImageUrl(campaign.image_url))
                    }}
                    onError={(e) => {
                      console.log('❌ Image failed to load:', campaign.image_url)
                      console.log('Original URL:', campaign.image_url)
                      console.log('Processed URL:', getImageUrl(campaign.image_url))
                      console.log('Setting fallback to placeholder')
                      e.currentTarget.src = '/placeholder.svg?height=400&width=600'
                    }}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{campaign.title}</h3>
                  <p className="text-muted-foreground">{campaign.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((parseFloat(campaign.current_amount) / parseFloat(campaign.goal_amount)) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-[#37b7ff]"
                        style={{ width: `${Math.min((parseFloat(campaign.current_amount) / parseFloat(campaign.goal_amount)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <DollarSign className="mr-1 h-4 w-4" />
                        {formatCurrency(campaign.current_amount)} raised
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Goal: {formatCurrency(campaign.goal_amount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boost Form */}
          <Card className="shadow-lg border-0" style={{ boxShadow: '0 10px 25px -5px rgba(255, 215, 0, 0.1), 0 8px 10px -6px rgba(255, 215, 0, 0.1)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Select Boost Plan
              </CardTitle>
              <CardDescription>Choose a plan to boost your campaign's visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 whitespace-pre-line">
                    {error}
                  </div>
                )}



                {success && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                    {success}
                  </div>
                )}

                {/* Payment Processing Status */}
                {paymentStep === 'processing' && (
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-700">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                      <div>
                        <div className="font-semibold">Initiating Payment...</div>
                        <div className="text-xs mt-1">Setting up your mobile money payment</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Verification Countdown */}
                {paymentStep === 'checking' && timeRemaining > 0 && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Verifying Payment...</div>
                        <div className="text-xs mt-1">Please complete the payment on your mobile device. You have up to 30 seconds.</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{timeRemaining}s</div>
                        <div className="text-xs">Time remaining</div>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(timeRemaining / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Campaign Boosting Status */}
                {paymentStep === 'boosting' && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      <div>
                        <div className="font-semibold">Boosting Campaign...</div>
                        <div className="text-xs mt-1">Payment successful! Applying boost to your campaign</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Boost Plans */}
                <div className="space-y-4">
                  <Label>Choose Boost Plan *</Label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {boostPlans.map((plan) => (
                      <Card 
                        key={plan.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedPlan?.id === plan.id 
                            ? 'ring-2 ring-yellow-500 bg-yellow-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handlePlanSelect(plan.id.toString())}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {plan.duration_days} days
                          </div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {formatCurrency(plan.price)}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                              Featured placement
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                              Priority in search results
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                              Enhanced visibility for {plan.duration_days} days
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select 
                    value={formData.payment_method_id.toString()} 
                    onValueChange={handlePaymentMethodSelect}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            {method.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* MoMo Payment Fields */}
                {selectedPaymentMethod?.type === 'mobile_money' && (
                  <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-semibold text-blue-800">Mobile Money Payment Details</h4>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer">Customer Name *</Label>
                        <Input
                          id="customer"
                          type="text"
                          placeholder="Enter your full name"
                          value={momoFields.customer}
                          onChange={(e) => setMomoFields(prev => ({ ...prev, customer: e.target.value }))}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="msisdn">Mobile Number *</Label>
                        <Input
                          id="msisdn"
                          type="tel"
                          placeholder="e.g., 0501769307"
                          value={momoFields.msisdn}
                          onChange={(e) => setMomoFields(prev => ({ ...prev, msisdn: e.target.value }))}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="network">Network</Label>
                        <Input
                          id="network"
                          type="text"
                          value={momoFields.network}
                          readOnly
                          className="h-12 bg-gray-100"
                          placeholder="Auto-detected"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (GHS)</Label>
                        <Input
                          id="amount"
                          type="text"
                          value={momoFields.amount}
                          readOnly
                          className="h-12 bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="narration">Narration</Label>
                      <Input
                        id="narration"
                        type="text"
                        value={momoFields.narration}
                        onChange={(e) => setMomoFields(prev => ({ ...prev, narration: e.target.value }))}
                        className="h-12"
                        placeholder="Payment description"
                      />
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedPlan && (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Boost Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Plan:</span>
                          <span>{selectedPlan.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{selectedPlan.duration_days} days</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{formatCurrency(selectedPlan.price)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Debug Button */}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={testAPIConnectivity}
                    className="text-xs"
                  >
                    Test API Connectivity
                  </Button>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/campaigns')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !selectedPlan || parseFloat(selectedPlan?.price || '0') === 0}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold shadow-lg transform transition-all hover:scale-[1.02]"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    {loading ? (
                      paymentStep === 'processing' ? "Processing Payment..." :
                      paymentStep === 'checking' ? `Verifying Payment... (${timeRemaining}s)` :
                      paymentStep === 'boosting' ? "Boosting Campaign..." :
                      "Processing..."
                    ) : `Boost for ${formatCurrency(selectedPlan?.price || '0')}`}
                  </Button>
                </div>
              </form>

              {/* Direct API Test Button */}
              <div className="mt-4 p-4 border-t">
                <Button
                  type="button"
                  onClick={testAPIEndpointsDirectly}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={loading}
                >
                  🔧 Test API Endpoints Directly (Check Console)
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This will test the payment endpoints directly with fetch() to verify they work
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
