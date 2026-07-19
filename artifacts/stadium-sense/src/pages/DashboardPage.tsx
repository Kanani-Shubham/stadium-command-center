import React from "react";
import { Link } from "wouter";
import { useGetCrowdGates, useListIncidents, getGetCrowdGatesQueryKey, getListIncidentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, Truck, Zap, Activity, ShieldAlert, CheckCircle2, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data: gates = [], isLoading: loadingGates } = useGetCrowdGates({
    query: { queryKey: getGetCrowdGatesQueryKey(), refetchInterval: 30000 },
  });
  
  const { data: incidents = [], isLoading: loadingIncidents } = useListIncidents({
    query: { queryKey: getListIncidentsQueryKey(), refetchInterval: 30000 },
  });

  const activeIncidents = incidents.filter(i => i.status !== "resolved");
  const criticalIncidents = activeIncidents.filter(i => i.severity === "critical");
  
  const totalCrowd = gates.reduce((acc, gate) => acc + gate.currentCount, 0);
  const totalCapacity = gates.reduce((acc, gate) => acc + gate.capacity, 0);
  const crowdPercentage = totalCapacity > 0 ? (totalCrowd / totalCapacity) * 100 : 0;
  
  const congestedGates = gates.filter(g => g.status === "congested" || g.status === "critical").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stadium Occupancy</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingGates ? (
              <div className="h-8 w-24 animate-pulse bg-muted rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalCrowd.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {crowdPercentage.toFixed(1)}% of total capacity
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Incidents</CardTitle>
            <AlertTriangle className={criticalIncidents.length > 0 ? "h-4 w-4 text-destructive" : "h-4 w-4 text-primary"} />
          </CardHeader>
          <CardContent>
            {loadingIncidents ? (
              <div className="h-8 w-24 animate-pulse bg-muted rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{activeIncidents.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {criticalIncidents.length} critical issues
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transport Load</CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Metro line 1 highly congested
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sustainability Score</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">A-</div>
            <p className="text-xs text-muted-foreground mt-1">
              Energy usage under target
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Incidents
              </CardTitle>
              <Link href="/incidents" className="text-sm text-primary hover:underline font-medium">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingIncidents ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="h-4 w-4 mt-1 bg-muted rounded animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : incidents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <CheckCircle2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p>No active incidents reported.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {incidents.slice(0, 5).map(incident => (
                  <div key={incident.id} className="p-4 hover:bg-muted/50 transition-colors flex items-start gap-4">
                    <div className="mt-0.5">
                      {incident.severity === 'critical' || incident.severity === 'high' ? (
                        <ShieldAlert className="h-5 w-5 text-destructive" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{incident.location}</p>
                        <time className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(incident.createdAt), "HH:mm")}
                        </time>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{incident.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={
                          incident.severity === 'critical' ? 'destructive' :
                          incident.severity === 'high' ? 'destructive' :
                          incident.severity === 'medium' ? 'default' : 'secondary'
                        } className="text-[10px] px-1.5 py-0">
                          {incident.severity}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {incident.status}
                        </Badge>
                        {incident.aiPriority && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                            AI {incident.aiPriority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-base font-semibold">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid gap-3">
              <Link href="/copilot" className="group flex items-center justify-between rounded-lg border p-4 hover-elevate transition-all">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">AI Copilot</div>
                    <div className="text-xs text-muted-foreground">Ask operations questions</div>
                  </div>
                </div>
              </Link>
              <Link href="/crowd" className="group flex items-center justify-between rounded-lg border p-4 hover-elevate transition-all">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Crowd Int.</div>
                    <div className="text-xs text-muted-foreground">{congestedGates} congested gates</div>
                  </div>
                </div>
              </Link>
              <Link href="/transportation" className="group flex items-center justify-between rounded-lg border p-4 hover-elevate transition-all">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Transport</div>
                    <div className="text-xs text-muted-foreground">Review sustainability</div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-primary/20 bg-primary/5 hover-elevate transition-all">
            <CardHeader className="border-b border-primary/10 bg-primary/10 pb-3">
              <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                <Users className="h-4 w-4" />
                Volunteer Coordination
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Active Stewards:</span>
                <span className="font-semibold text-foreground">342 / 350 deployed</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Sector Coverage:</span>
                  <span className="text-foreground font-medium">97.7%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "97.7%" }} />
                </div>
              </div>
              <div className="text-xs border-t pt-2 border-primary/10 text-muted-foreground">
                <strong className="text-primary block mb-0.5">AI Steward Suggestion:</strong>
                Re-allocate 5 floating volunteers to Gate A check-in queue to support peak arrival flow.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
