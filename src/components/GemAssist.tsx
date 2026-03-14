import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, ArrowRight, Zap, Shield, AlertTriangle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gem-assist`;

const quickActions = [
  { label: "Services", message: "Tell me about your security services.", icon: Shield },
  { label: "Recovery", message: "How does asset recovery work?", icon: Zap },
  { label: "Pricing", message: "What are your pricing plans?", icon: AlertTriangle },
  { label: "Live Agent", message: "I'd like to speak with a security expert directly.", icon: Phone },
];

export const GemAssist = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const streamChat = useCallback(async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${resp.status}`);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat([...messages, userMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to Gem-Assist",
      });
      setMessages((prev) => prev.filter((m) => m !== userMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (action.label === "Live Agent") {
      setIsOpen(false);
      window.location.href = "/contact";
      return;
    }
    handleSend(action.message);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "glass-panel rounded-2xl px-4 py-3 border border-primary/20",
          "flex items-center gap-3",
          "hover:border-primary/40 hover:glow-cyan transition-all",
          isOpen && "hidden"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Open GEM AI Assistant"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse border-2 border-background" />
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-sm font-semibold text-foreground block">GEM AI Assistant</span>
          <span className="text-xs text-success flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            ARIA • Enterprise Support
          </span>
        </div>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)]",
              "h-[600px] max-h-[calc(100vh-120px)]",
              "glass-panel rounded-2xl overflow-hidden flex flex-col",
              "border border-border shadow-2xl backdrop-blur-xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/80">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-card" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">GEM AI Assistant</h3>
                  <p className="text-xs text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    ARIA • GEM Enterprise
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="py-4">
                  {/* Welcome Card */}
                  <div className="glass-panel rounded-xl p-4 mb-4 border border-primary/10">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">Enterprise AI Support</h4>
                        <p className="text-xs text-muted-foreground">Powered by ARIA</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/90 mb-1">
                      Hello! I'm ARIA, your GEM Enterprise AI assistant. I'm here to help with cybersecurity, real estate, and any questions about our services.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      How can I assist you today?
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-2">02:23 PM</p>
                  </div>
                  
                  {/* Quick Action Chips */}
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium glass-panel text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all border border-transparent"
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      message.role === "user"
                        ? "bg-secondary"
                        : "bg-primary/10"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-4 py-2.5 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-xl px-4 py-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card/80">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
                <Button
                  variant="hero"
                  size="icon"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="shrink-0 h-12 w-12"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Connect to Live Agent */}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground/60">
                  Connecting you to a live agent...
                </p>
                <Button variant="ghost" size="sm" asChild className="text-xs text-primary">
                  <Link to="/contact">Connect Now</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
