import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pergunta, respostaModelo, respostaAluno } = await req.json();
    if (!pergunta || !respostaModelo || !respostaAluno) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios em falta" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "LOVABLE_API_KEY em falta" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const prompt = `És um corretor de Economia A, segundo critérios IAVE. Avalia a resposta do aluno em Português de Portugal.

PERGUNTA: ${pergunta}

RESPOSTA-TIPO (referência IAVE): ${respostaModelo}

RESPOSTA DO ALUNO: ${respostaAluno}

Responde SOMENTE em JSON válido com este formato exato:
{"correta": true|false, "feedback": "explicação curta em Português de Portugal, máx 2 frases, indicando o que está bem ou em falta"}

Considera "correta": true se a resposta cobre os pontos essenciais da resposta-tipo, mesmo com palavras diferentes.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (r.status === 429) return new Response(JSON.stringify({ correta: false, feedback: "Limite de pedidos atingido. Tenta novamente." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ correta: false, feedback: "Créditos IA esgotados." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) {
      const txt = await r.text();
      return new Response(JSON.stringify({ error: "Erro IA", detail: txt }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const j = await r.json();
    const content = j?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { correta: false, feedback: content.slice(0, 300) }; }
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
