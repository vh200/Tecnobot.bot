import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, fileContent, fileName } = await req.json();
    
    console.log("Received request for file:", fileName);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for sales analysis expert
    const systemPrompt = `Você é um analista de vendas sênior altamente experiente.

DADOS DA PLANILHA:
${fileContent}

INSTRUÇÕES:
- Analise os dados de vendas fornecidos acima com profundidade
- Identifique tendências, padrões, sazonalidades e oportunidades
- Forneça insights claros, estratégicos e acionáveis
- Use linguagem simples e estruturada
- Quando solicitado, gere resumos executivos e sugestões práticas
- Destaque produtos de destaque, regiões mais lucrativas e gargalos
- Seja específico com números e percentuais quando possível
- Forneça recomendações de ações concretas para o time comercial

Responda sempre em português brasileiro de forma profissional e objetiva.`;

    // Prepare messages for Gemini
    const allMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    console.log("Calling Lovable AI Gateway with Gemini 2.5-Pro");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ 
            error: "Limite de requisições excedido. Por favor, tente novamente em alguns instantes." 
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ 
            error: "Créditos insuficientes. Por favor, adicione créditos ao seu workspace Lovable." 
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log("Successfully generated response");

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-spreadsheet function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao processar análise" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
