import React, { useState, useRef, useEffect } from "react";
import { useAiCopilotChat } from "@workspace/api-client-react";
import type { CopilotMessage } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CopilotPage() {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    { role: "assistant", content: "Hello OP. I am StadiumSense Copilot, powered by Groq AI. How can I assist you with operations today?" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatMutation = useAiCopilotChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: CopilotMessage = { role: "user", content: input.trim() };
    const history = [...messages];
    
    setMessages([...history, userMessage]);
    setInput("");

    try {
      const response = await chatMutation.mutateAsync({
        data: { message: userMessage.content, history }
      });
      
      setMessages(prev => [...prev, { role: "assistant", content: response.reply }]);
    } catch (error) {
      // Error handled by mutation toast if configured, or just show a fallback message
      setMessages(prev => [...prev, { role: "assistant", content: "I encountered an error processing your request. Please try again." }]);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <Card className="flex-1 flex flex-col shadow-sm border-border overflow-hidden">
        <CardHeader className="border-b bg-muted/20 py-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Operations Copilot
            <span className="ml-auto flex items-center text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              Powered by Groq
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full px-4 py-6">
            <div ref={scrollRef} className="sr-only" aria-hidden="true" />
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-4",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm",
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-sidebar text-sidebar-foreground"
                  )}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm max-w-[85%] shadow-sm",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted text-foreground rounded-tl-none border border-border/50"
                  )}>
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  </div>
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex gap-4 flex-row">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm bg-sidebar text-sidebar-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 text-sm max-w-[85%] bg-muted text-muted-foreground rounded-tl-none border border-border/50 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Groq AI is processing your request...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="p-4 border-t bg-card">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2 max-w-3xl mx-auto relative">
            <Input
              type="text"
              placeholder="Ask about crowd density, suggest actions for incidents, or request operational data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatMutation.isPending}
              className="flex-1 pr-12 shadow-sm rounded-full bg-muted/50 border-border focus-visible:ring-primary h-12"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || chatMutation.isPending}
              className="absolute right-1.5 h-9 w-9 rounded-full shadow-xs"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
