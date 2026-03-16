import { Navigate, useLocation } from "react-router-dom";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, Role } from "@/hooks/useUserRole";
import { AccessDenied } from "./AccessDenied";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

function AuthLoadingScreen() {
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

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const location = useLocation();

  // Wait for auth to settle before making any routing decision (prevents flicker)
  if (authLoading) return <AuthLoadingScreen />;

  // Unauthenticated: redirect to /auth, carry the requested destination
  if (!user) {
    const from = location.pathname + location.search + location.hash;
    return <Navigate to="/auth" state={{ from }} replace />;
  }

  // Role-gated route: wait for role to resolve before enforcing
  if (allowedRoles) {
    if (roleLoading) return <AuthLoadingScreen />;
    // Fail closed: null role or unlisted role → access denied
    if (!role || !allowedRoles.includes(role)) return <AccessDenied />;
  }

  return <>{children}</>;
}
