import { Navigate, useLocation } from "react-router-dom";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
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

  if (user) {
    // Honor return path only for safe internal portal destinations
    const from = location.state?.from;
    const dest =
      typeof from === "string" && from.startsWith("/portal") ? from : "/portal";
    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
}
