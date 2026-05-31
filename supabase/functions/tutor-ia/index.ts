import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `És o Tutor IA da Economia A Trainer, uma plataforma portuguesa de preparação para o Exame Nacional de Economia A do 11.º ano em Portugal.

Regras obrigatórias:
- Responde SEMPRE em Português de Portugal (jamais usar formas brasileiras como "você", "ônibus", "fato" no sentido brasileiro, "trem", etc.).
- Usa terminologia oficial portuguesa: IAVE, INE, Banco de Portugal, Assembleia da República, Orçamento do Estado, IRS, IRC, IVA, BCE.
- Cinge-te ao programa: Mercado, Moeda, Inflação, PIB, Desemprego, Estado, União Europeia, Globalização.
- Tom: formal mas acessível, como um professor do secundário.
- Sempre que possível, dá exemplos do contexto económico português.
- Quando apropriado, indica como o tema costuma ser cobrado no exame IAVE.
- Sê conciso (máximo 250 palavras por resposta), exceto se o aluno pedir explicação detalhada.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY em falta" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM }, ...messages],
      }),
    });

    if (r.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de pedidos atingido. Tenta novamente em breve." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (r.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos esgotados. Contacta o administrador." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!r.ok) {
      const txt = await r.text();
      return new Response(JSON.stringify({ error: "Erro IA", detail: txt }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const j = await r.json();
    const resposta = j?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ resposta }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
