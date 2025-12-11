import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageCircle, UserPlus, Video, AtSign, Check, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "video" | "message" | "call";
  user: {
    name: string;
    username?: string;
    avatar?: string;
  };
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
  const config = {
    like: { icon: Heart, bg: "bg-red-500/10", text: "text-red-500" },
    comment: { icon: MessageCircle, bg: "bg-blue-500/10", text: "text-blue-500" },
    follow: { icon: UserPlus, bg: "bg-primary/10", text: "text-primary" },
    mention: { icon: AtSign, bg: "bg-amber-500/10", text: "text-amber-500" },
    video: { icon: Video, bg: "bg-purple-500/10", text: "text-purple-500" },
    message: { icon: Mail, bg: "bg-green-500/10", text: "text-green-500" },
    call: { icon: Phone, bg: "bg-orange-500/10", text: "text-orange-500" },
  };

  const { icon: Icon, bg, text } = config[type];

  return (
    <div className={cn("rounded-xl p-2.5", bg, text)}>
      <Icon className="h-4 w-4" />
    </div>
  );
};

export default function NotificationsPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const [, setLocation] = useLocation();

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="p-4 md:p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" data-testid="text-notifications-title">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge className="gradient-primary text-white border-0 px-2.5 py-0.5" data-testid="badge-unread-count">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onMarkAllAsRead}
              className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-1.5"
              data-testid="button-mark-all-read"
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Mark all read</span>
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 md:p-4 space-y-1">
          {notifications.map((notification, index) => (
            <button
              key={notification.id}
              className={cn(
                "w-full p-3 md:p-4 rounded-xl text-left transition-all duration-200 animate-slide-up flex gap-3",
                !notification.isRead 
                  ? "bg-primary/5 hover:bg-primary/10" 
                  : "hover:bg-muted/50"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => {
                onMarkAsRead?.(notification.id);
                if (notification.user.username) {
                  setLocation(`/profile/${notification.user.username}`);
                }
              }}
              data-testid={`notification-${notification.type}`}
            >
              <Avatar className="h-11 w-11 flex-shrink-0 ring-2 ring-border/30">
                <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600 text-white text-sm">
                  {notification.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold">{notification.user.name}</span>{" "}
                  <span className="text-muted-foreground">{notification.message}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.timestamp}
                </p>
              </div>

              <div className="flex items-start gap-2 flex-shrink-0">
                <NotificationIcon type={notification.type} />
                {!notification.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-3" />
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
