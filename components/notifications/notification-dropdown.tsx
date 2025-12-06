"use client"

import { Bell, Check, Clock, Mail as MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/store/store"
import { fetchNotifications, markNotificationAsRead } from "@/store/actions/notificationActions"
import { 
  selectNotifications, 
  selectUnreadCount, 
  selectIsLoading,
  type Notification
} from "@/store/slices/notificationsSlice"
import { useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

export function NotificationDropdown() {
  const dispatch = useDispatch<AppDispatch>()
  const notifications = useSelector((state: RootState) => selectNotifications(state))
  const unreadCount = useSelector((state: RootState) => selectUnreadCount(state))
  const isLoading = useSelector((state: RootState) => selectIsLoading(state))

  useEffect(() => {
    // Fetch notifications when the component mounts
    dispatch(fetchNotifications())
    
    // Set up auto-refresh polling every 10 seconds
    const pollInterval = setInterval(() => {
      dispatch(fetchNotifications())
    }, 10000)
    
    return () => clearInterval(pollInterval)
  }, [dispatch])

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap()
      // The notification will be automatically removed from the UI by the Redux reducer
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[420px] p-0" align="end" sideOffset={8}>
        <div className="px-4 pt-3 pb-2 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Notifications</h4>
            {unreadCount > 0 && (
              <span className="text-sm text-muted-foreground">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
        
        <ScrollArea className="max-h-[400px] w-full">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-3 p-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification: Notification) => (
              <div key={notification.id}>
                <div 
                  className={`border-b last:border-b-0 transition-opacity duration-200 ${notification.is_read ? 'opacity-75' : ''}`}
                >
                  <DropdownMenuItem 
                    className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 m-0 rounded-none"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {notification.notification_type === 'email_sent' ? (
                        <MailIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium leading-tight text-foreground line-clamp-2">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-0.5 hover:bg-transparent"
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span className="sr-only">Mark as read</span>
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground break-words whitespace-normal">
                        {notification.message}
                      </p>
                      {notification.metadata?.subject && (
                        <div className="mt-1 p-2 bg-muted/30 rounded text-xs break-words">
                          <span className="font-medium">Subject:</span> {notification.metadata.subject}
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="m-0" />
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-foreground">No notifications</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You don't have any notifications yet.
              </p>
            </div>
          )}
        </ScrollArea>
        

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
