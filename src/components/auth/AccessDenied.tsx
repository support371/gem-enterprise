import { Link } from "react-router-dom";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Access Denied</h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          You don't have the required permissions to view this page. If you believe
          this is an error, contact your portal administrator to request access.
        </p>
        <Button variant="outline" asChild>
          <Link to="/portal" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
        </Button>
      </div>
    </div>
  );
}
