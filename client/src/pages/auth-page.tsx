import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, User, Mail, UserPlus, UserCheck, BarChart, Files } from "lucide-react";

// Use actual image file for the logo
// Logo component wrapper for consistent usage
const SuvarnaLogoSVG = ({ className = "h-8 w-8" }) => (
  <img 
    src="/images/logo-suvarna.png" 
    alt="Suvarna Logo" 
    className={className} 
  />
);

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.string().default("sales_executive"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { loginMutation, registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Initialize form hooks regardless of user state to avoid hook ordering issues
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      role: "sales_executive",
    },
  });

  const onLogin = (data: LoginValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Login successful",
          description: "Welcome back to CRM Pro!",
        });
        setLocation("/dashboard");
      },
    });
  };

  const onRegister = (data: RegisterValues) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Registration successful",
          description: "Your account has been created successfully!",
        });
        setLocation("/dashboard");
      },
    });
  };
  
  // Redirect if already logged in (after all hooks are declared)
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Side: Auth Form */}
      <div className="flex items-center justify-center p-5 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <SuvarnaLogoSVG className="h-16 w-16" />
            </div>
            <h1 className="text-2xl font-bold text-primary-600 mb-2">Suvarna CRM</h1>
            <p className="text-slate-500">Sign in to access your CRM dashboard</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Sign in to Suvarna CRM</CardTitle>
              <CardDescription className="text-center">New accounts are created by administrators</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Username" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input type="password" placeholder="Password" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-8 border border-dashed border-blue-200 rounded-lg p-5 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-blue-800">Demo User Accounts</h3>
                </div>
                <p className="text-xs text-blue-600 mb-4">Click on any user card below to auto-fill login credentials:</p>
                
                <div className="space-y-3 text-xs">
                  <div 
                    className="flex flex-col p-3 bg-white border border-blue-200 rounded-md hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
                    onClick={() => {
                      loginForm.setValue('username', 'admin');
                      loginForm.setValue('password', 'admin123');
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blue-900">System Administrator</span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">ADMIN</span>
                    </div>
                    <div className="text-blue-600 mb-2">admin@suvarna.co.in</div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Full system access, user management</span>
                      <span className="font-mono text-blue-800 bg-blue-100 px-2 py-1 rounded">admin / admin123</span>
                    </div>
                  </div>

                  <div 
                    className="flex flex-col p-3 bg-white border border-blue-200 rounded-md hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
                    onClick={() => {
                      loginForm.setValue('username', 'rajesh.manager');
                      loginForm.setValue('password', 'manager123');
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blue-900">Rajesh Kumar - Sales Manager</span>
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium">MANAGER</span>
                    </div>
                    <div className="text-blue-600 mb-2">rajesh.kumar@suvarna.co.in</div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Team management, pipeline oversight</span>
                      <span className="font-mono text-blue-800 bg-blue-100 px-2 py-1 rounded">rajesh.manager / manager123</span>
                    </div>
                  </div>

                  <div 
                    className="flex flex-col p-3 bg-white border border-blue-200 rounded-md hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
                    onClick={() => {
                      loginForm.setValue('username', 'priya.sales');
                      loginForm.setValue('password', 'sales123');
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blue-900">Priya Sharma - Sales Executive</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">EXECUTIVE</span>
                    </div>
                    <div className="text-blue-600 mb-2">priya.sharma@suvarna.co.in</div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Lead management, opportunity tracking</span>
                      <span className="font-mono text-blue-800 bg-blue-100 px-2 py-1 rounded">priya.sales / sales123</span>
                    </div>
                  </div>

                  <div 
                    className="flex flex-col p-3 bg-white border border-blue-200 rounded-md hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
                    onClick={() => {
                      loginForm.setValue('username', 'amit.executive');
                      loginForm.setValue('password', 'exec123');
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blue-900">Amit Patel - Field Executive</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">EXECUTIVE</span>
                    </div>
                    <div className="text-blue-600 mb-2">amit.patel@suvarna.co.in</div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Customer visits, order processing</span>
                      <span className="font-mono text-blue-800 bg-blue-100 px-2 py-1 rounded">amit.executive / exec123</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-xs text-amber-700">
                    <strong>Note:</strong> These are demonstration accounts for testing the healthcare CRM system. Each role has different access levels and dashboard views.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side: Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 text-white p-8 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
              Streamline Your Sales Process
            </span>
          </h1>
          <p className="mb-8 text-slate-300 text-lg">
            Comprehensive Healthcare Information Management System (HIMS) CRM designed specifically for medical sales teams serving hospitals and diagnostic centers across India.
          </p>
          
          <div className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2">System Capabilities</h2>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500 p-3 rounded-lg shadow">
                <UserPlus className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Lead & Contact Management</h3>
                <p className="text-sm text-slate-300">Capture leads from hospitals and diagnostic centers, manage contact persons, track communication history, and nurture prospects through the sales funnel.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-500 p-3 rounded-lg shadow">
                <BarChart className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Sales Pipeline & Opportunities</h3>
                <p className="text-sm text-slate-300">Track opportunities from initial contact to deal closure, manage sales stages, forecast revenue, and monitor team performance with advanced analytics.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-violet-500 p-3 rounded-lg shadow">
                <Files className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Quotations & Sales Orders</h3>
                <p className="text-sm text-slate-300">Generate professional quotations for healthcare products, convert to sales orders, track pricing in Indian Rupees (₹), and manage complete order lifecycle.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-emerald-500 p-3 rounded-lg shadow">
                <UserCheck className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Team Management & Hierarchy</h3>
                <p className="text-sm text-slate-300">Hierarchical team structure with managers and executives, role-based access control, performance tracking, and territory management for healthcare market segments.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Key Features</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Product catalog with healthcare modules and vendor management</li>
              <li>• Task scheduling and activity tracking for sales teams</li>
              <li>• Advanced reporting and dashboard analytics</li>
              <li>• PDF generation for quotations and invoices</li>
              <li>• Multi-level user access with admin, manager, and executive roles</li>
              <li>• Complete audit trail and data security</li>
            </ul>
          </div>

          <div className="mt-10 text-center text-slate-400 text-xs">
            <p>© 2025 Suvarna Technologies Pvt. Ltd. All rights reserved.</p>
            <p className="mt-1">For more information, visit <a href="https://www.suvarna.co.in" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.suvarna.co.in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
