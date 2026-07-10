import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListIncidents, 
  useAiIncidentPriority, 
  useUpdateIncident,
  getListIncidentsQueryKey 
} from "@workspace/api-client-react";
import type { Incident, IncidentInputSeverity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidentList } from "./IncidentList";
import { IncidentForm } from "./IncidentForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { BrainCircuit, AlertTriangle, ShieldAlert, AlertCircle, RefreshCw, Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function IncidentsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  
  const { data: incidents = [], isLoading, refetch, isFetching } = useListIncidents({
    query: { queryKey: getListIncidentsQueryKey(), refetchInterval: 30000 },
  });

  const aiPriorityMutation = useAiIncidentPriority();
  const updateMutation = useUpdateIncident();

  // If selected incident updates in the list, keep local state fresh
  useEffect(() => {
    if (selectedIncident) {
      const fresh = incidents.find(i => i.id === selectedIncident.id);
      if (fresh) setSelectedIncident(fresh);
    }
  }, [incidents]);

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getListIncidentsQueryKey() });
    // After creating, the newest incident will be at the top of the list after refetch
    // We don't auto-select it here since refetch is async, but user can click it.
  };

  const runAiTriage = async () => {
    if (!selectedIncident) return;

    try {
      const result = await aiPriorityMutation.mutateAsync({
        data: {
          location: selectedIncident.location,
          description: selectedIncident.description,
          severity: selectedIncident.severity as IncidentInputSeverity,
        }
      });

      // Update the incident with AI results
      await updateMutation.mutateAsync({
        id: selectedIncident.id,
        data: {
          aiPriority: result.suggestedPriority,
          aiRecommendation: result.recommendation
        }
      });

      toast({
        title: "AI Triage Complete",
        description: `Assigned Priority ${result.suggestedPriority} with recommendations.`,
      });
      
      queryClient.invalidateQueries({ queryKey: getListIncidentsQueryKey() });
    } catch (e) {
      console.error(e);
      toast({
        title: "AI Triage Failed",
        description: "Could not complete AI analysis at this time.",
        variant: "destructive"
      });
    }
  };

  const updateStatus = async (status: any) => {
    if (!selectedIncident) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedIncident.id,
        data: { status }
      });
      toast({ title: "Status Updated", description: `Incident moved to ${status}.` });
      queryClient.invalidateQueries({ queryKey: getListIncidentsQueryKey() });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Incident Management</h2>
          <p className="text-muted-foreground text-sm">Log, triage, and resolve stadium operations events.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Sync Log
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: List */}
        <Card className="shadow-sm lg:col-span-5 xl:col-span-4 flex flex-col overflow-hidden border-border">
          <CardHeader className="bg-muted/20 border-b py-4">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              Active Incident Log
              <Badge variant="secondary" className="font-mono">{incidents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg border border-border" />
                ))}
              </div>
            ) : (
              <IncidentList 
                incidents={incidents} 
                onSelectIncident={setSelectedIncident} 
                selectedId={selectedIncident?.id}
              />
            )}
          </CardContent>
        </Card>

        {/* Right Column: Details or Form */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-6 overflow-y-auto pr-2 pb-6">
          {selectedIncident ? (
            <Card className="shadow-sm border-primary/20 bg-card flex-1">
              <CardHeader className="border-b bg-muted/20 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-0.5 rounded border">
                      INC-{selectedIncident.id.toString().padStart(4, '0')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Reported at {format(new Date(selectedIncident.createdAt), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{selectedIncident.location}</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIncident(null)}>
                  Close
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Core Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Description</h4>
                    <p className="text-base leading-relaxed bg-muted/50 p-4 rounded-md border">{selectedIncident.description}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</h4>
                      <Select 
                        value={selectedIncident.status} 
                        onValueChange={updateStatus}
                        disabled={updateMutation.isPending}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Severity</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedIncident.severity === 'critical' ? <ShieldAlert className="h-5 w-5 text-destructive" /> : 
                         selectedIncident.severity === 'high' ? <AlertTriangle className="h-5 w-5 text-destructive" /> : 
                         selectedIncident.severity === 'medium' ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : 
                         <AlertCircle className="h-5 w-5 text-primary" />}
                        <span className="capitalize font-medium">{selectedIncident.severity}</span>
                      </div>
                    </div>
                    {selectedIncident.reportedBy && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Reporter</h4>
                        <div className="text-sm font-medium">{selectedIncident.reportedBy}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Panel */}
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
                    <h3 className="font-semibold text-primary flex items-center gap-2">
                      <BrainCircuit className="h-5 w-5" />
                      AI Triage Assessment
                    </h3>
                    {!selectedIncident.aiPriority && (
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-8 shadow-sm"
                        onClick={runAiTriage}
                        disabled={aiPriorityMutation.isPending}
                      >
                        {aiPriorityMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Run Analysis"}
                      </Button>
                    )}
                  </div>
                  <div className="p-4 bg-primary/5">
                    {aiPriorityMutation.isPending ? (
                      <div className="flex flex-col items-center justify-center py-6 text-primary/70">
                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                        <span className="text-sm">Groq AI is analyzing severity and location...</span>
                      </div>
                    ) : selectedIncident.aiPriority ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-background border border-primary/20 px-3 py-1.5 rounded-md flex items-center gap-2 shadow-sm">
                            <span className="text-xs text-muted-foreground">Assigned Priority</span>
                            <span className="font-bold text-primary">{selectedIncident.aiPriority}</span>
                          </div>
                        </div>
                        {selectedIncident.aiRecommendation && (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Action Plan</h4>
                            <p className="text-sm text-foreground leading-relaxed">
                              {selectedIncident.aiRecommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 py-2">
                        <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          This incident has not yet been analyzed by the AI Copilot. Run triage to automatically assign a priority level and receive response recommendations based on stadium SOPs.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border-border flex-1 flex flex-col h-full">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-lg">Report New Incident</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1">
                <IncidentForm onSuccess={handleCreateSuccess} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
