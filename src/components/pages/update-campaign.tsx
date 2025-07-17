import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, ArrowLeft } from "lucide-react"
import { useToast } from '../../hooks/use-toast'
import { dashboardAPI } from "../../lib/api"

// Helper function to get proper image URL
const getImageUrl = (url: string | null) => {
  console.log('=== getImageUrl called (update-campaign) ===')
  console.log('Input URL:', url)
  
  if (!url) {
    console.log('No URL provided, returning placeholder')
    return '/placeholder.svg?height=400&width=600'
  }
  
  if (url.startsWith('http')) {
    // Fix localhost URLs to use 127.0.0.1:8000
    if (url.includes('localhost/storage/')) {
      const fixedUrl = url.replace('http://localhost/', 'http://127.0.0.1:8000/')
      console.log('Fixed localhost URL:', url, '→', fixedUrl)
      return fixedUrl
    }
    console.log('URL is absolute, returning as-is:', url)
    return url
  }
  
  const fullUrl = `http://127.0.0.1:8000${url}`
  console.log('URL is relative, returning full URL:', fullUrl)
  return fullUrl
}

interface UpdateCampaignData {
  user_id: number
  category_id: number
  title: string
  slug: string
  description: string
  goal_amount: number
  start_date: string
  end_date: string
  thumbnail: string
  visibility: "public" | "private"
  image_url: string
  image_file?: File
}

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
  visibility: string
  thumbnail: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export function UpdateCampaignPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [campaignLoading, setCampaignLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState<UpdateCampaignData>({
    user_id: 1,
    category_id: 1,
    title: "",
    slug: "",
    description: "",
    goal_amount: 0,
    start_date: "",
    end_date: "",
    thumbnail: "",
    visibility: "public",
    image_url: "",
  })

  // Fetch campaign data on mount
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!slug) return

      try {
        setCampaignLoading(true)
        console.log('Fetching campaign for update:', slug)
        
        const response = await dashboardAPI.getCampaignBySlug(slug)
        console.log('Campaign data received:', response.data)
        
        if (response.data) {
          const campaignData = response.data
          setCampaign(campaignData)
          
          // Populate form with existing data
          setFormData({
            user_id: campaignData.user_id,
            category_id: campaignData.category_id,
            title: campaignData.title,
            slug: campaignData.slug,
            description: campaignData.description,
            goal_amount: parseFloat(campaignData.goal_amount),
            start_date: campaignData.start_date,
            end_date: campaignData.end_date,
            thumbnail: campaignData.thumbnail || "",
            visibility: campaignData.visibility as "public" | "private",
            image_url: campaignData.image_url || "",
          })
          
          // Set image preview if exists
          if (campaignData.image_url) {
            setImagePreview(getImageUrl(campaignData.image_url))
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch campaign:', error)
        setError('Failed to load campaign data')
        toast({
          title: "Error",
          description: "Failed to load campaign data",
          variant: "destructive",
        })
      } finally {
        setCampaignLoading(false)
      }
    }

    fetchCampaign()
  }, [slug, toast])

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Handle input changes
  const handleInputChange = (field: keyof UpdateCampaignData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-generate slug when title changes
      if (field === 'title' && typeof value === 'string') {
        updated.slug = generateSlug(value)
      }
      
      return updated
    })
    setError(null)
  }

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }

      setFormData(prev => ({ ...prev, image_file: file, thumbnail: file.name }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  // Remove uploaded image
  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_file: undefined, thumbnail: "", image_url: "" }))
    setImagePreview(campaign?.image_url ? getImageUrl(campaign.image_url) : null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug) return

    setError(null)
    setLoading(true)

    try {
      console.log('=== UPDATING CAMPAIGN ===')
      console.log('Campaign slug:', slug)
      console.log('Form data:', formData)

      // Validation
      if (!formData.title.trim()) {
        setError('Campaign title is required')
        return
      }
      if (!formData.description.trim()) {
        setError('Campaign description is required')
        return
      }
      if (formData.goal_amount <= 0) {
        setError('Goal amount must be greater than 0')
        return
      }

      // Prepare form data for submission
      const submitData = new FormData()
      
      // Add all form fields
      submitData.append('user_id', formData.user_id.toString())
      submitData.append('category_id', formData.category_id.toString())
      submitData.append('title', formData.title)
      submitData.append('slug', formData.slug)
      submitData.append('description', formData.description)
      submitData.append('goal_amount', formData.goal_amount.toString())
      submitData.append('start_date', formData.start_date)
      submitData.append('end_date', formData.end_date)
      submitData.append('visibility', formData.visibility)
      submitData.append('_method', 'PUT') // Laravel method spoofing for PUT request

      // Add image file if uploaded
      if (formData.image_file) {
        submitData.append('image', formData.image_file)
        submitData.append('thumbnail', formData.thumbnail)
      } else {
        // Keep existing thumbnail if no new image
        submitData.append('thumbnail', formData.thumbnail)
      }

      // Debug: Log the form data being sent
      console.log('Submitting campaign update:')
      for (let [key, value] of submitData.entries()) {
        console.log(key, value)
      }

      // Call API to update campaign
      const response = await dashboardAPI.updateCampaign(slug, submitData)

      // Success - redirect to campaigns page with success message
      console.log('Campaign updated successfully:', response.data)
      
      toast({
        title: "Campaign Updated",
        description: "Your campaign has been updated successfully!",
        variant: "default",
      })
      
      navigate('/campaigns')

    } catch (error: any) {
      console.error('Failed to update campaign:', error)
      
      let errorMessage = 'Failed to update campaign. Please try again.'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        errorMessage = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`).join('\n')
      }
      
      setError(errorMessage)
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (campaignLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37b7ff] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading campaign data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">The campaign you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Button onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/campaigns')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Update Campaign</h1>
            <p className="text-muted-foreground">Edit your campaign details</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Information</CardTitle>
            <CardDescription>
              Update your campaign details. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                </div>
              )}

              {/* Campaign Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter campaign title"
                  required
                />
              </div>

              {/* Campaign Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Campaign URL Slug *</Label>
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="campaign-url-slug"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be used in the campaign URL: /campaigns/{formData.slug}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your campaign..."
                  rows={4}
                  required
                />
              </div>

              {/* Goal Amount */}
              <div className="space-y-2">
                <Label htmlFor="goal_amount">Goal Amount (GHS) *</Label>
                <Input
                  id="goal_amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.goal_amount}
                  onChange={(e) => handleInputChange('goal_amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label>Visibility *</Label>
                <Select 
                  value={formData.visibility} 
                  onValueChange={(value: "public" | "private") => handleInputChange('visibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can see this campaign</SelectItem>
                    <SelectItem value="private">Private - Only you can see this campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Campaign Image</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Campaign preview"
                        className="w-full h-48 object-cover rounded-lg"
                        onLoad={() => {
                          console.log('✅ Update campaign image loaded successfully:', imagePreview)
                        }}
                        onError={(e) => {
                          console.log('❌ Update campaign image failed to load:', imagePreview)
                          e.currentTarget.src = '/placeholder.svg?height=400&width=600'
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-sm font-medium text-[#37b7ff] hover:text-sky-500">
                            Click to upload new image
                          </span>
                          <span className="text-sm text-muted-foreground"> or drag and drop</span>
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-[#37b7ff] hover:bg-[#2a8fc7] text-white"
                  disabled={loading}
                >
                  {loading ? 'Updating Campaign...' : 'Update Campaign'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/campaigns')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
