import { Component, ReactNode } from "react";
import { Shield, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  handleReset = () => {
    this.setState({ error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-sm text-center space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground mb-2">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. If this persists, please contact support.
              </p>
            </div>
            {import.meta.env.DEV && (
              <pre className="text-left text-xs bg-muted rounded-lg p-3 text-destructive overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReset} className="w-full gap-2">
              <RefreshCw className="w-4 h-4" />
              Return to home
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
