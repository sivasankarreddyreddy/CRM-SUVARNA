import React, { useState } from "react";
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
import { Lock, User, Mail, UserPlus, UserCheck, BarChart } from "lucide-react";

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

  // Redirect if already logged in
  if (user) {
    setLocation("/dashboard");
    return null;
  }

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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Side: Auth Form */}
      <div className="flex items-center justify-center p-5 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary-600 mb-2">CRM Pro</h1>
            <p className="text-slate-500">Sign in to your account or create a new one</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Sign in or create an account</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-0">
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
                </TabsContent>

                <TabsContent value="register" className="mt-0">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input placeholder="Full Name" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input placeholder="Email" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
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
                        control={registerForm.control}
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
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side: Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-primary-600 text-white p-8 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Streamline Your Sales Process</h1>
          <p className="mb-6 text-primary-100">
            CRM Pro helps you manage leads, track opportunities, and close more deals with a comprehensive suite of sales and CRM tools.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-primary-500 p-2 rounded-full">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Lead Management</h3>
                <p className="text-sm text-primary-100">Capture and nurture leads from multiple sources</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-primary-500 p-2 rounded-full">
                <BarChart size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Sales Pipeline</h3>
                <p className="text-sm text-primary-100">Track deals through their entire lifecycle</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-primary-500 p-2 rounded-full">
                <Files size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Quotations & Orders</h3>
                <p className="text-sm text-primary-100">Create and manage quotes and sales orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import for the icon used in the hero section
import { Files } from "lucide-react";
