import React, { useEffect, useState } from "react";
import { useGetCrowdGates, useAiCrowdAnalysis, getGetCrowdGatesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GateHeatmap } from "./GateHeatmap";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw, AlertTriangle, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function CrowdPage() {
  const { data: gates = [], isLoading, refetch, isFetching } = useGetCrowdGates({
    query: { queryKey: getGetCrowdGatesQueryKey(), refetchInterval: 30000 },
  });
  
  const analysisMutation = useAiCrowdAnalysis();
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  const runAnalysis = async () => {
    if (gates.length === 0) return;
    
    try {
      const response = await analysisMutation.mutateAsync({
        data: {
          matchPhase: "pre-match",
          gates: gates.map(g => ({
            gateId: g.id,
            density: g.density,
            flowRate: g.flowRate,
            waitMinutes: g.waitMinutes
          }))
        }
      });
      setLastAnalysis(response);
    } catch (e) {
      console.error(e);
    }
  };

  const totalCrowd = gates.reduce((sum, g) => sum + g.currentCount, 0);
  const avgWait = gates.length ? (gates.reduce((sum, g) => sum + g.waitMinutes, 0) / gates.length).toFixed(1) : 0;
  const criticalGates = gates.filter(g => g.status === 'critical').length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Crowd Intelligence</h2>
          <p className="text-muted-foreground text-sm">Live density heatmaps and predictive flow analysis.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground flex items-center mr-2">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Updates
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={runAnalysis} disabled={analysisMutation.isPending || gates.length === 0}>
            {analysisMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BrainCircuit className="h-4 w-4 mr-2" />
            )}
            AI Analysis
          </Button>
        </div>
      </div>

      {criticalGates > 0 && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            {criticalGates} gate(s) have reached critical congestion levels. Please review the AI recommendations below or re-route crowds immediately.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ingress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCrowd.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Fans currently scanned in</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgWait} <span className="text-xl font-normal text-muted-foreground">min</span></div>
            <p className="text-xs text-muted-foreground mt-1">Across all open gates</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gate Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{gates.length - criticalGates} <span className="text-xl font-normal text-muted-foreground">/ {gates.length}</span></div>
            <p className="text-xs text-muted-foreground mt-1">Gates operating nominally</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">Gate Heatmap</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <GateHeatmap gates={gates} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <Card className="shadow-sm h-full flex flex-col">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                AI Crowd Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
              {analysisMutation.isPending ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>Groq AI is processing your request...<br/>Analyzing flow dynamics across {gates.length} gates.</p>
                </div>
              ) : lastAnalysis ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">Risk Assessment</h4>
                      <Badge variant={
                        lastAnalysis.riskLevel === 'critical' ? 'destructive' :
                        lastAnalysis.riskLevel === 'high' ? 'destructive' :
                        lastAnalysis.riskLevel === 'medium' ? 'default' : 'secondary'
                      } className="capitalize">
                        {lastAnalysis.riskLevel} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground bg-muted p-3 rounded-md">{lastAnalysis.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-primary">Prediction</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{lastAnalysis.prediction}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Recommended Actions</h4>
                    <ul className="space-y-2">
                      {lastAnalysis.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm bg-background border rounded-md p-3 shadow-sm">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {i+1}
                          </span>
                          <span className="leading-snug">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12 text-muted-foreground">
                  <div className="rounded-full bg-muted p-4">
                    <Info className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div className="max-w-[200px]">
                    <p className="text-sm">Run an AI analysis to get predictive insights and actionable recommendations for current gate conditions.</p>
                  </div>
                  <Button variant="outline" onClick={runAnalysis} disabled={gates.length === 0}>
                    Analyze Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
