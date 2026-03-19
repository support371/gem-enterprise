import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/auth/PublicOnlyRoute";
import { Loader2, Shield } from "lucide-react";

// Public site pages
import Index from "./pages/Index";
import TrustCenter from "./pages/TrustCenter";
import Solutions from "./pages/Solutions";
import SolutionDetail from "./pages/SolutionDetail";
import Pricing from "./pages/Pricing";
import Resources from "./pages/Resources";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogManage from "./pages/BlogManage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Onboarding flow
import Register from "./pages/Register";
import KYC from "./pages/KYC";
import KYCStatus from "./pages/KYCStatus";
import Handoff from "./pages/Handoff";

// Portal pages
import Portal from "./pages/portal/Portal";
import PortalServices from "./pages/portal/PortalServices";
import PortalTasks from "./pages/portal/PortalTasks";
import PortalIncidents from "./pages/portal/PortalIncidents";
import PortalCommunity from "./pages/portal/PortalCommunity";
import PortalWorkspace from "./pages/portal/PortalWorkspace";
import PortalTeam from "./pages/portal/PortalTeam";
import PortalActivity from "./pages/portal/PortalActivity";
import PortalSettings from "./pages/portal/PortalSettings";
import AllianceTrust from "./pages/portal/AllianceTrust";

// Standalone portal pages
import Profile from "./pages/Profile";
import Support from "./pages/Support";

const queryClient = new QueryClient();

function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    </div>
  );
}

// Legacy guard for non-portal protected routes (blog manage, dashboard)
const LegacyProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <AuthLoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ── Public site ───────────────────────────────────────────── */}
            <Route path="/" element={<Index />} />
            <Route path="/trust-center" element={<TrustCenter />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/solutions/:slug" element={<SolutionDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/blog/manage" element={<LegacyProtectedRoute><BlogManage /></LegacyProtectedRoute>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ── Auth ──────────────────────────────────────────────────── */}
            <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
            <Route path="/login" element={<Auth />} />
            <Route path="/dashboard" element={<LegacyProtectedRoute><Dashboard /></LegacyProtectedRoute>} />

            {/* ── Onboarding flow ───────────────────────────────────────── */}
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
            <Route path="/kyc/status" element={<ProtectedRoute><KYCStatus /></ProtectedRoute>} />
            <Route path="/handoff" element={<ProtectedRoute><Handoff /></ProtectedRoute>} />

            {/* ── Portal (auth + RBAC gated) ────────────────────────────── */}
            {/* /portal/dashboard → canonical dashboard URL */}
            <Route
              path="/portal/dashboard"
              element={<Navigate to="/portal" replace />}
            />
            <Route
              path="/portal"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "analyst", "viewer"]}>
                  <Portal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/services"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "analyst", "viewer"]}>
                  <PortalServices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/tasks"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "analyst"]}>
                  <PortalTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/incidents"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "analyst"]}>
                  <PortalIncidents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/community"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "analyst", "viewer"]}>
                  <PortalCommunity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/workspace"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "analyst", "viewer"]}>
                  <PortalWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/team"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <PortalTeam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/activity"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "analyst"]}>
                  <PortalActivity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/alliance-trust"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "analyst", "viewer"]}>
                  <AllianceTrust />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PortalSettings />
                </ProtectedRoute>
              }
            />

            {/* ── Standalone portal pages ───────────────────────────────── */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "analyst", "viewer"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={<Navigate to="/portal/settings" replace />}
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "analyst", "viewer"]}>
                  <Support />
                </ProtectedRoute>
              }
            />

            {/* ── Catch-all ─────────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
