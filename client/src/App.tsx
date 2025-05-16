import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import UnifiedDashboardPage from "@/pages/unified-dashboard-page";
import LeadsPage from "@/pages/leads-page";
import LeadDetailsPage from "@/pages/lead-details-page";
import LeadEditPage from "@/pages/lead-edit-page";
import ContactsPage from "@/pages/contacts-page";
import ContactDetailsPage from "@/pages/contact-details-page";
import CompaniesPage from "@/pages/companies-page";
import CompanyDetailsPage from "@/pages/company-details-page";
import OpportunitiesPage from "@/pages/opportunities-page";
import OpportunityDetailsPage from "@/pages/opportunity-details-page";
import OpportunityCreatePage from "@/pages/opportunity-create-page";
import OpportunityEditPage from "@/pages/opportunity-edit-page";
import QuotationsPage from "@/pages/quotations-page";
import QuotationCreatePage from "@/pages/quotation-create-page";
import QuotationDetailsPage from "@/pages/quotation-details-page";
import QuotationEditPage from "@/pages/quotation-edit-page";
import ProductsPage from "@/pages/products-page";
import VendorsPage from "@/pages/vendors-page";
import ModulesPage from "@/pages/modules-page";
import OrdersPage from "@/pages/orders-page";
import SalesOrderCreatePage from "@/pages/sales-order-create-page";
import OrderEditPage from "@/pages/order-edit-page";
import OrderDetailsPage from "@/pages/order-details-page";
import InvoicesPage from "@/pages/invoices-page";
import InvoiceDetailsPage from "@/pages/invoice-details-page";
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
import TeamsManagementPage from "@/pages/teams-management-page";
import SettingsPage from "@/pages/settings-page";
import CalendarPage from "@/pages/calendar-page";
import TasksCalendarPage from "@/pages/tasks-calendar-page";
import SalesTargetsPage from "@/pages/sales-targets-page";
import VendorGroupsPage from "@/pages/vendor-groups-page";

// Import mobile pages
import MobileDashboardPage from "@/pages/mobile/mobile-dashboard";
import MobileLeadsPage from "@/pages/mobile/mobile-leads";

// Mobile device detection hook
function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if device is mobile based on screen width and/or user agent
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileDevices = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileDevices.test(userAgent);
      const isMobileWidth = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || isMobileWidth);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener to detect orientation changes
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

