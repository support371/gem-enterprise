"use client";

import { useEffect, useRef } from "react";
import type { SupportMessage } from "@/types/support";

interface SupportTranscriptProps {
  messages: SupportMessage[];
  isLoading?: boolean;
}

export function SupportTranscript({ messages, isLoading }: SupportTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6 text-center">
        <p>Accept the terms below to begin your support session.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {messages
        .filter((m) => m.role !== "system")
        .map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: SupportMessage }) {
  const isUser = message.role === "user";
  const time = new Date(message.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
          ${isUser
            ? "bg-primary/20 text-primary border border-primary/30"
            : "bg-muted text-muted-foreground border border-border"
          }`}
      >
        {isUser ? "YOU" : "AI"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
            ${isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "glass-panel rounded-tl-sm text-foreground"
            }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground px-1">{time}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 flex-row">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
        AI
      </div>
      <div className="glass-panel rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
