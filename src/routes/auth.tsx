import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IconBolt, IconTargetArrow, IconAward } from "@tabler/icons-react";

export const Route = createFileRoute("/auth")({ component: AuthPage });

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async () => {
    if (loading) return;
    if (!email || !password) return toast.error("Preenche o email e a palavra-passe.");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password.length < 8) { toast.error("A palavra-passe precisa de pelo menos 8 caracteres."); return; }
        if (password !== password2) { toast.error("As palavras-passe não coincidem."); return; }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: fullName, full_name: fullName },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) return toast.error(error.message);
        toast.success("Conta criada. Bem-vindo(a)!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return toast.error("Credenciais inválidas.");
        toast.success("Sessão iniciada.");
      }
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background grid lg:grid-cols-[40%_60%]">
      {/* Painel esquerdo */}
      <aside className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-foreground text-primary font-serif text-xl">€</div>
          <div className="leading-tight">
            <div className="text-lg font-bold tracking-tight">Economia A</div>
            <div className="text-[11px] uppercase tracking-[0.2em] opacity-80">Trainer</div>
          </div>
        </div>

        <div className="max-w-md">
          <h2 className="font-serif text-4xl leading-tight">
            Prepara-te para o Exame Nacional de Economia A
          </h2>
          <ul className="mt-10 space-y-5">
            <Benefit icon={<IconTargetArrow size={20} />} title="Questões IAVE" desc="Conteúdos alinhados com o programa oficial e os critérios IAVE." />
            <Benefit icon={<IconBolt size={20} />} title="Tutor IA em Português" desc="Tira dúvidas a qualquer hora, com exemplos do contexto português." />
            <Benefit icon={<IconAward size={20} />} title="Simulação cronometrada" desc="Treina em condições reais de exame, com correção automática." />
          </ul>
        </div>

        <div className="text-[11px] opacity-70">© 2026 Economia A Trainer</div>
      </aside>

      {/* Painel direito */}
      <main className="flex items-center justify-center px-6 py-10 md:px-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground font-serif text-xl">€</div>
            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight">Economia A</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Trainer</div>
            </div>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl">
            {mode === "signin" ? "Bem-vindo(a) de volta" : "Cria a tua conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Acede à tua preparação para o Exame Nacional."
              : "Em menos de 1 minuto começas a treinar."}
          </p>

          {/* Tabs */}
          <div className="mt-8 inline-flex rounded-lg bg-secondary p-1">
            <TabButton active={mode === "signin"} onClick={() => setMode("signin")}>Entrar</TabButton>
            <TabButton active={mode === "signup"} onClick={() => setMode("signup")}>Registar</TabButton>
          </div>

          <div className="mt-6 space-y-4">
            {mode === "signup" && (
              <Field label="Nome completo">
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Maria Silva" />
              </Field>
            )}
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="o.teu@email.pt" autoComplete="email" />
            </Field>
            <Field label="Palavra-passe">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} />
            </Field>
            {mode === "signup" && (
              <Field label="Confirmar palavra-passe">
                <Input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} autoComplete="new-password" />
              </Field>
            )}

            <Button onClick={submit} disabled={loading} className="w-full h-11">
              {loading ? "A processar…" : mode === "signin" ? "Entrar" : "Criar conta"}
            </Button>

            {mode === "signin" ? (
              <button className="text-[13px] text-muted-foreground hover:text-foreground" onClick={() => toast.info("Em breve.")}>
                Esqueci a palavra-passe
              </button>
            ) : (
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Ao registar, o papel inicial é <strong className="text-foreground">Aluno</strong>.
                A coordenação da tua escola pode alterar o papel mais tarde.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-1.5 text-[13px] rounded-md transition-colors " +
        (active ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Benefit({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <li className="flex gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-foreground/15 text-primary-foreground">
        {icon}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-[13px] opacity-80">{desc}</div>
      </div>
    </li>
  );
}
