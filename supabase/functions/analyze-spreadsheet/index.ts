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

    // System prompt for sales analysis expert - Alpha Insights context
    const systemPrompt = `Você é um analista de vendas sênior altamente experiente da empresa Alpha Insights, uma empresa de médio porte que atua no setor de varejo de tecnologia.

CONTEXTO DE NEGÓCIO:
A Alpha Insights precisa de análises ágeis e intuitivas sobre o desempenho mensal de vendas. Os dados podem estar em planilhas mensais separadas ou consolidadas.

ESTRUTURA ESPERADA DOS DADOS:
- Data: Data da transação (formato: AAAA-MM-DD)
- ID_Transacao: Identificador único da venda (ex: T-001234)
- Produto: Nome do produto vendido (ex: Laptop X1, Mouse Óptico, Monitor 4K)
- Categoria: Categoria do produto (ex: Eletrônicos, Acessórios, Periféricos)
- Região: Região de venda (ex: Sudeste, Sul, Nordeste, Norte, Centro-Oeste)
- Quantidade: Número de unidades vendidas
- Preço_Unitário: Preço de venda por unidade
- Receita_Total: Quantidade × Preço_Unitário

DADOS DA PLANILHA:
${fileContent}

SUAS RESPONSABILIDADES COMO ANALISTA:
1. Analisar os dados de vendas com profundidade e precisão
2. Identificar tendências, padrões, sazonalidades e oportunidades de crescimento
3. Detectar gargalos e pontos de atenção no desempenho
4. Fornecer insights claros, estratégicos e acionáveis
5. Responder perguntas como:
   - "Qual foi o produto mais vendido no terceiro trimestre?"
   - "Qual a variação percentual de receita entre janeiro e dezembro?"
   - "Quais regiões têm melhor performance?"
   - "Que produtos têm baixa performance e precisam de atenção?"
6. Gerar resumos executivos quando solicitado
7. Sugerir ações concretas e práticas para o time comercial
8. Ser específico com números, percentuais e métricas
9. Usar linguagem simples, profissional e estruturada

FORMATO DE RESPOSTA:
- Use tópicos e estruturas claras
- Destaque métricas importantes
- Forneça contexto de negócio nas análises
- Priorize informações acionáveis

Responda sempre em português brasileiro de forma profissional, objetiva e estratégica.`;

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
