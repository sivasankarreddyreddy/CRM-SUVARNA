import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import LeadsPage from "@/pages/leads-page";
import ContactsPage from "@/pages/contacts-page";
import CompaniesPage from "@/pages/companies-page";
import OpportunitiesPage from "@/pages/opportunities-page";
import QuotationsPage from "@/pages/quotations-page";
import ProductsPage from "@/pages/products-page";
import OrdersPage from "@/pages/orders-page";
import TasksPage from "@/pages/tasks-page";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/leads" component={LeadsPage} />
      <ProtectedRoute path="/contacts" component={ContactsPage} />
      <ProtectedRoute path="/companies" component={CompaniesPage} />
      <ProtectedRoute path="/opportunities" component={OpportunitiesPage} />
      <ProtectedRoute path="/quotations" component={QuotationsPage} />
      <ProtectedRoute path="/products" component={ProductsPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      <ProtectedRoute path="/tasks" component={TasksPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
