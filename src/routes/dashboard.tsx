import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mockTopics, mockDesempenhoTema, mockLeaderboard, mockActivity, type MockTopic } from "@/mock/data";
import { IconArrowRight } from "@tabler/icons-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { profile, user } = useAuth();
  const [attempts, setAttempts] = useState<{ total: number; corretas: number }>({ total: 0, corretas: 0 });
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("is_correct")
        .eq("user_id", user.id);
      setAttempts({
        total: data?.length ?? 0,
        corretas: data?.filter((a: any) => a.is_correct).length ?? 0,
      });
      setCompleted(mockTopics.filter((t) => t.progress === 100).length);
    })();
  }, [user]);

  const xp = profile?.xp ?? 2840;
  const acerto = attempts.total
    ? Math.round((attempts.corretas / attempts.total) * 100)
    : 74;
  const studyHours = 24;

  const inProgress: MockTopic[] = mockTopics
    .filter((t) => t.progress > 0 && t.progress < 100)
    .slice(0, 3);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Métricas — bento de 4 */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
          <Metric label="XP Total"          value={fmt(xp)}                 sub="↑ +120 esta semana" />
          <Metric label="Tópicos Completos" value={`${completed} / ${mockTopics.length}`} sub={`${Math.round(completed / mockTopics.length * 100)}% concluídos`} />
          <Metric label="Média Quizzes"     value={`${acerto}%`}            sub="Última semana" />
          <Metric label="Tempo de Estudo"   value={`${studyHours}h`}        sub="Neste mês" />
        </section>

        {/* 2 colunas */}
        <section className="grid gap-4 lg:grid-cols-[1fr_360px] animate-fade-in-up">
          {/* Continuar a estudar */}
          <CardSurface>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Continuar a Estudar</h2>
              <Link to="/topicos" className="text-[12px] text-primary hover:underline inline-flex items-center gap-1">
                Ver todos <IconArrowRight size={14} />
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {inProgress.map((t) => (
                <li key={t.id}>
                  <Link
                    to="/topicos/$slug"
                    params={{ slug: t.slug }}
                    className="flex items-center gap-4 py-3 hover:bg-secondary/50 -mx-2 px-2 rounded-md transition-colors"
                  >
                    <div
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xl"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{t.description}</div>
                      <Progress value={t.progress} className="mt-2" />
                    </div>
                    <div className="text-[12px] font-medium tabular-nums w-10 text-right">
                      {t.progress}%
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardSurface>

          <div className="space-y-4">
            {/* Desempenho por tema */}
            <CardSurface>
              <h2 className="text-[15px] font-semibold">Desempenho por Tema</h2>
              <ul className="mt-4 space-y-3">
                {mockDesempenhoTema.map((d) => (
                  <li key={d.tema}>
                    <div className="flex items-center justify-between text-[12px]">
                      <span>{d.tema}</span>
                      <span className="font-medium tabular-nums" style={{ color: d.color }}>{d.pct}%</span>
                    </div>
                    <Progress value={d.pct} color={d.color} className="mt-1" />
                  </li>
                ))}
              </ul>
            </CardSurface>

            {/* Top turma */}
            <CardSurface>
              <h2 className="text-[15px] font-semibold">Top Turma</h2>
              <ul className="mt-3 space-y-1">
                {mockLeaderboard.map((p, i) => (
                  <li
                    key={p.id}
                    className={
                      "flex items-center gap-3 rounded-md px-2 py-2 " +
                      (p.eu ? "bg-primary/10" : "")
                    }
                  >
                    <div className="w-4 text-[11px] text-muted-foreground tabular-nums">{i + 1}</div>
                    <div
                      className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: p.eu ? "var(--role-coord)" : "var(--role-student)" }}
                    >
                      {p.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </div>
                    <div className="text-[12px] flex-1 truncate">{p.name}</div>
                    <div className="text-[12px] tabular-nums font-medium">{fmt(p.xp)} XP</div>
                  </li>
                ))}
              </ul>
            </CardSurface>
          </div>
        </section>

        {/* Atividade recente */}
        <section className="animate-fade-in-up">
          <CardSurface>
            <h2 className="text-[15px] font-semibold">Actividade Recente</h2>
            <ul className="mt-3 divide-y divide-border">
              {mockActivity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
                  <div className="flex-1 text-[13px] truncate">{a.text}</div>
                  <span
                    className="rounded-full bg-[oklch(0.94_0.07_165)] px-2.5 py-0.5 text-[11px] font-medium"
                    style={{ color: "var(--success)" }}
                  >
                    +{a.xp} XP
                  </span>
                  <span className="text-[11px] text-muted-foreground w-14 text-right">{a.when}</span>
                </li>
              ))}
            </ul>
          </CardSurface>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-secondary px-5 py-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-[28px] leading-tight">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function CardSurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {children}
    </div>
  );
}

function Progress({ value, color, className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={"h-1.5 w-full rounded-full bg-secondary " + (className ?? "")}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, value)}%`, backgroundColor: color ?? "var(--primary)" }}
      />
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("pt-PT");
}
