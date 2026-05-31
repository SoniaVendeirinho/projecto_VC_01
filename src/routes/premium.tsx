import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { Check, Crown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/premium")({ component: Premium });

function Premium() {
  const { profile } = useAuth();
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Subscrição</p>
        <h1 className="flex items-center gap-2 font-serif text-5xl"><Crown className="h-8 w-8" /> Premium</h1>
        <p className="mt-3 text-muted-foreground">Desbloqueia todo o potencial da Economia A Trainer.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Gratuito</div>
            <div className="mt-2 font-serif text-3xl">0 € / mês</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4" /> Todos os tópicos</li>
              <li className="flex gap-2"><Check className="h-4 w-4" /> 5 simulações por mês</li>
              <li className="flex gap-2"><Check className="h-4 w-4" /> Tutor IA limitado</li>
            </ul>
          </div>
          <div className="rounded-lg border-2 border-foreground bg-card p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Premium</div>
            <div className="mt-2 font-serif text-3xl">4,99 € / mês</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2"><Check className="h-4 w-4" /> Simulações ilimitadas</li>
              <li className="flex gap-2"><Check className="h-4 w-4" /> Tutor IA ilimitado</li>
              <li className="flex gap-2"><Check className="h-4 w-4" /> Correção IA de respostas abertas</li>
              <li className="flex gap-2"><Check className="h-4 w-4" /> Estatísticas avançadas</li>
            </ul>
            <Button className="mt-6 w-full" onClick={() => toast.info("Pagamentos em breve. Vai ser ativado via Lovable Cloud.")}>
              {profile?.is_premium ? "Já és Premium" : "Subscrever"}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
