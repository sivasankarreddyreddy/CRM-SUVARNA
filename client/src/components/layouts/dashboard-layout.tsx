import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Users,
  Settings,
  Megaphone,
  LogOut,
  Menu,
  Search,
  HelpCircle,
  Layout,
  PieChart,
  CheckSquare,
  Calendar,
  FileText,
  Package,
  ShoppingBag,
  Briefcase,
  AlertCircle,
  Network,
  Receipt,
  Bell,
  Mail,
  User,
  Check,
  ArrowUpRight,
  CircleUser,
  UserPlus,
  Clipboard,
  Target,
} from "lucide-react";
// Import using relative path
// The reference to SuvarnaLogoSVG was also removed, we'll use the image directly

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, children, active }) => {
  return (
    <Link href={href}>
      <div
        className={`flex items-center px-4 py-2 text-sm mb-1 rounded-md ${
          active 
          ? "text-primary-600 bg-primary-50 border-l-3 border-primary-600" 
          : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <span className="mr-3">{icon}</span>
        {children}
      </div>
    </Link>
  );
};

type SidebarSection = {
  title: string;
  links: {
    href: string;
    icon: React.ReactNode;
    label: string;
  }[];
};

const sidebarSections: SidebarSection[] = [
  {
    title: "Main",
    links: [
      { href: "/dashboard", icon: <Layout size={20} />, label: "Dashboard" },
      { href: "/unified", icon: <PieChart size={20} />, label: "Unified Dashboard" },
      { href: "/contacts", icon: <Users size={20} />, label: "Contacts" },
      { href: "/companies", icon: <Briefcase size={20} />, label: "Companies" },
      { href: "/leads", icon: <Megaphone size={20} />, label: "Leads" },
    ],
  },
  {
    title: "Sales",
    links: [
      { href: "/opportunities", icon: <ShoppingBag size={20} />, label: "Opportunities" },
      { href: "/quotations", icon: <FileText size={20} />, label: "Quotations" },
      { href: "/products", icon: <Package size={20} />, label: "Products" },
      { href: "/vendors", icon: <Briefcase size={20} />, label: "Vendors" },
      { href: "/vendor-groups", icon: <FileText size={20} />, label: "Vendor Groups" },
      { href: "/modules", icon: <Network size={20} />, label: "Modules" },
      { href: "/orders", icon: <CreditCard size={20} />, label: "Orders" },
      { href: "/invoices", icon: <Receipt size={20} />, label: "Invoices" },
      { href: "/sales-targets", icon: <Target size={20} />, label: "Sales Targets" },
    ],
  },
  {
    title: "Activities",
    links: [
      { href: "/tasks", icon: <CheckSquare size={20} />, label: "Tasks" },
      { href: "/calendar", icon: <Calendar size={20} />, label: "Calendar" },
    ],
  },
  {
    title: "Management",
    links: [
      { href: "/teams", icon: <Network size={20} />, label: "Teams" },
      { href: "/team-management", icon: <Users size={20} />, label: "Team Management" },
    ],
  },
  {
    title: "Reports",
    links: [
      { href: "/reports/sales", icon: <PieChart size={20} />, label: "Sales Reports" },
      { href: "/reports/activities", icon: <FileText size={20} />, label: "Activity Reports" },
    ],
  },
];

// Notification types
type NotificationType = 
  | "lead" 
  | "opportunity" 
  | "task" 
  | "appointment" 
  | "quote" 
  | "order" 
  | "user" 
  | "general";

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  link?: string;
}

// Message type
interface Message {
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

// Sample notifications - these would come from API in a real implementation
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

// Sample messages - these would come from API in a real implementation
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

const formatTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

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
      return <FileText className="h-5 w-5 text-orange-500" />;
    case "order":
      return <ShoppingBag className="h-5 w-5 text-red-500" />;
    case "user":
      return <UserPlus className="h-5 w-5 text-indigo-500" />;
    default:
      return <Bell className="h-5 w-5 text-slate-500" />;
  }
};

// Notification dropdown component
function NotificationDropdown() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };
  
  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 border-2 border-white text-xs flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
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
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <Bell className="h-10 w-10 mb-2 text-slate-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
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
                        {formatTime(notification.date)}
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

// Message dropdown component
function MessageDropdown() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>(SAMPLE_MESSAGES);
  
  const unreadCount = messages.filter(m => !m.read).length;
  
  const handleMarkAsRead = (id: number) => {
    setMessages(
      messages.map(message => 
        message.id === id 
          ? { ...message, read: true } 
          : message
      )
    );
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Mail className="h-5 w-5 text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 border-2 border-white text-xs flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
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
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <Mail className="h-10 w-10 mb-2 text-slate-300" />
              <p>No messages</p>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
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
                        {formatTime(message.date)}
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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filter sidebar sections based on user role
  const filteredSidebarSections = sidebarSections.map(section => {
    // Only show Team Management link to admin users
    if (section.title === "Management") {
      return {
        ...section,
        links: section.links.filter(link => 
          link.label !== "Team Management" || user?.role === "admin"
        )
      };
    }
    return section;
  }).filter(section => section.links.length > 0);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "fixed inset-0 z-40 flex" : "hidden md:flex md:flex-shrink-0"
        }`}
      >
        <div className="flex flex-col w-64 border-r border-slate-200 bg-white">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/logo-suvarna.png" 
                alt="Suvarna Logo" 
                className="h-10 w-auto" 
              />
              <span className="text-primary-600 text-xl font-semibold">Suvarna CRM</span>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 overflow-y-auto">
            {filteredSidebarSections.map((section) => (
              <div key={section.title} className="p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {section.title}
                </p>
                {section.links.map((link) => (
                  <SidebarLink
                    key={link.href}
                    href={link.href}
                    icon={link.icon}
                    active={location === link.href}
                  >
                    {link.label}
                  </SidebarLink>
                ))}
              </div>
            ))}
          </nav>

          {/* User Profile */}
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <span className="font-medium">
                  {user?.fullName 
                    ? `${user.fullName.split(' ')[0][0]}${user.fullName.split(' ')[1]?.[0] || ''}`
                    : 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700">{user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500">{user?.role || 'Role'}</p>
              </div>
              <div className="ml-auto flex">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/settings">
                    <Settings size={20} className="text-slate-400 hover:text-slate-600" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut size={20} className="text-slate-400 hover:text-slate-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay to close sidebar on mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Mobile menu button */}
            <button
              className="md:hidden text-slate-500 hover:text-slate-600"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-md ml-4 md:ml-6">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-3 py-2 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Notification Dropdown */}
              <NotificationDropdown />
              
              {/* Message Dropdown */}
              <MessageDropdown />
              
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5 text-slate-500" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
          <p>© 2025 Suvarna Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="mt-1">For more information, visit <a href="https://www.suvarna.co.in" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">www.suvarna.co.in</a></p>
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayout;
