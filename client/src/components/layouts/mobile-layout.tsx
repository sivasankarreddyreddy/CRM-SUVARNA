import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  Building2,
  Briefcase,
  ClipboardList,
  Calendar,
  Menu,
  X,
  LogOut,
  BarChart2,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function MobileLayout({ children, title }: MobileLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  // Nav items with icons for the mobile interface
  const navItems = [
    { name: 'Dashboard', href: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Leads', href: '/leads', icon: <Users className="h-5 w-5" /> },
    { name: 'Contacts', href: '/contacts', icon: <Users className="h-5 w-5" /> },
    { name: 'Companies', href: '/companies', icon: <Building2 className="h-5 w-5" /> },
    { name: 'Opportunities', href: '/opportunities', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'Tasks', href: '/tasks', icon: <ClipboardList className="h-5 w-5" /> },
    { name: 'Calendar', href: '/calendar', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Reports', href: '/reports/sales', icon: <BarChart2 className="h-5 w-5" /> },
    { name: 'Targets', href: '/sales-targets', icon: <Award className="h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 border-b bg-background shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="ml-2 text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium hidden sm:inline-block">
              {user?.fullName || user?.username}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-3/4 bg-background shadow-lg">
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto py-2">
                <nav className="flex flex-col space-y-1 px-2">
                  {navItems.map((item) => (
                    <div key={item.href} onClick={() => {
                      setIsMenuOpen(false);
                      window.location.href = item.href;
                    }}>
                      <div
                        className={`flex items-center rounded-md px-3 py-2 text-sm font-medium cursor-pointer ${
                          location === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
              <div className="border-t p-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <div className="sticky bottom-0 z-10 bg-background border-t shadow-sm">
        <div className="grid grid-cols-5 h-16">
          <div 
            className={`flex flex-col items-center justify-center cursor-pointer ${
              location === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => window.location.href = '/'}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </div>
          
          <div 
            className={`flex flex-col items-center justify-center cursor-pointer ${
              location.startsWith('/leads') ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => window.location.href = '/leads'}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Leads</span>
          </div>
          
          <div 
            className={`flex flex-col items-center justify-center cursor-pointer ${
              location.startsWith('/tasks') ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => window.location.href = '/tasks'}
          >
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs mt-1">Tasks</span>
          </div>
          
          <div 
            className={`flex flex-col items-center justify-center cursor-pointer ${
              location.startsWith('/opportunities') ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => window.location.href = '/opportunities'}
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-xs mt-1">Deals</span>
          </div>
          
          <div 
            className={`flex flex-col items-center justify-center cursor-pointer ${
              location.startsWith('/calendar') ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => window.location.href = '/calendar'}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Calendar</span>
          </div>
        </div>
      </div>
    </div>
  );
}