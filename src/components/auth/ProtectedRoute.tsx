import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, Role } from "@/hooks/useUserRole";
import { AccessDenied } from "./AccessDenied";
import { AuthLoadingScreen } from "./AuthLoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
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
