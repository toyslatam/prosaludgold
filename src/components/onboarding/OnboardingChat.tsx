import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import { Send, Bot, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "./useOnboardingAgent";

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  isSimulated?: boolean;
  onSend: (text: string) => void;
}

function renderMarkdown(text: string) {
  const withTags = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
  return DOMPurify.sanitize(withTags, { ALLOWED_TAGS: ["strong", "br"] });
}

export function OnboardingChat({ messages, isLoading, isSimulated, onSend }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {isSimulated && (
        <div
          className="flex items-center gap-2 px-4 py-2 text-xs shrink-0"
          style={{ background: "rgba(234,179,8,0.12)", color: "rgba(253,224,71,0.9)" }}
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Asistente IA no disponible ahora mismo — respondiendo en modo guiado sin conexión.</span>
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(45,212,191,0.2)" }}>
                  <Bot className="w-4 h-4 text-teal-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "rounded-tl-sm"
                    : "rounded-tr-sm text-white"
                }`}
                style={
                  msg.role === "assistant"
                    ? { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.9)" }
                    : { background: "rgba(45,212,191,0.25)", border: "1px solid rgba(45,212,191,0.3)" }
                }
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(45,212,191,0.2)" }}>
              <Bot className="w-4 h-4 text-teal-400" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-teal-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 px-4 pb-4 pt-2 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu respuesta..."
          disabled={isLoading}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(45,212,191,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          size="icon"
          className="rounded-xl w-10 h-10 shrink-0 bg-teal-600 hover:bg-teal-500 disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
