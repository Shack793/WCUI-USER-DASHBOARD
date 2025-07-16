"use client"

import { useEffect, useState } from "react"
import { Bell, Check, X, Info, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const notifications = [
  {
    id: 1,
    title: "New donation received",
    message: "You received a $250 donation for 'Help Build Clean Water Wells'",
    type: "success",
    date: "2024-01-15T10:30:00Z",
    read: false,
  },
  {
    id: 2,
    title: "Campaign milestone reached",
    message: "Your campaign 'Education for All Children' has reached 75% of its goal!",
    type: "info",
    date: "2024-01-14T15:45:00Z",
    read: false,
  },
  {
    id: 3,
    title: "Withdrawal processed",
    message: "Your withdrawal of $1,500 has been successfully processed",
    type: "success",
    date: "2024-01-13T09:15:00Z",
    read: true,
  },
  {
    id: 4,
    title: "Campaign ending soon",
    message: "Your campaign 'Emergency Medical Fund' will end in 3 days",
    type: "warning",
    date: "2024-01-12T12:00:00Z",
    read: true,
  },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return <Check className="h-4 w-4 text-green-600" />
    case "info":
      return <Info className="h-4 w-4 text-blue-600" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case "success":
      return "border-l-green-500"
    case "info":
      return "border-l-blue-500"
    case "warning":
      return "border-l-orange-500"
    default:
      return "border-l-gray-500"
  }
}

export function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications)
  const [loading, setLoading] = useState(false)

  const unreadCount = notificationList.filter((n) => !n.read).length

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        // Uncomment when you have a real API
        // const response = await dashboardAPI.getNotifications()
        // setNotificationList(response.data)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">Stay updated with your campaign activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{unreadCount} unread</Badge>
          <Button variant="outline" size="sm">
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notificationList.map((notification) => (
          <Card
            key={notification.id}
            className={`border-l-4 ${getNotificationColor(notification.type)} ${
              !notification.read ? "bg-muted/50" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getNotificationIcon(notification.type)}
                  <CardTitle className="text-base">{notification.title}</CardTitle>
                  {!notification.read && (
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.date).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{notification.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {notificationList.length === 0 && (
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
