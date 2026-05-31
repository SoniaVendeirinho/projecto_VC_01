import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Send } from "lucide-react";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/tutor")({ component: Tutor });

type Msg = { role: "user" | "assistant"; content: string };

function Tutor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Olá! Sou o teu Tutor IA de Economia A. Em que matéria precisas de ajuda? Posso explicar conceitos, dar exemplos ou ajudar-te a resolver exercícios." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const enviar = async () => {
    if (!input.trim() || loading) return;
    const novas: Msg[] = [...messages, { role: "user", content: input }];
    setMessages(novas);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tutor-ia", {
        body: { messages: novas },
      });
      if (error) throw error;
      setMessages([...novas, { role: "assistant", content: data?.resposta ?? "Desculpa, não consegui responder." }]);
      if (user) {
        await supabase.from("ai_conversations").insert([
          { user_id: user.id, role: "user", content: input },
          { user_id: user.id, role: "assistant", content: data?.resposta ?? "" },
        ]);
      }
    } catch (e: any) {
      setMessages([...novas, { role: "assistant", content: "Erro: " + (e?.message ?? "tenta novamente") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-3xl flex-col">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Assistente</p>
          <h1 className="flex items-center gap-2 font-serif text-3xl"><Sparkles className="h-6 w-6" /> Tutor IA</h1>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-border bg-card p-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-sm text-muted-foreground">A pensar…</div>}
          <div ref={endRef} />
        </div>
        <div className="mt-3 flex gap-2">
          <input className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm"
            placeholder="Escreve a tua dúvida sobre Economia A…"
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()} />
          <Button onClick={enviar} disabled={loading}><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </AppShell>
  );
}
