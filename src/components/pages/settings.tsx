import { User, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { dashboardAPI } from "@/lib/api"

export function SettingsPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: ""
  })
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      const nameParts = getNameParts(user.name)
      setProfileData({
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || ""
      })
    }
  }, [user])

  // Split the user's full name into first and last name
  const getNameParts = (fullName: string) => {
    const parts = fullName.split(" ")
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || ""
    }
  }

  // Populate form data when user data loads
  useEffect(() => {
    if (user) {
      const nameParts = getNameParts(user.name)
      setProfileData({
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || ""
      })
      console.log('📋 Profile data populated from user:', {
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country
      })
    }
  }, [user])
  const handleProfileUpdate = async () => {
    setIsUpdating(true)
    try {
      console.log('🔄 Updating user profile...')
      
      // Prepare the payload
      const payload = {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        email: profileData.email,
        phone: profileData.phone,
        country: profileData.country
      }
      
      console.log('📦 Profile update payload:', payload)
      
      // Call the API
      const response = await dashboardAPI.updateUserProfileNew(payload)
      console.log('✅ Profile update response:', response.data)
      
      if (response.data.success) {
        toast({
          title: "Profile Updated",
          description: response.data.message || "Your profile information has been updated successfully.",
        })
        console.log('✅ Profile updated successfully')
      } else {
        throw new Error(response.data.message || "Failed to update profile")
      }
      
    } catch (error: any) {
      console.error('❌ Profile update failed:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      
      let errorMessage = "Failed to update profile. Please try again."
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        errorMessage = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`).join('\n')
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle password update with API integration
  const handlePasswordUpdate = async () => {
    setIsUpdatingPassword(true)
    try {
      console.log('🔄 Updating user password...')
      
      // Validation
      if (!passwordData.currentPassword) {
        throw new Error("Current password is required")
      }
      if (!passwordData.newPassword) {
        throw new Error("New password is required")
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("New password and confirmation do not match")
      }
      if (passwordData.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters long")
      }
      
      // Prepare the payload
      const payload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      }
      
      console.log('📦 Password update payload:', { ...payload, currentPassword: '[HIDDEN]', newPassword: '[HIDDEN]', confirmPassword: '[HIDDEN]' })
      
      // Call the API
      const response = await dashboardAPI.updateUserPassword(payload)
      console.log('✅ Password update response:', response.data)
      
      if (response.data.success) {
        // Clear password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        
        toast({
          title: "Password Updated",
          description: response.data.message || "Your password has been updated successfully.",
        })
        console.log('✅ Password updated successfully')
      } else {
        throw new Error(response.data.message || "Failed to update password")
      }
      
    } catch (error: any) {
      console.error('❌ Password update failed:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      
      let errorMessage = "Failed to update password. Please try again."
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        errorMessage = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`).join('\n')
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">
          {loading ? "Loading your account settings..." : "Manage your account preferences and settings"}
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Summary Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Current User Information
            </CardTitle>
            <CardDescription>Your account details summary</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">Loading user information...</div>
              </div>
            ) : user ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-lg font-semibold">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Address</p>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Type</p>
                  <p className="text-lg font-semibold capitalize">{user.role}</p>
                </div>
                {/* <div>
                  <p className="text-sm font-medium text-gray-600">User ID</p>
                  <p className="text-lg font-semibold">{user.id}</p>
                </div> */}
                {user.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone Number</p>
                    <p className="text-lg font-semibold">{user.phone}</p>
                  </div>
                )}
                {user.country && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Country</p>
                    <p className="text-lg font-semibold">{user.country}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No user information available</p>
            )}
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information and profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({...prev, firstName: e.target.value}))}
                  placeholder="Enter your first name"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({...prev, lastName: e.target.value}))}
                  placeholder="Enter your last name"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                placeholder="Enter your email address"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input 
                id="country" 
                value={profileData.country}
                onChange={(e) => setProfileData(prev => ({...prev, country: e.target.value}))}
                placeholder="Enter your country"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Input 
                id="role" 
                defaultValue={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                placeholder="Account type"
                disabled={true}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Account type cannot be changed</p>
            </div>
            <Button 
              onClick={handleProfileUpdate}
              disabled={loading || isUpdating}
            >
              {isUpdating ? "Updating..." : loading ? "Loading..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                type="password" 
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                placeholder="Enter your current password"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password" 
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                placeholder="Enter a new password"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                placeholder="Confirm your new password"
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handlePasswordUpdate}
              disabled={loading || isUpdatingPassword}
            >
              {isUpdatingPassword ? "Updating..." : loading ? "Loading..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
       {/*  <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Campaign Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified about campaign milestones</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Donations</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for new donations</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive promotional content</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>*/}

        {/* Payment Settings */}
           {/*<Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Manage your payment methods and billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 rounded bg-muted flex items-center justify-center text-xs font-medium">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Remove
                </Button>
              </div>
            </div>
            <Button variant="outline">Add Payment Method</Button>
          </CardContent>
        </Card>*/}
      </div>
    </div>
  )
}
