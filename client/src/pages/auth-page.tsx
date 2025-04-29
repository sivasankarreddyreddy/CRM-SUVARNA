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
            <h1 className="text-2xl font-bold text-primary-600 mb-2">Suvarna HIMS CRM</h1>
            <p className="text-slate-500">Sign in to access your CRM dashboard</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Sign in to Suvarna HIMS</CardTitle>
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
              
              <div className="mt-8 border border-dashed border-slate-200 rounded-md p-4">
                <h3 className="text-sm font-medium mb-2 text-slate-700">Sample Users</h3>
                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <div>
                      <span className="font-semibold">Admin User</span> · admin@example.com
                    </div>
                    <div>
                      <span className="font-mono">admin / admin123</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <div>
                      <span className="font-semibold">Sales Manager</span> · manager@example.com
                    </div>
                    <div>
                      <span className="font-mono">manager / sales123</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <div>
                      <span className="font-semibold">Sales Executive</span> · sales@example.com
                    </div>
                    <div>
                      <span className="font-mono">sales / exec123</span>
                    </div>
                  </div>
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
            Suvarna HIMS CRM helps you manage leads, track opportunities, and close more deals with a comprehensive suite of sales and CRM tools designed for healthcare providers.
          </p>
          
          <div className="space-y-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500 p-3 rounded-lg shadow">
                <UserPlus className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Lead Management</h3>
                <p className="text-sm text-slate-300">Capture and nurture leads from multiple sources</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-500 p-3 rounded-lg shadow">
                <BarChart className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Sales Pipeline</h3>
                <p className="text-sm text-slate-300">Track deals through their entire lifecycle</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-violet-500 p-3 rounded-lg shadow">
                <Files className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Quotations & Orders</h3>
                <p className="text-sm text-slate-300">Create and manage quotes and sales orders</p>
              </div>
            </div>
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
