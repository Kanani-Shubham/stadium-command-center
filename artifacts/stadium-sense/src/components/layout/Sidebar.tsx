import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Bot, 
  Users, 
  Navigation, 
  Languages, 
  Accessibility, 
  Truck, 
  AlertTriangle,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/copilot", label: "AI Copilot", icon: Bot },
  { href: "/crowd", label: "Crowd Intelligence", icon: Users },
  { href: "/navigation", label: "Smart Navigation", icon: Navigation },
  { href: "/multilingual", label: "Multilingual", icon: Languages },
  { href: "/accessibility", label: "Accessibility", icon: Accessibility },
  { href: "/transportation", label: "Transportation", icon: Truck },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
];

export function Sidebar({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void 
}) {
  const [location] = useLocation();

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-sidebar-primary-foreground">
              StadiumSense AI
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/70">
              FIFA WC 2026
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label="Sidebar">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
