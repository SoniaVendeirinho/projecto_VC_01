import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/topicos")({ component: Topicos });

function Topicos() {
  const [topics, setTopics] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("topics").select("*").order("order_index").then(({ data }) => setTopics(data ?? []));
  }, []);
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Programa</p>
        <h1 className="font-serif text-4xl">Tópicos de Economia A</h1>
        <p className="mt-2 text-muted-foreground">8 áreas estruturadas segundo o programa do Ministério da Educação.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((t, i) => (
            <Link key={t.id} to="/topicos/$slug" params={{ slug: t.slug }}
              className="group rounded-lg border border-border bg-card p-6 transition-colors hover:bg-secondary">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Tópico {i + 1}</div>
              <div className="mt-2 font-serif text-2xl">{t.title}</div>
              <p className="mt-3 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-4 text-xs underline-offset-4 group-hover:underline">Estudar →</div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
