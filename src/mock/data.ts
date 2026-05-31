// Dados mock — usados como fallback de UI enquanto as queries Supabase não
// devolvem dados reais. Eventualmente substituídos por queries à BD.

export type MockTopic = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  color: string;     // var(--accent) tone (token name or hex fallback)
  progress: number;  // 0–100
  lessons: number;
  description: string;
};

export const mockTopics: MockTopic[] = [
  { id: "1", slug: "mercados-precos",       name: "Mercados e Preços",       emoji: "📊", color: "oklch(0.94 0.04 25)",  progress: 68, lessons: 10, description: "Lei da procura, oferta, equilíbrio e elasticidades." },
  { id: "2", slug: "sistema-financeiro",    name: "Sistema Financeiro",      emoji: "🏦", color: "oklch(0.95 0.01 25)",  progress: 40, lessons: 8,  description: "Moeda, bancos, BCE e política monetária." },
  { id: "3", slug: "comercio-internacional",name: "Comércio Internacional",  emoji: "🌍", color: "oklch(0.93 0.035 20)", progress: 22, lessons: 12, description: "Balança comercial, vantagens comparativas, OMC." },
  { id: "4", slug: "crescimento-economico", name: "Crescimento Económico",   emoji: "📈", color: "oklch(0.96 0.015 35)", progress: 100, lessons: 9, description: "PIB, produtividade e desenvolvimento sustentável." },
  { id: "5", slug: "desemprego",            name: "Desemprego",              emoji: "💼", color: "oklch(0.91 0.02 25)",  progress: 55, lessons: 8,  description: "Tipos, causas e política de emprego." },
  { id: "6", slug: "financas-publicas",     name: "Finanças Públicas",       emoji: "🏛️", color: "oklch(0.94 0.025 25)", progress: 58, lessons: 11, description: "Receitas, despesas, défice e dívida pública." },
  { id: "7", slug: "uniao-europeia",        name: "União Europeia",          emoji: "🇪🇺", color: "oklch(0.95 0.02 25)",  progress: 30, lessons: 7,  description: "Integração, mercado único e moeda única." },
  { id: "8", slug: "concorrencia-monopolio",name: "Concorrência e Monopólio",emoji: "⚖️", color: "oklch(0.93 0.03 25)",  progress: 0,  lessons: 7,  description: "Estruturas de mercado e regulação." },
];

export const mockDesempenhoTema = [
  { tema: "Microeconomia",          pct: 82, color: "var(--success)" },
  { tema: "Macroeconomia",          pct: 71, color: "var(--primary)" },
  { tema: "Finanças Públicas",      pct: 58, color: "var(--warning)" },
  { tema: "Comércio Internacional", pct: 44, color: "var(--destructive)" },
];

export const mockLeaderboard = [
  { id: "s1", name: "João Santos",  xp: 3240, eu: false },
  { id: "s2", name: "Ana Costa",    xp: 3010, eu: false },
  { id: "s3", name: "Maria Silva",  xp: 2840, eu: true  },
];

export const mockActivity = [
  { kind: "quiz",   color: "var(--success)",    text: "Quiz Oferta e Procura — 9/10 respostas correctas", xp: 45, when: "Há 2h" },
  { kind: "exam",   color: "var(--primary)",    text: "Simulação parcial — 32/40",                         xp: 80, when: "Ontem" },
  { kind: "tutor",  color: "var(--role-coord)", text: "Conversa com Tutor IA — Inflação",                  xp: 5,  when: "Ontem" },
  { kind: "streak", color: "var(--warning)",    text: "Sequência de 7 dias atingida!",                     xp: 25, when: "Hoje" },
];

export const mockQuestion = {
  id: "q1",
  topic: "Mercados e Preços",
  number: 3,
  total: 10,
  text: "Quando o preço de um bem aumenta, mantendo todos os outros factores constantes, qual é o efeito esperado na quantidade procurada?",
  context: "Considere um mercado em concorrência perfeita, sem intervenção do Estado.",
  options: [
    { letter: "A", text: "A quantidade procurada aumenta, reflectindo a lei da procura inversa." },
    { letter: "B", text: "A quantidade procurada diminui, de acordo com a lei da procura." },
    { letter: "C", text: "A quantidade procurada mantém-se inalterada, pois a procura é perfeitamente inelástica." },
    { letter: "D", text: "A curva da procura desloca-se para a direita, aumentando a quantidade de equilíbrio." },
  ],
  correct: "B",
  explanation: "De acordo com a Lei da Procura, existe uma relação inversa entre o preço de um bem e a quantidade procurada, mantendo constantes os demais factores (ceteris paribus). Quando o preço sobe, os consumidores reduzem a quantidade procurada por efeito substituição e efeito rendimento.",
  xp: 10,
};
