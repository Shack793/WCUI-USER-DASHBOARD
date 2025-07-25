import { User, Lock } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SettingsPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Split the user's full name into first and last name
  const getNameParts = (fullName: string) => {
    const parts = fullName.split(" ")
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || ""
    }
  }

  const nameParts = user ? getNameParts(user.name) : { firstName: "", lastName: "" }

  // Handle profile update (placeholder for future API integration)
  const handleProfileUpdate = async () => {
    setIsUpdating(true)
    try {
      // TODO: Implement API call to update profile
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle password update (placeholder for future API integration)
  const handlePasswordUpdate = async () => {
    setIsUpdatingPassword(true)
    try {
      // TODO: Implement API call to update password
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update password. Please try again.",
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
                  <p className="text-sm font-medium text-gray-600">Full Name</p>
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
                <div>
                  <p className="text-sm font-medium text-gray-600">User ID</p>
                  <p className="text-lg font-semibold">{user.id}</p>
                </div>
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
                  defaultValue={nameParts.firstName}
                  placeholder="Enter your first name"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  defaultValue={nameParts.lastName}
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
                defaultValue={user?.email || ""}
                placeholder="Enter your email address"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                defaultValue={user?.phone || ""}
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input 
                id="country" 
                defaultValue={user?.country || ""}
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
                placeholder="Enter your current password"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password" 
                placeholder="Enter a new password"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
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
