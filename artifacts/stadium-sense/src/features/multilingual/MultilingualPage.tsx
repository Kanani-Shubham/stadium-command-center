import React, { useState } from "react";
import { useAiTranslate } from "@workspace/api-client-react";
import type { TranslationInputTargetLanguage } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Languages, ArrowRightLeft, Copy, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español (Spanish)" },
  { value: "fr", label: "Français (French)" },
  { value: "pt", label: "Português (Portuguese)" },
  { value: "ar", label: "العربية (Arabic)" },
  { value: "hi", label: "हिन्दी (Hindi)" },
];

export default function MultilingualPage() {
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<TranslationInputTargetLanguage>("es");
  const [copied, setCopied] = useState(false);
  
  const { toast } = useToast();
  const translateMutation = useAiTranslate();

  const handleTranslate = () => {
    if (!text.trim()) return;
    translateMutation.mutate({
      data: {
        text,
        targetLanguage
      }
    });
  };

  const handleCopy = () => {
    if (translateMutation.data?.translatedText) {
      navigator.clipboard.writeText(translateMutation.data.translatedText);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Translation ready to be shared with the fan.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Multilingual AI Assistant</h2>
        <p className="text-muted-foreground text-sm">Instantly translate announcements, directions, and fan questions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        <Card className="shadow-sm h-full flex flex-col border-border hover-elevate transition-all">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Source Text (Auto-detect)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <Textarea 
              placeholder="Type or paste text from a fan here..."
              className="flex-1 min-h-[250px] border-0 focus-visible:ring-0 rounded-none resize-none p-6 text-lg bg-transparent"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col items-center justify-center gap-4 py-8 lg:py-0 self-center">
          <div className="bg-muted rounded-full p-3 text-muted-foreground shadow-sm">
            <ArrowRightLeft className="h-5 w-5 lg:rotate-0 rotate-90" />
          </div>
          <Button 
            size="lg" 
            className="w-full lg:w-auto shadow-sm"
            onClick={handleTranslate}
            disabled={!text.trim() || translateMutation.isPending}
          >
            {translateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Translate
          </Button>
        </div>

        <Card className="shadow-sm h-full flex flex-col border-primary/20 bg-primary/5 hover-elevate transition-all">
          <CardHeader className="bg-primary/10 border-b border-primary/10 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Target Language
              </CardTitle>
              <Select value={targetLanguage} onValueChange={(val: any) => setTargetLanguage(val)}>
                <SelectTrigger className="w-[180px] h-8 bg-background border-primary/20">
                  <SelectValue placeholder="Select Language" />
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
          </CardHeader>
          <CardContent className="p-0 flex-1 relative min-h-[250px]">
            {translateMutation.isPending ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-primary/60 bg-background/50 backdrop-blur-sm z-10">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <span className="text-sm font-medium">Groq AI is processing...</span>
              </div>
            ) : null}
            
            <div dir={targetLanguage === 'ar' ? 'rtl' : 'ltr'} className="p-6 text-lg leading-relaxed text-foreground whitespace-pre-wrap">
              {translateMutation.data ? (
                translateMutation.data.translatedText
              ) : (
                <span className="text-muted-foreground/50 italic text-base flex items-center h-full justify-center text-center">
                  Translation will appear here.<br/>Ready to communicate with global fans.
                </span>
              )}
            </div>

            {translateMutation.data && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {translateMutation.data.detectedSourceLanguage && (
                  <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-md border shadow-sm mr-2">
                    Detected: {translateMutation.data.detectedSourceLanguage}
                  </span>
                )}
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="shadow-sm" 
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
