import React from "react";
import type { GateCrowdData } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface GateHeatmapProps {
  gates: GateCrowdData[];
}

export function GateHeatmap({ gates }: GateHeatmapProps) {
  // Group gates by section (e.g. North, South, East, West)
  const sections = Array.from(new Set(gates.map(g => g.section))).sort();

  const getStatusColor = (status: GateCrowdData["status"]) => {
    switch (status) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "congested": return "bg-amber-500 text-white";
      case "closed": return "bg-muted text-muted-foreground";
      case "open": default: return "bg-emerald-500 text-white";
    }
  };

  const getDensityOpacity = (density: number) => {
    if (density < 0.2) return 0.2;
    if (density < 0.4) return 0.4;
    if (density < 0.6) return 0.6;
    if (density < 0.8) return 0.8;
    return 1;
  };

  return (
    <div className="space-y-8">
      {sections.map(section => {
        const sectionGates = gates.filter(g => g.section === section);
        
        return (
          <div key={section} className="space-y-3">
            <h3 className="text-sm font-semibold tracking-tight border-b pb-1">{section} Section</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {sectionGates.map(gate => (
                <div 
                  key={gate.id}
                  className="flex flex-col border rounded-lg overflow-hidden bg-card shadow-sm hover-elevate transition-all"
                >
                  <div className="p-2.5 flex justify-between items-center border-b bg-muted/20">
                    <span className="font-semibold text-sm truncate" title={gate.name}>{gate.name}</span>
                    <div className={cn("h-2.5 w-2.5 rounded-full", getStatusColor(gate.status).split(" ")[0])} />
                  </div>
                  
                  <div className="p-3 relative overflow-hidden flex flex-col gap-3 flex-1">
                    <div 
                      className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out bg-primary/10" 
                      style={{ height: `${gate.density * 100}%` }}
                    />
                    
                    <div className="relative z-10 flex justify-between items-end">
                      <div className="text-xs text-muted-foreground">Density</div>
                      <div className="font-mono text-sm font-medium">{(gate.density * 100).toFixed(0)}%</div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Wait time</span>
                        <span className={cn(
                          "font-mono font-medium",
                          gate.waitMinutes > 15 ? "text-destructive" : gate.waitMinutes > 10 ? "text-amber-500" : ""
                        )}>
                          {gate.waitMinutes}m
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all rounded-full",
                            gate.waitMinutes > 15 ? "bg-destructive" : gate.waitMinutes > 10 ? "bg-amber-500" : "bg-primary"
                          )}
                          style={{ width: `${Math.min((gate.waitMinutes / 20) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
