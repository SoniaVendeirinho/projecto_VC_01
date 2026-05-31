import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { registarXP } from "@/lib/xp";
import { toast } from "sonner";
import { Check, X, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/quiz/$topicSlug")({ component: Quiz });

function Quiz() {
  const { topicSlug } = useParams({ from: "/quiz/$topicSlug" });
  const { user, refreshProfile } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase.from("topics").select("id").eq("slug", topicSlug).maybeSingle();
      if (!t) return;
      const { data } = await supabase.from("questions").select("*").eq("topic_id", t.id).order("difficulty");
      setQuestions(data ?? []);
    })();
  }, [topicSlug]);

  if (!questions.length) {
    return <AppShell><div className="text-muted-foreground">A carregar perguntas…</div></AppShell>;
  }

  const q = questions[idx];
  const finished = idx >= questions.length;

  const submeter = async () => {
    if (!answer.trim()) return toast.error("Escreve uma resposta");
    if (q.type === "mcq") {
      const ok = answer === q.correct_answer;
      setCorrect(ok);
      setRevealed(true);
      if (ok) setScore((s) => s + 1);
      if (user) {
        await supabase.from("quiz_attempts").insert({
          user_id: user.id, question_id: q.id, given_answer: answer, is_correct: ok, xp_earned: ok ? 10 : 2,
        });
        await registarXP(user.id, ok ? 10 : 2);
      }
    } else {
      setAiLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("corrigir-resposta", {
          body: { pergunta: q.prompt, respostaModelo: q.correct_answer, respostaAluno: answer },
        });
        if (error) throw error;
        const ok = !!data?.correta;
        setCorrect(ok);
        setAiFeedback(data?.feedback ?? "");
        setRevealed(true);
        if (ok) setScore((s) => s + 1);
        if (user) {
          await supabase.from("quiz_attempts").insert({
            user_id: user.id, question_id: q.id, given_answer: answer, is_correct: ok,
            xp_earned: ok ? 15 : 5, ai_feedback: data?.feedback,
          });
          await registarXP(user.id, ok ? 15 : 5);
        }
      } catch (e: any) {
        toast.error("Erro na correção IA: " + (e?.message ?? ""));
      } finally {
        setAiLoading(false);
      }
    }
  };

  const proxima = async () => {
    setRevealed(false); setAnswer(""); setAiFeedback(null); setCorrect(false);
    setIdx((i) => i + 1);
    await refreshProfile();
  };

  if (finished) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Concluído</p>
          <h1 className="font-serif text-5xl">Quiz terminado</h1>
          <p className="mt-4 text-lg">Acertaste {score} de {questions.length} ({Math.round(score / questions.length * 100)}%)</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/topicos"><Button variant="outline">Ver tópicos</Button></Link>
            <Link to="/dashboard"><Button>Voltar ao painel</Button></Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
          <span>Pergunta {idx + 1} de {questions.length}</span>
          <span>{q.type === "mcq" ? "Escolha múltipla" : "Resposta aberta"} · dif. {q.difficulty}</span>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif text-2xl leading-snug">{q.prompt}</h2>

          {q.type === "mcq" ? (
            <div className="mt-6 space-y-2">
              {(q.options as string[]).map((opt) => {
                const selected = answer === opt;
                const isRight = revealed && opt === q.correct_answer;
                const isWrong = revealed && selected && opt !== q.correct_answer;
                return (
                  <button key={opt} disabled={revealed}
                    onClick={() => setAnswer(opt)}
                    className={`w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                      isRight ? "border-green-700 bg-green-50" :
                      isWrong ? "border-red-700 bg-red-50" :
                      selected ? "border-foreground bg-secondary" : "border-border hover:bg-secondary"
                    }`}>
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <Textarea className="mt-6 min-h-32" disabled={revealed} placeholder="Desenvolve a tua resposta…"
              value={answer} onChange={(e) => setAnswer(e.target.value)} />
          )}

          {revealed && (
            <div className={`mt-6 rounded-md border p-4 text-sm ${correct ? "border-green-700 bg-green-50" : "border-red-700 bg-red-50"}`}>
              <div className="flex items-center gap-2 font-semibold">
                {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                {correct ? "Correto" : "Incorreto"}
              </div>
              {q.type === "open" && aiFeedback && (
                <p className="mt-2 flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" /> {aiFeedback}</p>
              )}
              <p className="mt-3"><strong>Resposta-tipo:</strong> {q.correct_answer}</p>
              {q.explanation && <p className="mt-2 text-muted-foreground">{q.explanation}</p>}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            {!revealed ? (
              <Button onClick={submeter} disabled={aiLoading}>{aiLoading ? "A corrigir…" : "Submeter"}</Button>
            ) : (
              <Button onClick={proxima}>Próxima</Button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
