import React, { useState } from "react";
import { useAiTransportationRecommendation } from "@workspace/api-client-react";
import type { TransportationMetricsInput, TransportMode, SustainabilityMetric } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrainFront, Bus, Car, Zap, Droplet, Recycle, BrainCircuit, Loader2, Leaf, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Mock data matching the API schema
const MOCK_TRANSPORT: TransportMode[] = [
  { mode: "Metro Line 1", currentLoad: 4200, capacity: 5000, predictedPeakMinutes: 15 },
  { mode: "Bus Terminal A", currentLoad: 850, capacity: 1200, predictedPeakMinutes: 45 },
  { mode: "Bus Terminal B", currentLoad: 1100, capacity: 1000, predictedPeakMinutes: 5 }, // Over capacity
  { mode: "Rideshare Zone", currentLoad: 350, capacity: 400, predictedPeakMinutes: 30 },
];

const MOCK_SUSTAINABILITY: SustainabilityMetric[] = [
  { name: "Power Grid", value: 45, unit: "MW", target: 50 },
  { name: "Water Usage", value: 12.5, unit: "kGal", target: 15 },
  { name: "Waste Diversion", value: 68, unit: "%", target: 75 },
];

export default function TransportationPage() {
  const [recommendation, setRecommendation] = useState<any>(null);
  const recommendationMutation = useAiTransportationRecommendation();

  const handleAnalyze = async () => {
    try {
      const result = await recommendationMutation.mutateAsync({
        data: {
          transportModes: MOCK_TRANSPORT,
          sustainabilityMetrics: MOCK_SUSTAINABILITY,
          attendanceCount: 65400,
          matchPhase: "post-match"
        }
      });
      setRecommendation(result);
    } catch (e) {
      console.error(e);
    }
  };

  const getTransportIcon = (mode: string) => {
    if (mode.includes("Metro")) return <TrainFront className="h-5 w-5" />;
    if (mode.includes("Bus")) return <Bus className="h-5 w-5" />;
    return <Car className="h-5 w-5" />;
  };

  const getSustIcon = (name: string) => {
    if (name.includes("Power")) return <Zap className="h-5 w-5 text-amber-500" />;
    if (name.includes("Water")) return <Droplet className="h-5 w-5 text-blue-500" />;
    return <Recycle className="h-5 w-5 text-emerald-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transportation & Sustainability</h2>
          <p className="text-muted-foreground text-sm">Monitor transit loads and environmental targets.</p>
        </div>
        <Button onClick={handleAnalyze} disabled={recommendationMutation.isPending}>
          {recommendationMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <BrainCircuit className="h-4 w-4 mr-2" />
          )}
          Generate AI Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/20 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrainFront className="h-5 w-5 text-primary" />
                Transit Hubs Load
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {MOCK_TRANSPORT.map((mode, i) => {
                const loadPercent = (mode.currentLoad / mode.capacity) * 100;
                const isOver = loadPercent > 100;
                const isHigh = loadPercent > 80;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-md">
                          {getTransportIcon(mode.mode)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{mode.mode}</div>
                          <div className="text-xs text-muted-foreground">Peak expected in {mode.predictedPeakMinutes}m</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-medium">
                          {mode.currentLoad.toLocaleString()} / {mode.capacity.toLocaleString()}
                        </div>
                        <div className={`text-xs ${isOver ? 'text-destructive font-bold' : isHigh ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                          {loadPercent.toFixed(1)}% Capacity
                        </div>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all rounded-full ${isOver ? 'bg-destructive' : isHigh ? 'bg-amber-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min(loadPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-emerald-500/20">
            <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                <Leaf className="h-5 w-5" />
                Environmental Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_SUSTAINABILITY.map((metric, i) => {
                // Different logic depending on metric.
                // For power/water, lower is better. For diversion, higher is better.
                let progress = 0;
                let isGood = true;
                if (metric.name === "Waste Diversion") {
                  progress = (metric.value / metric.target) * 100;
                  isGood = metric.value >= metric.target;
                } else {
                  progress = (metric.value / metric.target) * 100;
                  isGood = metric.value <= metric.target;
                }
                
                return (
                  <div key={i} className="flex flex-col border rounded-lg p-4 bg-card shadow-sm hover-elevate">
                    <div className="flex justify-between items-start mb-4">
                      {getSustIcon(metric.name)}
                      <Badge variant="outline" className={isGood ? "text-emerald-500 border-emerald-200" : "text-amber-500 border-amber-200"}>
                        {isGood ? "On Track" : "Needs Review"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">{metric.name}</div>
                    <div className="text-2xl font-bold tracking-tight mb-2">
                      {metric.value} <span className="text-sm font-normal text-muted-foreground">{metric.unit}</span>
                    </div>
                    <div className="mt-auto">
                      <div className="flex justify-between text-[10px] uppercase font-semibold text-muted-foreground mb-1.5">
                        <span>Current</span>
                        <span>Target: {metric.target}{metric.unit}</span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 h-full">
          <Card className="shadow-sm h-full flex flex-col border-primary/20 bg-card">
            <CardHeader className="bg-primary/10 border-b border-primary/10 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
              {recommendationMutation.isPending ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>Groq AI is analyzing multi-modal<br/>transit and grid data...</p>
                </div>
              ) : recommendation ? (
                <div className="space-y-6 animate-in fade-in">
                  {recommendation.overallStatus === 'critical' || recommendation.overallStatus === 'warning' ? (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="capitalize">{recommendation.overallStatus} Status</AlertTitle>
                      <AlertDescription>Immediate action required for transport logistics.</AlertDescription>
                    </Alert>
                  ) : (
                    <Badge className="w-fit" variant="outline">Status: {recommendation.overallStatus}</Badge>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-primary">Strategic Plan</h4>
                    <p className="text-sm text-foreground leading-relaxed bg-primary/5 p-4 rounded-md border border-primary/10">
                      {recommendation.recommendation}
                    </p>
                  </div>

                  {recommendation.urgentActions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-destructive">Urgent Dispatch Actions</h4>
                      <ul className="space-y-2">
                        {recommendation.urgentActions.map((action: string, i: number) => (
                          <li key={i} className="flex gap-2 text-sm items-start">
                            <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                            <span className="leading-snug">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-2">Sustainability Impact</h4>
                    <p className="text-sm text-muted-foreground">{recommendation.sustainabilitySummary}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12 text-muted-foreground">
                  <div className="rounded-full bg-muted p-4">
                    <BrainCircuit className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm">Click "Generate AI Plan" to calculate dynamic routing and grid management strategies.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
