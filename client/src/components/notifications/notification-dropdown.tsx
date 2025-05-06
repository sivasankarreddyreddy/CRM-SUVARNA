import React from "react";
import { Bell, Check, Calendar, File, User, UserPlus, ShoppingBag, Clipboard } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export type NotificationType = 
  | "lead" 
  | "opportunity" 
  | "task" 
  | "appointment" 
  | "quote" 
  | "order" 
  | "user" 
  | "general";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  link?: string;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "lead":
      return <User className="h-5 w-5 text-blue-500" />;
    case "opportunity":
      return <Clipboard className="h-5 w-5 text-yellow-500" />;
    case "task":
      return <Check className="h-5 w-5 text-green-500" />;
    case "appointment":
      return <Calendar className="h-5 w-5 text-purple-500" />;
    case "quote":
      return <File className="h-5 w-5 text-orange-500" />;
    case "order":
      return <ShoppingBag className="h-5 w-5 text-red-500" />;
    case "user":
      return <UserPlus className="h-5 w-5 text-indigo-500" />;
    default:
      return <Bell className="h-5 w-5 text-slate-500" />;
  }
};

// Mock notifications - these would come from API in a real implementation
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "lead",
    title: "New Lead Assigned",
    description: "Apex Medical Center has been assigned to you.",
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    link: "/leads/75"
  },
  {
    id: 2,
    type: "task",
    title: "Task Due Today",
    description: "Follow up with Sunshine Hospitals about the PACS system.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    link: "/tasks"
  },
  {
    id: 3,
    type: "appointment",
    title: "Upcoming Appointment",
    description: "Demo scheduled with City Healthcare in 1 hour.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
    link: "/calendar"
  },
  {
    id: 4,
    type: "opportunity",
    title: "Opportunity Updated",
    description: "Health-First Imaging opportunity stage changed to Negotiation.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    link: "/opportunities/23"
  },
  {
    id: 5,
    type: "quote",
    title: "Quotation Approved",
    description: "SafeCare Hospital has approved your quotation.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    link: "/quotations/47"
  }
];

interface NotificationDropdownProps {
  notifications?: Notification[];
}

export function NotificationDropdown({ notifications = SAMPLE_NOTIFICATIONS }: NotificationDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [notificationData, setNotificationData] = React.useState<Notification[]>(notifications);
  
  const unreadCount = notificationData.filter(n => !n.read).length;
  
  const handleMarkAllAsRead = () => {
    setNotificationData(
      notificationData.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };
  
  const handleMarkAsRead = (id: number) => {
    setNotificationData(
      notificationData.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 border-2 border-white text-xs flex items-center justify-center text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-auto py-1"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {notificationData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <Bell className="h-10 w-10 mb-2 text-slate-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div>
              {notificationData.map((notification) => (
                <a
                  key={notification.id}
                  href={notification.link || "#"}
                  className={cn(
                    "flex items-start p-3 hover:bg-slate-50", 
                    !notification.read && "bg-blue-50/40"
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={cn(
                        "text-sm font-medium text-slate-900 truncate", 
                        !notification.read && "font-semibold"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-slate-500 ml-2">
                        {formatNotificationTime(notification.date)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {notification.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" className="text-xs h-auto w-full" asChild>
            <a href="/notifications">View all notifications</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}