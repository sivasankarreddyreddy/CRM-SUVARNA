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
import OpportunityCreatePage from "@/pages/opportunity-create-page";
import QuotationsPage from "@/pages/quotations-page";
import QuotationCreatePage from "@/pages/quotation-create-page";
import ProductsPage from "@/pages/products-page";
import OrdersPage from "@/pages/orders-page";
import SalesOrderCreatePage from "@/pages/sales-order-create-page";
import TasksPage from "@/pages/tasks-page";
import TaskCreatePage from "@/pages/task-create-page";
import ActivityCreatePage from "@/pages/activity-create-page";
import TaskCreateStandalone from "@/pages/task-create-standalone";
import ActivityCreateStandalone from "@/pages/activity-create-standalone";
import SalesReportsPage from "@/pages/sales-reports-page";
import ActivityReportsPage from "@/pages/activity-reports-page";
import TeamsPage from "@/pages/teams-page";
import TeamDetailsPage from "@/pages/team-details-page";
import TeamEditPage from "@/pages/team-edit-page";

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
      <ProtectedRoute path="/opportunities/new" component={OpportunityCreatePage} />
      <ProtectedRoute path="/opportunities/:id" component={OpportunityDetailsPage} />
      <ProtectedRoute path="/opportunities" component={OpportunitiesPage} />
      
      {/* Quotations routes */}
      <ProtectedRoute path="/quotations/new" component={QuotationCreatePage} />
      <ProtectedRoute path="/quotations/:id" component={QuotationsPage} />
      <ProtectedRoute path="/quotations" component={QuotationsPage} />
      
      {/* Products routes */}
      <ProtectedRoute path="/products/new" component={ProductsPage} />
      <ProtectedRoute path="/products/:id" component={ProductsPage} />
      <ProtectedRoute path="/products" component={ProductsPage} />
      
      {/* Orders routes */}
      <ProtectedRoute path="/orders/new" component={SalesOrderCreatePage} />
      <ProtectedRoute path="/orders/:id" component={OrdersPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      
      <ProtectedRoute path="/tasks/new" component={TaskCreatePage} />
      <ProtectedRoute path="/tasks/:id" component={TasksPage} />
      <ProtectedRoute path="/tasks" component={TasksPage} />
      <ProtectedRoute path="/task-create/:leadId?" component={TaskCreateStandalone} />
      
      <ProtectedRoute path="/activities/new" component={ActivityCreatePage} />
      <ProtectedRoute path="/activity-create/:leadId?" component={ActivityCreateStandalone} />
      
      {/* Reports routes */}
      <ProtectedRoute path="/reports/sales" component={SalesReportsPage} />
      <ProtectedRoute path="/reports/activities" component={ActivityReportsPage} />
      
      {/* Team management routes */}
      <ProtectedRoute path="/teams/:id/edit" component={TeamEditPage} />
      <ProtectedRoute path="/teams/:id" component={TeamDetailsPage} />
      <ProtectedRoute path="/teams" component={TeamsPage} />
      
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
