"use client";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Send, Bot, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const suggestions = [
  { id: "sug-1", text: "Optimize my resume for ATS", icon: "📄" },
  { id: "sug-2", text: "Best companies to apply this week", icon: "🏢" },
  { id: "sug-3", text: "Interview prep for Amazon", icon: "🎯" },
];

type Message = { role: "user" | "ai"; text: string };

const initialMessages: Message[] = [
  {
    role: "ai",
    text: "Hi Alex! 👋 I'm your AI career coach. You've applied to **342 jobs** this month — great momentum! Based on your profile, I suggest focusing on **Senior SWE roles at Series-B startups** for the best response rate. What can I help you with?",
  },
];

export function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  // useRef: access DOM input element for focus management
  const inputRef = useRef<HTMLInputElement>(null);
  // FIX: useRef for message scroll container — auto-scroll to bottom when new messages appear
  const scrollRef = useRef<HTMLDivElement>(null);

  // FIX: scroll to bottom whenever messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: msg },
      {
        role: "ai",
        text: `Great question! Based on your activity, here's what I recommend for "${msg}" — I'll analyze your application data and provide personalized insights to boost your success rate. 🚀`,
      },
    ]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <Card id="ai-assistant" className="shadow-card border-border/60 overflow-hidden">
      {/* Header with gradient */}
      <div className="gradient-brand px-4 py-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold text-white">AI Career Coach</CardTitle>
          <p className="text-[10px] text-white/70">Powered by Career OS AI</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-white/80">Online</span>
        </div>
      </div>

      <CardContent className="p-0">
        {/* FIX: Messages — scrollRef attached so new messages auto-scroll into view */}
        <div ref={scrollRef} className="p-3 space-y-2 max-h-40 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn("flex gap-2 items-start", msg.role === "user" && "flex-row-reverse")}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  msg.role === "ai"
                    ? "gradient-brand"
                    : "bg-muted border border-border"
                )}
              >
                {msg.role === "ai" ? (
                  <Bot className="w-3 h-3 text-white" />
                ) : (
                  <User className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-xl px-3 py-2 text-[11px] leading-relaxed max-w-[85%]",
                  msg.role === "ai"
                    ? "bg-muted text-foreground"
                    : "gradient-brand text-white"
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick suggestions */}
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {suggestions.map((s) => (
            <button
              key={s.id}
              id={s.id}
              onClick={() => handleSend(s.text)}
              className="text-[10px] bg-muted hover:bg-accent text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg transition-colors border border-border/60"
            >
              {s.icon} {s.text}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-3 pb-3 flex gap-2">
          <Input
            ref={inputRef}
            id="ai-input"
            placeholder="Ask your career coach..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="h-8 text-xs rounded-xl bg-muted border-transparent"
          />
          <Button
            id="ai-send-btn"
            size="sm"
            onClick={() => handleSend()}
            className="h-8 w-8 p-0 gradient-brand text-white border-none rounded-xl shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
