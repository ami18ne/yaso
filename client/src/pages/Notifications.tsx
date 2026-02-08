import NotificationsPanel from '@/components/NotificationsPanel'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, Bell } from 'lucide-react'

export default function Notifications() {
  const { data: notifications, isLoading, error } = useNotifications()
  const markAsReadMutation = useMarkNotificationRead()
  const markAllAsReadMutation = useMarkAllNotificationsRead()

  const handleMarkAsRead = async (id: string) => {
    await markAsReadMutation.mutateAsync(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading notifications...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center space-y-4 max-w-sm animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Unable to load notifications</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center space-y-4 max-w-sm animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <Bell className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No notifications</h3>
          <p className="text-muted-foreground">
            When someone interacts with your content, you'll see it here.
          </p>
        </div>
      </div>
    )
  }

  const formattedNotifications = notifications.map((n) => ({
    id: n.id,
    type: n.type as 'like' | 'comment' | 'follow' | 'mention' | 'video' | 'message' | 'call',
    user: {
      name: n.profiles?.full_name || n.profiles?.username || 'Someone',
      username: n.profiles?.username,
      avatar: n.profiles?.avatar_url || undefined,
    },
    message: n.content,
    timestamp: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
    isRead: n.read,
  }))

  return (
    <NotificationsPanel
      notifications={formattedNotifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    />
  )
}
