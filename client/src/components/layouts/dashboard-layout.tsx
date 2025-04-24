import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Users,
  Settings,
  Megaphone,
  LogOut,
  Menu,
  Search,
  Bell,
  Mail,
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
} from "lucide-react";
// Define inline SVG for Suvarna logo to avoid path issues
const SuvarnaLogoSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-8 w-8">
    <defs>
      <linearGradient id="suvarna-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#006400", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#008000", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="10" fill="url(#suvarna-gradient)" />
    <path d="M65,20 C65,20 40,30 40,50 C40,70 65,80 65,80 L65,20 Z" fill="none" stroke="black" strokeWidth="4" />
    <path d="M75,25 C75,25 50,35 50,50 C50,65 75,75 75,75 L75,25 Z" fill="none" stroke="black" strokeWidth="4" />
    <path d="M85,30 C85,30 60,38 60,50 C60,62 85,70 85,70 L85,30 Z" fill="none" stroke="black" strokeWidth="4" />
    <text x="50" y="90" fontFamily="Arial, Helvetica, sans-serif" fontSize="10" textAnchor="middle" fill="white">సువర్ణ</text>
  </svg>
);

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
      { href: "/orders", icon: <CreditCard size={20} />, label: "Orders" },
      { href: "/invoices", icon: <Receipt size={20} />, label: "Invoices" },
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
              <SuvarnaLogoSVG />
              <span className="text-primary-600 text-xl font-semibold">Suvarna HIMS</span>
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-slate-500" />
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 border-2 border-white text-xs flex items-center justify-center text-white">
                  3
                </span>
              </Button>
              <Button variant="ghost" size="icon">
                <Mail className="h-5 w-5 text-slate-500" />
              </Button>
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