function Router() {
  const isMobile = useMobileDetection();
  const [, setLocation] = useLocation();
  
  // Listen for the beforeinstallprompt event for PWA install
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Register service worker for PWA support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
          console.error('Service worker registration failed:', error);
        });
      });
    }
  }, []);

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Mobile-specific routes */}
      {isMobile ? (
        <>
          <ProtectedRoute path="/" component={MobileDashboardPage} />
          <ProtectedRoute path="/dashboard" component={MobileDashboardPage} />
          <ProtectedRoute path="/leads" component={MobileLeadsPage} />
          {/* Add more mobile-optimized routes as they're developed */}
          
          {/* Fall back to desktop routes for pages that don't have mobile versions yet */}
          <ProtectedRoute path="/unified" component={UnifiedDashboardPage} />
          <ProtectedRoute path="/leads/new" component={LeadsPage} />
          <ProtectedRoute path="/leads/edit/:id" component={LeadEditPage} />
          <ProtectedRoute path="/leads/:id" component={LeadDetailsPage} />
        </>
      ) : (
        <>
          {/* Desktop routes */}
          <ProtectedRoute path="/" component={DashboardPage} />
          <ProtectedRoute path="/dashboard" component={DashboardPage} />
          <ProtectedRoute path="/unified" component={UnifiedDashboardPage} />
          
          {/* Leads routes */}
          <ProtectedRoute path="/leads/new" component={LeadsPage} />
          <ProtectedRoute path="/leads/edit/:id" component={LeadEditPage} />
          <ProtectedRoute path="/leads/:id" component={LeadDetailsPage} />
          <ProtectedRoute path="/leads" component={LeadsPage} />
        </>
      )}
      
      {/* Common routes for both mobile and desktop */}
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
      <ProtectedRoute path="/opportunities/edit/:id" component={OpportunityEditPage} />
      <ProtectedRoute path="/opportunities/:id" component={OpportunityDetailsPage} />
      <ProtectedRoute path="/opportunities" component={OpportunitiesPage} />
      
      {/* Quotations routes */}
      <ProtectedRoute path="/quotations/new" component={QuotationCreatePage} />
      <ProtectedRoute path="/quotations/:id/edit" component={QuotationEditPage} />
      <ProtectedRoute path="/quotations/:id" component={QuotationDetailsPage} />
      <ProtectedRoute path="/quotations" component={QuotationsPage} />
      
      {/* Products routes */}
      <ProtectedRoute path="/products/new" component={ProductsPage} />
      <ProtectedRoute path="/products/:id" component={ProductsPage} />
      <ProtectedRoute path="/products" component={ProductsPage} />
      
      {/* Vendors routes */}
      <ProtectedRoute path="/vendors/new" component={VendorsPage} />
      <ProtectedRoute path="/vendors/:id" component={VendorsPage} />
      <ProtectedRoute path="/vendors" component={VendorsPage} />
      
      {/* Vendor Groups routes */}
      <ProtectedRoute path="/vendor-groups" component={VendorGroupsPage} />
      
      {/* Modules routes */}
      <ProtectedRoute path="/modules/new" component={ModulesPage} />
      <ProtectedRoute path="/modules/:id" component={ModulesPage} />
      <ProtectedRoute path="/modules" component={ModulesPage} />
      
      {/* Orders routes */}
      <ProtectedRoute path="/orders/new" component={SalesOrderCreatePage} />
      <ProtectedRoute path="/sales/new" component={SalesOrderCreatePage} /> {/* Add alias for backward compatibility */}
      <ProtectedRoute path="/orders/:id/edit" component={OrderEditPage} />
      <ProtectedRoute path="/orders/:id" component={OrderDetailsPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      
      {/* Invoices routes */}
      <ProtectedRoute path="/invoices/:id" component={InvoiceDetailsPage} />
      <ProtectedRoute path="/invoices" component={InvoicesPage} />
      
      <ProtectedRoute path="/tasks/new" component={TaskCreatePage} />
      <ProtectedRoute path="/tasks/calendar" component={TasksCalendarPage} />
      <ProtectedRoute path="/tasks/:id" component={TasksPage} />
      <ProtectedRoute path="/tasks" component={TasksPage} />
      
      {/* Standalone task creation pages with lead or opportunity ID */}
      <ProtectedRoute path="/task-create/:leadId" component={TaskCreateStandalone} />
      <ProtectedRoute path="/task-create/opportunity/:opportunityId" component={TaskCreateStandalone} />
      <ProtectedRoute path="/task-create" component={TaskCreateStandalone} />
      
      <ProtectedRoute path="/activities/new" component={ActivityCreatePage} />
      
      {/* Standalone activity creation pages with lead or opportunity ID */}
      <ProtectedRoute path="/activity-create/:leadId" component={ActivityCreateStandalone} />
      <ProtectedRoute path="/activity-create/opportunity/:opportunityId" component={ActivityCreateStandalone} />
      <ProtectedRoute path="/activity-create" component={ActivityCreateStandalone} />
      
      {/* Calendar route */}
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      
      {/* Reports routes */}
      <ProtectedRoute path="/reports/sales" component={SalesReportsPage} />
      <ProtectedRoute path="/reports/activities" component={ActivityReportsPage} />
      
      {/* Sales Targets route */}
      <ProtectedRoute path="/sales-targets" component={SalesTargetsPage} />
      
      {/* Team management routes */}
      <ProtectedRoute path="/teams/:id/edit" component={TeamEditPage} />
      <ProtectedRoute path="/teams/:id" component={TeamDetailsPage} />
      <ProtectedRoute path="/teams" component={TeamsPage} />
      <ProtectedRoute path="/team-management" component={TeamsManagementPage} />
      
      {/* Settings route */}
      <ProtectedRoute path="/settings" component={SettingsPage} />
      
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
