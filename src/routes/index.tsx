import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BookOpen, Timer, Sparkles, Flame, GraduationCap, Target } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex flex-col leading-none">
          <span className="font-serif text-2xl">Economia A</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Trainer</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Entrar</Button></Link>
          <Link to="/auth"><Button size="sm">Começar</Button></Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-20 md:pt-20">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Preparação para o Exame Nacional · IAVE
        </p>
        <h1 className="font-serif text-5xl leading-[1.05] md:text-7xl">
          Domina <em>Economia A</em>.<br /> Chega ao exame preparado.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Estuda os 8 tópicos do programa, treina com quizzes em formato IAVE,
          simula o exame em condições reais e tira dúvidas com o Tutor IA — tudo num só sítio.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/auth"><Button size="lg">Começar gratuitamente</Button></Link>
          <Link to="/auth"><Button size="lg" variant="outline">Já tenho conta</Button></Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 md:grid-cols-3">
        {[
          { icon: BookOpen, t: "Matéria estruturada", d: "Mercado, Moeda, Inflação, PIB, Desemprego, Estado, UE e Globalização." },
          { icon: Target, t: "Quizzes com feedback imediato", d: "Resposta correta, explicação IAVE e XP por cada pergunta." },
          { icon: Timer, t: "Simulação de exame", d: "Modo cronometrado fiel ao Exame Nacional de Economia A." },
          { icon: Sparkles, t: "Tutor IA em português", d: "Tira dúvidas a qualquer hora, com exemplos do contexto português." },
          { icon: GraduationCap, t: "Correção de respostas abertas", d: "A IA avalia o teu desenvolvimento com critérios tipo IAVE." },
          { icon: Flame, t: "Sequência diária", d: "Mantém a tua streak e progride XP até ao dia do exame." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-lg border border-border bg-card p-6">
            <Icon className="mb-4 h-5 w-5" />
            <h3 className="text-base font-semibold">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Economia A Trainer · feito para alunos do secundário em Portugal
      </footer>
    </div>
  );
}
