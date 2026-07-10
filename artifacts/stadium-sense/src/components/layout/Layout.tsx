import React, { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const routeTitles: Record<string, string> = {
  "/": "Dashboard Overview",
  "/copilot": "AI Operations Copilot",
  "/crowd": "Crowd Intelligence",
  "/navigation": "Smart Navigation Assistant",
  "/multilingual": "Multilingual AI Assistant",
  "/accessibility": "Accessibility Center",
  "/transportation": "Transportation & Sustainability",
  "/incidents": "Incident Management",
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const title = routeTitles[location] || "StadiumSense AI";

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
