import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthLoadingScreen } from "./AuthLoadingScreen";
import { isSafeReturnPath } from "@/lib/authReturnPaths";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoadingScreen />;

  if (user) {
    const from = location.state?.from;
    const dest = isSafeReturnPath(from) ? from : "/portal";
    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
}
