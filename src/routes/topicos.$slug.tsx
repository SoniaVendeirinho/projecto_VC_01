import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/topicos/$slug")({ component: TopicDetail });

function TopicDetail() {
  const { slug } = useParams({ from: "/topicos/$slug" });
  const [topic, setTopic] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase.from("topics").select("*").eq("slug", slug).maybeSingle();
      if (!t) return;
      setTopic(t);
      const [{ data: chs }, { count }] = await Promise.all([
        supabase.from("chapters").select("*").eq("topic_id", t.id).order("order_index"),
        supabase.from("questions").select("*", { count: "exact", head: true }).eq("topic_id", t.id),
      ]);
      setChapters(chs ?? []);
      setQuestionCount(count ?? 0);
    })();
  }, [slug]);

  if (!topic) return <AppShell><div className="text-muted-foreground">A carregar…</div></AppShell>;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <Link to="/topicos" className="text-xs uppercase tracking-widest text-muted-foreground hover:underline">← Tópicos</Link>
        <h1 className="mt-3 font-serif text-5xl">{topic.title}</h1>
        <p className="mt-3 text-muted-foreground">{topic.description}</p>
        <div className="mt-6 flex gap-3">
          <Link to="/quiz/$topicSlug" params={{ topicSlug: slug }}>
            <Button>Iniciar quiz ({questionCount} perguntas)</Button>
          </Link>
          <Link to="/tutor"><Button variant="outline">Falar com o Tutor IA</Button></Link>
        </div>

        <div className="mt-10 space-y-6">
          {chapters.map((ch, i) => (
            <article key={ch.id} className="rounded-lg border border-border bg-card p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Capítulo {i + 1}</div>
              <h2 className="mt-1 font-serif text-2xl">{ch.title}</h2>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {ch.content_md}
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
