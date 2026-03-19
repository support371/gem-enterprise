import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthLoadingScreen } from "./AuthLoadingScreen";

// Authenticated routes that are safe to return to after login
const SAFE_RETURN_PREFIXES = ["/portal", "/profile", "/support", "/settings", "/kyc"];

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoadingScreen />;

  if (user) {
    const from = location.state?.from;
    const dest =
      typeof from === "string" && SAFE_RETURN_PREFIXES.some((p) => from.startsWith(p))
        ? from
        : "/portal";
    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
}
