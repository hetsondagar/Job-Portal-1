"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Check, X, Clock, AlertCircle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { EmployerNavbar } from "@/components/employer-navbar"
import { EmployerFooter } from "@/components/employer-footer"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "application",
      title: "New Job Application",
      message: "Rahul Kumar applied for Senior Software Engineer position",
      time: "2 minutes ago",
      read: false,
      priority: "high",
      avatar: "/placeholder-user.jpg",
      action: "View Application"
    },
    {
      id: 2,
      type: "candidate",
      title: "Candidate Match Found",
      message: "5 candidates match your requirements for Product Manager role",
      time: "1 hour ago",
      read: false,
      priority: "medium",
      avatar: "/placeholder-user.jpg",
      action: "View Candidates"
    },
    {
      id: 3,
      type: "system",
      title: "Job Posting Expires Soon",
      message: "Your 'Frontend Developer' job posting expires in 2 days",
      time: "3 hours ago",
      read: true,
      priority: "low",
      avatar: "/placeholder-logo.png",
      action: "Extend Posting"
    },
    {
      id: 4,
      type: "application",
      title: "New Job Application",
      message: "Priya Sharma applied for UI/UX Designer position",
      time: "5 hours ago",
      read: true,
      priority: "medium",
      avatar: "/placeholder-user.jpg",
      action: "View Application"
    },
    {
      id: 5,
      type: "system",
      title: "Welcome to JobPortal!",
      message: "Your account has been successfully created. Start posting jobs to find great candidates.",
      time: "1 day ago",
      read: true,
      priority: "low",
      avatar: "/placeholder-logo.png",
      action: "Post Job"
    }
  ])

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "candidate":
        return <Bell className="w-5 h-5 text-blue-600" />
      case "system":
        return <Info className="w-5 h-5 text-slate-600" />
      default:
        return <Bell className="w-5 h-5 text-slate-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <EmployerNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-600">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications</h3>
                <p className="text-slate-600 text-center">
                  You're all caught up! New notifications will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-md ${
                  !notification.read ? 'border-blue-200 bg-blue-50/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={notification.avatar} alt="Notification" />
                      <AvatarFallback className="bg-slate-100">
                        {getNotificationIcon(notification.type)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`font-semibold ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-slate-600 mb-3">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-xs text-slate-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {notification.time}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                {notification.action}
                              </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-slate-600 hover:text-slate-900"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-slate-600 hover:text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {notifications.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
              Load More Notifications
            </Button>
          </div>
        )}
      </div>

      <EmployerFooter />
    </div>
  )
} 