import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { registarXP } from "@/lib/xp";
import { Timer } from "lucide-react";

export const Route = createFileRoute("/exame")({ component: Exame });

const DURACAO_MIN = 30;

function Exame() {
  const { user, refreshProfile } = useAuth();
  const [iniciado, setIniciado] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [terminado, setTerminado] = useState(false);
  const [score, setScore] = useState(0);
  const [restante, setRestante] = useState(DURACAO_MIN * 60);
  const timerRef = useRef<any>(null);

  const carregar = async () => {
    const { data } = await supabase.from("questions").select("*").eq("is_exam", true).limit(15);
    setQuestions(data ?? []);
    setIniciado(true);
    setRestante(DURACAO_MIN * 60);
  };

  useEffect(() => {
    if (!iniciado || terminado) return;
    timerRef.current = setInterval(() => {
      setRestante((r) => {
        if (r <= 1) { clearInterval(timerRef.current); submeter(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iniciado, terminado]);

  const submeter = async () => {
    clearInterval(timerRef.current);
    let s = 0;
    for (const q of questions) {
      if (q.type === "mcq" && answers[q.id] === q.correct_answer) s++;
    }
    setScore(s);
    setTerminado(true);
    if (user) {
      await supabase.from("exam_attempts").insert({
        user_id: user.id, completed_at: new Date().toISOString(),
        total_score: s, total_questions: questions.length,
        details: answers,
      });
      await registarXP(user.id, s * 5);
      await refreshProfile();
    }
  };

  if (!iniciado) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Modo IAVE</p>
          <h1 className="font-serif text-5xl">Simulação de Exame</h1>
          <p className="mt-4 text-muted-foreground">
            15 perguntas representativas do Exame Nacional de Economia A. Tens {DURACAO_MIN} minutos.
            Não podes pausar.
          </p>
          <Button className="mt-8" size="lg" onClick={carregar}>Começar simulação</Button>
        </div>
      </AppShell>
    );
  }

  if (terminado) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Resultado</p>
          <h1 className="font-serif text-5xl">{score} / {questions.length}</h1>
          <p className="mt-4 text-muted-foreground">{Math.round(score / questions.length * 100)}% de acerto.</p>
          <Button className="mt-6" onClick={() => { setTerminado(false); setIniciado(false); setAnswers({}); }}>Nova simulação</Button>
        </div>
      </AppShell>
    );
  }

  const min = Math.floor(restante / 60);
  const seg = restante % 60;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="sticky top-0 z-10 mb-6 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <h1 className="font-serif text-2xl">Simulação de Exame</h1>
          <div className="flex items-center gap-2 font-mono text-lg">
            <Timer className="h-5 w-5" /> {min}:{seg.toString().padStart(2, "0")}
          </div>
        </div>
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-lg border border-border bg-card p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Pergunta {i + 1}</div>
              <h2 className="mt-1 font-serif text-xl">{q.prompt}</h2>
              {q.type === "mcq" ? (
                <div className="mt-4 space-y-2">
                  {(q.options as string[]).map((opt) => (
                    <label key={opt} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm ${answers[q.id] === opt ? "border-foreground bg-secondary" : "border-border hover:bg-secondary"}`}>
                      <input type="radio" name={q.id} checked={answers[q.id] === opt}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))} />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea className="mt-4 w-full rounded-md border border-border bg-background p-3 text-sm" rows={4}
                  value={answers[q.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
              )}
            </div>
          ))}
          <Button size="lg" className="w-full" onClick={submeter}>Submeter exame</Button>
        </div>
      </div>
    </AppShell>
  );
}
