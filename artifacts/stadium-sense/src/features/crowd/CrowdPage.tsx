import React, { useState } from "react";
import {
  useGetCrowdGates,
  useAiCrowdAnalysis,
  getGetCrowdGatesQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GateHeatmap } from "./GateHeatmap";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw, AlertTriangle, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface CrowdAnalysisResult {
  prediction: string;
  recommendations: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  summary: string;
}

const RISK_LEVEL_COLORS: Record<CrowdAnalysisResult["riskLevel"], string> = {
  low: "bg-emerald-100 text-emerald-800 border-emerald-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

export default function CrowdPage() {
  const { data: gates = [], isLoading, refetch, isFetching } = useGetCrowdGates({
    query: { queryKey: getGetCrowdGatesQueryKey(), refetchInterval: 30000 },
  });

  const analysisMutation = useAiCrowdAnalysis();
  const [lastAnalysis, setLastAnalysis] = useState<CrowdAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (gates.length === 0) return;
    setAnalysisError(null);

    try {
      const response = await analysisMutation.mutateAsync({
        data: {
          matchPhase: "pre-match",
          gates: gates.map((g) => ({
            gateId: g.id,
            density: g.density,
            flowRate: g.flowRate,
            waitMinutes: g.waitMinutes,
          })),
        },
      });
      setLastAnalysis(response as CrowdAnalysisResult);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    }
  };

  const totalCrowd = gates.reduce((sum, g) => sum + g.currentCount, 0);
  const avgWait = gates.length
    ? (gates.reduce((sum, g) => sum + g.waitMinutes, 0) / gates.length).toFixed(1)
    : "0";
  const criticalGates = gates.filter((g) => g.status === "critical").length;
  const congestedGates = gates.filter((g) => g.status === "congested").length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Crowd Intelligence</h2>
          <p className="text-muted-foreground text-sm">
            Live density heatmaps and predictive flow analysis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh gate data"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={runAnalysis}
            disabled={analysisMutation.isPending || gates.length === 0}
            aria-label="Run AI crowd analysis"
          >
            {analysisMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
            ) : (
              <BrainCircuit className="h-4 w-4 mr-2" aria-hidden="true" />
            )}
            AI Analysis
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" role="region" aria-label="Crowd statistics">
        {[
          { label: "Total Fans", value: totalCrowd.toLocaleString(), sub: `across ${gates.length} gates` },
          { label: "Avg Wait", value: `${avgWait}m`, sub: "across all gates" },
          { label: "Critical Gates", value: criticalGates, sub: ">90% capacity", accent: criticalGates > 0 },
          { label: "Congested Gates", value: congestedGates, sub: ">70% capacity", accent: congestedGates > 2 },
        ].map(({ label, value, sub, accent }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="text-xs text-muted-foreground font-medium">{label}</div>
              <div className={`text-2xl font-bold mt-1 ${accent ? "text-destructive" : ""}`}>{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Analysis Result */}
      {analysisError && (
        <Alert variant="destructive" role="alert">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{analysisError}</AlertDescription>
        </Alert>
      )}

      {lastAnalysis && (
        <Alert
          className={`border ${RISK_LEVEL_COLORS[lastAnalysis.riskLevel]}`}
          role="region"
          aria-label="AI crowd analysis result"
        >
          <BrainCircuit className="h-4 w-4" aria-hidden="true" />
          <AlertTitle className="flex items-center gap-2">
            AI Crowd Analysis
            <Badge variant="outline" className="capitalize font-semibold">
              {lastAnalysis.riskLevel} risk
            </Badge>
          </AlertTitle>
          <AlertDescription className="space-y-3 mt-2">
            <p className="font-medium">{lastAnalysis.summary}</p>
            <p className="text-sm opacity-90">{lastAnalysis.prediction}</p>
            {lastAnalysis.recommendations.length > 0 && (
              <ul className="text-sm space-y-1 list-disc list-inside opacity-90" aria-label="Recommendations">
                {lastAnalysis.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Gate Heatmap */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Gate Density Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground" aria-busy="true" aria-label="Loading gate data">
              <Loader2 className="h-8 w-8 animate-spin mr-3" aria-hidden="true" />
              Loading gate data...
            </div>
          ) : (
            <GateHeatmap gates={gates} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
