import React, { useState } from "react";
import { useAiNavigation } from "@workspace/api-client-react";
import type { NavigationQueryInputLanguage } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation, MapPin, Search, Loader2, Map as MapIcon, Compass } from "lucide-react";
import { useDebounce } from "@/lib/use-debounce";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
  { value: "ar", label: "العربية" },
  { value: "hi", label: "हिन्दी" },
];

export default function NavigationPage() {
  const [query, setQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState("Gate A");
  const [language, setLanguage] = useState<NavigationQueryInputLanguage>("en");
  
  const navigationMutation = useAiNavigation();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || navigationMutation.isPending) return;

    try {
      await navigationMutation.mutateAsync({
        data: {
          query,
          currentLocation: currentLocation || undefined,
          language
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Smart Navigation Assistant</h2>
        <p className="text-muted-foreground text-sm">Help fans find their way in their preferred language.</p>
      </div>

      <Card className="shadow-sm border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <Compass className="h-5 w-5" />
            Query Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Current Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="e.g. Section 112, Gate B, or null"
                    className="pl-9 bg-background"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Response Language</label>
                <Select value={language} onValueChange={(val: NavigationQueryInputLanguage) => setLanguage(val)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-foreground">Where does the fan want to go?</label>
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="e.g. Where is the nearest restroom? or How do I get to VIP lounge?"
                  className="pl-10 pr-24 py-6 text-base bg-background shadow-inner-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 h-10 px-4"
                  disabled={!query.trim() || navigationMutation.isPending}
                >
                  {navigationMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {navigationMutation.isPending && (
        <Card className="shadow-sm animate-pulse border-border">
          <CardContent className="p-8 flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Groq AI is processing route instructions...</p>
          </CardContent>
        </Card>
      )}

      {navigationMutation.data && !navigationMutation.isPending && (
        <Card className="shadow-md border-border overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-muted p-4 border-b flex items-start gap-4">
            <div className="bg-background p-2 rounded shadow-sm">
              <Navigation className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{navigationMutation.data.nearestLocation || "Destination Found"}</h3>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-1">
                <MapIcon className="h-3.5 w-3.5" />
                Estimated walk: <span className="font-medium text-foreground">{navigationMutation.data.estimatedWalkMinutes || "??"} mins</span>
              </p>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Answer</h4>
              <p className="text-lg leading-relaxed text-foreground bg-primary/5 p-4 rounded-lg border border-primary/10">
                {navigationMutation.data.answer}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Step-by-step Directions</h4>
              <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:w-0.5 before:bg-border md:before:mx-auto md:before:translate-x-0">
                {navigationMutation.data.directions.map((step: string, i: number) => (
                  <div key={i} className="relative flex items-center">
                    <div className="absolute left-[-24px] flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary shadow-sm z-10 text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <div className="ml-2 text-sm md:text-base leading-snug">
                      {step}
                    </div>
                  </div>
                ))}
                <div className="relative flex items-center pt-2">
                   <div className="absolute left-[-20px] flex h-4 w-4 items-center justify-center rounded-full bg-primary z-10">
                     <div className="h-1.5 w-1.5 rounded-full bg-background" />
                   </div>
                   <div className="ml-2 text-sm font-medium text-primary">Arrive at destination</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
