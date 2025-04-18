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
import LeadDetailsPage from "@/pages/lead-details-page";
import ContactsPage from "@/pages/contacts-page";
import ContactDetailsPage from "@/pages/contact-details-page";
import CompaniesPage from "@/pages/companies-page";
import CompanyDetailsPage from "@/pages/company-details-page";
import OpportunitiesPage from "@/pages/opportunities-page";
import OpportunityDetailsPage from "@/pages/opportunity-details-page";
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
      
      {/* Leads routes */}
      <ProtectedRoute path="/leads/new" component={LeadsPage} />
      <ProtectedRoute path="/leads/:id" component={LeadDetailsPage} />
      <ProtectedRoute path="/leads" component={LeadsPage} />
      
      {/* Contacts routes */}
      <ProtectedRoute path="/contacts/new" component={ContactsPage} />
      <ProtectedRoute path="/contacts/:id" component={ContactDetailsPage} />
      <ProtectedRoute path="/contacts" component={ContactsPage} />
      
      {/* Companies routes */}
      <ProtectedRoute path="/companies/new" component={CompaniesPage} />
      <ProtectedRoute path="/companies/:id" component={CompanyDetailsPage} />
      <ProtectedRoute path="/companies" component={CompaniesPage} />
      
      {/* Opportunities routes */}
      <ProtectedRoute path="/opportunities/new" component={OpportunitiesPage} />
      <ProtectedRoute path="/opportunities/:id" component={OpportunityDetailsPage} />
      <ProtectedRoute path="/opportunities" component={OpportunitiesPage} />
      
      {/* Other routes */}
      <ProtectedRoute path="/quotations/new" component={QuotationsPage} />
      <ProtectedRoute path="/quotations/:id" component={QuotationsPage} />
      <ProtectedRoute path="/quotations" component={QuotationsPage} />
      
      <ProtectedRoute path="/products/new" component={ProductsPage} />
      <ProtectedRoute path="/products/:id" component={ProductsPage} />
      <ProtectedRoute path="/products" component={ProductsPage} />
      
      <ProtectedRoute path="/orders/new" component={OrdersPage} />
      <ProtectedRoute path="/orders/:id" component={OrdersPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      
      <ProtectedRoute path="/tasks/new" component={TasksPage} />
      <ProtectedRoute path="/tasks/:id" component={TasksPage} />
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
