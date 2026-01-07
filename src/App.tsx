import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import LinksList from "./pages/LinksList";
import LinkDetail from "./pages/LinkDetail";
import CreateLink from "./pages/CreateLink";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import Support from "./pages/Support";

// Docs pages
import DocsLayout from "./components/DocsLayout";
import DocsHome from "./pages/docs/DocsHome";
import GettingStarted from "./pages/docs/GettingStarted";
import CreatingLinks from "./pages/docs/CreatingLinks";
import AnalyticsDocs from "./pages/docs/AnalyticsDocs";
import SecurityDocs from "./pages/docs/SecurityDocs";
import FAQ from "./pages/docs/FAQ";
import Troubleshooting from "./pages/docs/Troubleshooting";
import ApiDocs from "./pages/docs/ApiDocs";

// Legal pages
import LegalLayout from "./components/LegalLayout";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import AcceptableUse from "./pages/legal/AcceptableUse";
import Cookies from "./pages/legal/Cookies";
import DataRetention from "./pages/legal/DataRetention";
import Refunds from "./pages/legal/Refunds";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/support" element={<Support />} />
                
                {/* Docs routes */}
                <Route path="/docs" element={<DocsLayout />}>
                  <Route index element={<DocsHome />} />
                  <Route path="getting-started" element={<GettingStarted />} />
                  <Route path="creating-links" element={<CreatingLinks />} />
                  <Route path="analytics" element={<AnalyticsDocs />} />
                  <Route path="security" element={<SecurityDocs />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="troubleshooting" element={<Troubleshooting />} />
                  <Route path="api" element={<ApiDocs />} />
                </Route>

                {/* Legal routes */}
                <Route path="/legal" element={<LegalLayout />}>
                  <Route path="terms" element={<Terms />} />
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="acceptable-use" element={<AcceptableUse />} />
                  <Route path="cookies" element={<Cookies />} />
                  <Route path="data-retention" element={<DataRetention />} />
                  <Route path="refunds" element={<Refunds />} />
                </Route>

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="links" element={<LinksList />} />
                  <Route path="links/new" element={<CreateLink />} />
                  <Route path="links/:id" element={<LinkDetail />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="billing" element={<Billing />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
