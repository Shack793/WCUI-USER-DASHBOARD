"use client"

import { useEffect, useState } from "react"
import { Bell, Check, X, Info, AlertTriangle, RefreshCw } from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface NotificationData {
  id: string
  type: string
  notifiable_type: string
  notifiable_id: number
  data: {
    data?: {
      amount?: string
      created_at?: string
      donor_name?: string
      campaign_id?: number
      campaign_title?: string
      contribution_id?: number
    }
    type?: string
    title?: string
    message: string
    format?: string
  }
  read_at: string | null
  created_at: string
  updated_at: string
  user_id: number | null
}

interface NotificationApiResponse {
  success: boolean
  data: NotificationData[]
  debug_info: {
    user_id: number
    total_notifications: number
    request_params: any[]
  }
}

const getNotificationIcon = (notification: NotificationData) => {
  // Check for contribution received notifications
  if (notification.data.type === "contribution_received" || 
      notification.type.includes("ContributionReceived")) {
    return <Check className="h-4 w-4 text-green-600" />
  }
  
  // Check for general notification types
  if (notification.type.includes("SampleNotification")) {
    return <Info className="h-4 w-4 text-blue-600" />
  }
  
  // Default based on common patterns
  if (notification.data.message?.toLowerCase().includes("contribution") ||
      notification.data.message?.toLowerCase().includes("donation")) {
    return <Check className="h-4 w-4 text-green-600" />
  }
  
  if (notification.data.message?.toLowerCase().includes("warning") ||
      notification.data.message?.toLowerCase().includes("ending")) {
    return <AlertTriangle className="h-4 w-4 text-orange-600" />
  }

  return <Bell className="h-4 w-4 text-gray-600" />
}

const getNotificationColor = (notification: NotificationData) => {
  // Check for contribution received notifications
  if (notification.data.type === "contribution_received" || 
      notification.type.includes("ContributionReceived")) {
    return "border-l-green-500"
  }
  
  // Check for general notification types
  if (notification.type.includes("SampleNotification")) {
    return "border-l-blue-500"
  }
  
  // Default based on common patterns
  if (notification.data.message?.toLowerCase().includes("contribution") ||
      notification.data.message?.toLowerCase().includes("donation")) {
    return "border-l-green-500"
  }
  
  if (notification.data.message?.toLowerCase().includes("warning") ||
      notification.data.message?.toLowerCase().includes("ending")) {
    return "border-l-orange-500"
  }

  return "border-l-gray-500"
}

const getNotificationTitle = (notification: NotificationData) => {
  // Use the title from data if available
  if (notification.data.title) {
    return notification.data.title
  }
  
  // Generate title based on notification type
  if (notification.data.type === "contribution_received" || 
      notification.type.includes("ContributionReceived")) {
    return "New Contribution Received"
  }
  
  if (notification.type.includes("SampleNotification")) {
    return "System Notification"
  }
  
  // Extract title from notification type
  const typeClass = notification.type.split("\\").pop() || ""
  return typeClass.replace(/([A-Z])/g, ' $1').trim() || "Notification"
}

export function NotificationsPage() {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [notificationList, setNotificationList] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAsRead, setMarkingAsRead] = useState(false)

  const unreadCount = notificationList.filter((n) => !n.read_at).length

  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping notifications fetch')
      return
    }

    try {
      setLoading(true)
      const { data }: { data: NotificationApiResponse } = await api.get('/api/v1/notifications')
      if (data.success) {
        console.log('Notifications loaded:', data.data)
        setNotificationList(data.data)
      } else {
        console.error("Failed to load notifications")
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Failed to fetch notifications:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      setMarkingAsRead(true)
      // TODO: Implement mark all as read API call
      // await api.post('/api/v1/notifications/mark-all-read')
      
      // For now, update local state
      setNotificationList(prev => 
        prev.map(notification => ({
          ...notification,
          read_at: new Date().toISOString()
        }))
      )
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error: any) {
      console.error("Failed to mark notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      })
    } finally {
      setMarkingAsRead(false)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      // TODO: Implement delete notification API call
      // await api.delete(`/api/v1/notifications/${notificationId}`)
      
      // For now, update local state
      setNotificationList(prev => prev.filter(n => n.id !== notificationId))
      
      toast({
        title: "Success",
        description: "Notification deleted",
      })
    } catch (error: any) {
      console.error("Failed to delete notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [isAuthenticated])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            {loading ? "Loading notifications..." : "Stay updated with your campaign activities"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{unreadCount} unread</Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            disabled={loading || markingAsRead || unreadCount === 0}
          >
            <Check className="mr-2 h-4 w-4" />
            {markingAsRead ? "Marking..." : "Mark all as read"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading && notificationList.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-muted-foreground">Loading notifications...</span>
          </div>
        ) : (
          notificationList.map((notification) => (
            <Card
              key={notification.id}
              className={`border-l-4 ${getNotificationColor(notification)} ${
                !notification.read_at ? "bg-muted/50" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification)}
                    <CardTitle className="text-base">{getNotificationTitle(notification)}</CardTitle>
                    {!notification.read_at && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{notification.data.message}</p>
                {notification.data.data && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {notification.data.data.campaign_title && (
                      <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded mr-2">
                        Campaign: {notification.data.data.campaign_title}
                      </span>
                    )}
                    {notification.data.data.amount && (
                      <span className="inline-block bg-green-50 text-green-700 px-2 py-1 rounded">
                        Amount: GHS {Number(notification.data.data.amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!loading && notificationList.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground text-center">
              You're all caught up! New notifications will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
