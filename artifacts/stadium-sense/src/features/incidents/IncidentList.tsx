import React from "react";
import { format } from "date-fns";
import type { Incident } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertTriangle, AlertCircle, Clock, CheckCircle2, ChevronRight, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentListProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  selectedId?: number;
}

export function IncidentList({ incidents, onSelectIncident, selectedId }: IncidentListProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "medium": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "low": default: return <AlertCircle className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": return <Badge variant="outline" className="text-[10px] uppercase border-emerald-500 text-emerald-600 bg-emerald-500/10 px-1.5 py-0">Resolved</Badge>;
      case "in-progress": return <Badge variant="outline" className="text-[10px] uppercase border-amber-500 text-amber-600 bg-amber-500/10 px-1.5 py-0">In Progress</Badge>;
      case "open": default: return <Badge variant="outline" className="text-[10px] uppercase border-primary text-primary bg-primary/10 px-1.5 py-0">Open</Badge>;
    }
  };

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-card">
        <CheckCircle2 className="h-10 w-10 mb-3 text-muted-foreground/30" />
        <p className="text-sm font-medium">No incidents found</p>
        <p className="text-xs">All clear on the command center.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {incidents.map((incident) => {
        const isSelected = selectedId === incident.id;
        
        return (
          <div 
            key={incident.id}
            onClick={() => onSelectIncident(incident)}
            className={cn(
              "flex flex-col gap-3 p-4 rounded-lg border transition-all cursor-pointer group hover-elevate",
              isSelected 
                ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20" 
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex gap-2.5 items-start">
                <div className="mt-0.5 bg-background p-1.5 rounded shadow-sm border">
                  {getSeverityIcon(incident.severity)}
                </div>
                <div>
                  <h4 className={cn("font-medium text-sm line-clamp-1", isSelected && "text-primary")}>
                    {incident.location}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {incident.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[10px] text-muted-foreground flex items-center bg-muted px-1.5 py-0.5 rounded">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(incident.createdAt), "HH:mm")}
                </span>
                {getStatusBadge(incident.status)}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1 pl-[38px]">
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                  {incident.severity}
                </Badge>
                {incident.aiPriority && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                    <BrainCircuit className="h-2.5 w-2.5" />
                    {incident.aiPriority}
                  </Badge>
                )}
              </div>
              <ChevronRight className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isSelected ? "translate-x-1 text-primary" : "group-hover:translate-x-1"
              )} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
