import React from "react";
import { Mail, CircleUser, ArrowUpRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface Message {
  id: number;
  sender: {
    name: string;
    avatar?: string;
    online?: boolean;
  };
  content: string;
  date: Date;
  read: boolean;
  link?: string;
}

// Mock messages - these would come from API in a real implementation
const SAMPLE_MESSAGES: Message[] = [
  {
    id: 1,
    sender: {
      name: "Dr. Rajesh Kumar",
      online: true
    },
    content: "Can you please send me the latest proposal for the PACS system?",
    date: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    read: false,
    link: "/messages/1"
  },
  {
    id: 2,
    sender: {
      name: "Meena Sharma",
      online: false
    },
    content: "We would like to schedule a demo for the lab management system next week.",
    date: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: false,
    link: "/messages/2"
  },
  {
    id: 3,
    sender: {
      name: "Sunita Patel",
      online: true
    },
    content: "Thanks for the quote. Our admin team will review it shortly.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    read: true,
    link: "/messages/3"
  },
  {
    id: 4,
    sender: {
      name: "Arvind Gupta",
      online: false
    },
    content: "When can we expect the installation team to arrive?",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    link: "/messages/4"
  }
];

interface MessageDropdownProps {
  messages?: Message[];
}

export function MessageDropdown({ messages = SAMPLE_MESSAGES }: MessageDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [messageData, setMessageData] = React.useState<Message[]>(messages);
  
  const unreadCount = messageData.filter(m => !m.read).length;
  
  const handleMarkAsRead = (id: number) => {
    setMessageData(
      messageData.map(message => 
        message.id === id 
          ? { ...message, read: true } 
          : message
      )
    );
  };
  
  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Mail className="h-5 w-5 text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 border-2 border-white text-xs flex items-center justify-center text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Messages</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {messageData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <Mail className="h-10 w-10 mb-2 text-slate-300" />
              <p>No messages</p>
            </div>
          ) : (
            <div>
              {messageData.map((message) => (
                <a
                  key={message.id}
                  href={message.link || "#"}
                  className={cn(
                    "flex items-start p-3 hover:bg-slate-50", 
                    !message.read && "bg-blue-50/40"
                  )}
                  onClick={() => handleMarkAsRead(message.id)}
                >
                  <div className="flex-shrink-0 mr-3">
                    <div className="relative">
                      {message.sender.avatar ? (
                        <img 
                          src={message.sender.avatar} 
                          alt={message.sender.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                          {message.sender.name.charAt(0)}
                        </div>
                      )}
                      {message.sender.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={cn(
                        "text-sm font-medium text-slate-900 truncate", 
                        !message.read && "font-semibold"
                      )}>
                        {message.sender.name}
                      </p>
                      <span className="text-xs text-slate-500 ml-2 whitespace-nowrap">
                        {formatMessageTime(message.date)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {message.content}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" className="text-xs h-auto w-full" asChild>
            <a href="/messages" className="flex items-center justify-center">
              View all messages
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}