"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, X, Calendar, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dashboardAPI } from "../../lib/api"
import { useAuth } from "@/contexts/auth-context"

// Helper function to get proper image URL
/*
const getImageUrl = (url: string | null) => {
  console.log('=== getImageUrl called (create-campaign) ===')
  console.log('Input URL:', url)

  if (!url) {
    console.log('No URL provided, returning placeholder')
    return '/placeholder.svg?height=400&width=600'
  }

  if (url.startsWith('http')) {
    // Fix localhost URLs to use production API
    if (url.includes('localhost/storage/')) {
      const fixedUrl = url.replace('http://localhost/', 'https://admin.myeasydonate.com/')
      console.log('Fixed localhost URL:', url, '→', fixedUrl)
      return fixedUrl
    }
    console.log('URL is absolute, returning as-is:', url)
    return url
  }

  const fullUrl = `https://admin.myeasydonate.com${url}`
  console.log('URL is relative, returning full URL:', fullUrl)
  return fullUrl
};
*/

interface Category {
  id: number
  name: string
  description: string
  created_at: string | null
  updated_at: string | null
}

interface CreateCampaignData {
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

export function CreateCampaignPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState<CreateCampaignData>({
    user_id: parseInt(user?.id || '0'), // Use authenticated user ID
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

  // Update user_id when user context changes
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({ ...prev, user_id: parseInt(user.id) }))
    }
  }, [user])

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await dashboardAPI.getCategories()
        console.log('Fetched categories:', response.data)
        setCategories(response.data || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        // Set fallback categories if API fails
        setCategories([
          { id: 1, name: "General", description: "General category", created_at: null, updated_at: null },
          { id: 2, name: "Education", description: "Education category", created_at: null, updated_at: null },
          { id: 3, name: "Health", description: "Health category", created_at: null, updated_at: null },
        ])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Handle form input changes
  const handleInputChange = (field: keyof CreateCampaignData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-generate slug when title changes
      if (field === 'title') {
        updated.slug = generateSlug(value as string)
      }
      
      return updated
    })
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
    setImagePreview(null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Check authentication
    if (!isAuthenticated || !user?.id) {
      setError('You must be logged in to create a campaign')
      return
    }

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
    if (!formData.start_date) {
      setError('Start date is required')
      return
    }
    if (!formData.end_date) {
      setError('End date is required')
      return
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError('End date must be after start date')
      return
    }

    try {
      setLoading(true)

      // Prepare form data for submission
      const submitData = new FormData()

      // Add all form fields including authenticated user ID
      submitData.append('user_id', formData.user_id.toString())
      submitData.append('category_id', formData.category_id.toString())
      submitData.append('title', formData.title.trim())
      submitData.append('slug', formData.slug.trim())
      submitData.append('description', formData.description.trim())
      submitData.append('goal_amount', formData.goal_amount.toString())
      submitData.append('start_date', formData.start_date)
      submitData.append('end_date', formData.end_date)
      submitData.append('visibility', formData.visibility)

      // Add image file if uploaded
      if (formData.image_file) {
        submitData.append('image', formData.image_file)
        submitData.append('thumbnail', formData.thumbnail)
      } else {
        // Add empty thumbnail if no image
        submitData.append('thumbnail', '')
      }

      // Debug: Log the form data being sent
      console.log('Submitting campaign data with authenticated user ID:', formData.user_id)
      for (let [key, value] of submitData.entries()) {
        console.log(key, value)
      }

      // Call API to create campaign
      const response = await dashboardAPI.createCampaign(submitData)

      // Success - redirect to campaigns page with success message
      console.log('Campaign created successfully:', response.data)
      navigate('/campaigns')
      
    } catch (error: any) {
      console.error('Failed to create campaign:', error)

      // Handle different types of errors
      let errorMessage = 'Failed to create campaign. Please try again.'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors
        errorMessage = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`).join('\n')
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Create Campaign</h2>
          <p className="text-muted-foreground">Start your fundraising journey</p>
        </div>
        <div className="w-10"></div> {/* Spacer to balance the back button */}
      </div>

      {!isAuthenticated || !user ? (
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                {!isAuthenticated ? "Please log in to create a campaign" : "Loading user data..."}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl shadow-lg border-0" style={{ boxShadow: '0 10px 25px -5px rgba(55, 183, 255, 0.1), 0 8px 10px -6px rgba(55, 183, 255, 0.1)' }}>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Fill in the information below to create your campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 whitespace-pre-line">
                {error}
              </div>
            )}

            {/* Campaign Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                placeholder="Enter campaign title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="h-12"
                required
              />
            </div>

            {/* Campaign Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Campaign URL Slug</Label>
              <Input
                id="slug"
                placeholder="campaign-url-slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                This will be used in the campaign URL. Auto-generated from title.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your campaign and why people should support it..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[120px]"
                required
              />
            </div>

            {/* Goal Amount */}
            <div className="space-y-2">
              <Label htmlFor="goal_amount">Goal Amount (GHS) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₵</span>
                <Input
                  id="goal_amount"
                  type="number"
                  placeholder="0"
                  value={formData.goal_amount || ''}
                  onChange={(e) => handleInputChange('goal_amount', parseFloat(e.target.value) || 0)}
                  className="h-12 pl-10"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="h-12 pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className="h-12 pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category_id.toString()} 
                onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
                disabled={loadingCategories}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingCategories && (
                <p className="text-xs text-muted-foreground">Loading categories...</p>
              )}
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select 
                value={formData.visibility} 
                onValueChange={(value: "public" | "private") => handleInputChange('visibility', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Public - Anyone can see this campaign
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4" />
                      Private - Only you can see this campaign
                    </div>
                  </SelectItem>
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
                          Click to upload
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
                    <p className="text-xs text-orange-600 mt-1">
                      Note: If images don't display after upload, check your server's CORS configuration
                    </p>
                  </div>
                )}
              </div>
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
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#37b7ff] to-sky-600 hover:from-sky-500 hover:to-sky-700"
              >
                {loading ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
        </div>
      )}
    </div>
  )
}
