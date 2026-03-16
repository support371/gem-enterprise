import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/auth/PublicOnlyRoute";

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

// Portal pages
import Portal from "./pages/portal/Portal";
import PortalTasks from "./pages/portal/PortalTasks";
import PortalIncidents from "./pages/portal/PortalIncidents";
import PortalTeam from "./pages/portal/PortalTeam";
import PortalActivity from "./pages/portal/PortalActivity";
import PortalSettings from "./pages/portal/PortalSettings";
import AllianceTrust from "./pages/portal/AllianceTrust";

const queryClient = new QueryClient();

// Legacy guard for non-portal protected routes (blog manage, dashboard)
const LegacyProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
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
            {/* /auth  → portal-aware: preserves return path, wraps with PublicOnlyRoute */}
            <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
            {/* /login → legacy entry point (blog manage, dashboard) — kept for backward compat */}
            <Route path="/login" element={<Auth />} />
            <Route path="/dashboard" element={<LegacyProtectedRoute><Dashboard /></LegacyProtectedRoute>} />

            {/* ── Portal (auth + RBAC gated) ────────────────────────────── */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "analyst", "viewer"]}>
                  <Portal />
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

            {/* ── Catch-all ─────────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
