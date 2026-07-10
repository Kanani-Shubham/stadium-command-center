import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({ 
  onMenuClick,
  title
}: { 
  onMenuClick: () => void;
  title: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-6 shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            OP
          </div>
        </div>
      </div>
    </header>
  );
}
