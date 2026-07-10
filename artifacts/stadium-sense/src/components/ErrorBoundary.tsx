import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  /** Optional fallback UI. Receives the error for custom messaging. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * ErrorBoundary wraps any subtree and catches unhandled React render errors,
 * displaying a recoverable fallback instead of crashing the whole application.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <FeaturePage />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production you would forward to an error-tracking service here.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) return fallback(error, this.reset);

      return (
        <div
          className="flex flex-col items-center justify-center h-full min-h-[320px] gap-4 p-8 text-center"
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold mb-1">Something went wrong</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              This section encountered an unexpected error. You can try reloading it or refreshing the
              page.
            </p>
          </div>
          <Button variant="outline" onClick={this.reset} className="gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      );
    }

    return children;
  }
}
