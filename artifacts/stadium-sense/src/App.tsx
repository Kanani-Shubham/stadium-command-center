import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const CopilotPage = React.lazy(() => import("./features/copilot/CopilotPage"));
const CrowdPage = React.lazy(() => import("./features/crowd/CrowdPage"));
const NavigationPage = React.lazy(() => import("./features/navigation/NavigationPage"));
const MultilingualPage = React.lazy(() => import("./features/multilingual/MultilingualPage"));
const AccessibilityPage = React.lazy(() => import("./features/accessibility/AccessibilityPage"));
const TransportationPage = React.lazy(() => import("./features/transportation/TransportationPage"));
const IncidentsPage = React.lazy(() => import("./features/incidents/IncidentsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10_000,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-busy="true" aria-label="Loading module">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
        />
        <p className="text-sm font-medium">Loading module...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/copilot" component={CopilotPage} />
            <Route path="/crowd" component={CrowdPage} />
            <Route path="/navigation" component={NavigationPage} />
            <Route path="/multilingual" component={MultilingualPage} />
            <Route path="/accessibility" component={AccessibilityPage} />
            <Route path="/transportation" component={TransportationPage} />
            <Route path="/incidents" component={IncidentsPage} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
