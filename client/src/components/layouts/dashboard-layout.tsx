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
} from "lucide-react";

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
            <span className="text-primary-600 text-xl font-semibold">CRM Pro</span>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 overflow-y-auto">
            {sidebarSections.map((section) => (
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
      </div>
    </div>
  );
}
