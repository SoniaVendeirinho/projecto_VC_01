import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const { isAdmin, loading } = useAuth();
  const [stats, setStats] = useState({ users: 0, attempts: 0, exams: 0 });
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [{ count: u }, { count: a }, { count: e }, { data: profs }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("quiz_attempts").select("*", { count: "exact", head: true }),
        supabase.from("exam_attempts").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*").order("xp", { ascending: false }).limit(20),
      ]);
      setStats({ users: u ?? 0, attempts: a ?? 0, exams: e ?? 0 });
      setUsers(profs ?? []);
    })();
  }, [isAdmin]);

  if (loading) return <AppShell><div /></AppShell>;
  if (!isAdmin) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-serif text-3xl">Acesso restrito</h1>
          <p className="mt-2 text-muted-foreground">Esta secção é apenas para administradores.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-sm underline">Voltar ao painel</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Gestão</p>
        <h1 className="font-serif text-4xl">Painel de Administração</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat label="Utilizadores" value={stats.users} />
          <Stat label="Respostas a quizzes" value={stats.attempts} />
          <Stat label="Simulações de exame" value={stats.exams} />
        </div>
        <div className="mt-10">
          <h2 className="font-serif text-2xl">Top alunos (XP)</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr><th className="p-3">Aluno</th><th className="p-3">XP</th><th className="p-3">Sequência</th><th className="p-3">Premium</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="p-3">{u.display_name ?? "—"}</td>
                    <td className="p-3">{u.xp}</td>
                    <td className="p-3">{u.current_streak}</td>
                    <td className="p-3">{u.is_premium ? "Sim" : "Não"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-4xl">{value}</div>
    </div>
  );
}
