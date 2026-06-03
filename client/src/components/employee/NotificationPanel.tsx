import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICON: Record<string, string> = {
  reservation_assigned: "📋",
  reservation_status_changed: "🔄",
  system_announcement: "📢",
};

export default function NotificationPanel() {
  const { data: notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-xl" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto divide-y divide-border/50" aria-live="polite" aria-label="Notifications list">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              <BellOff className="w-8 h-8 mx-auto mb-2 opacity-40" />
              You're all caught up!
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors flex gap-3 ${
                  !n.isRead ? "bg-blue-50/70" : ""
                }`}
              >
                <span className="text-lg shrink-0 mt-0.5">{TYPE_ICON[n.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-sm font-semibold leading-tight ${
                        !n.isRead ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" aria-label="Unread" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.message}</p>
                  <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
