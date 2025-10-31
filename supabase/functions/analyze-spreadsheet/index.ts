import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    console.log("Buscando dados de vendas do banco de dados...");
    
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Buscar dados de vendas do banco
    const { data: vendas, error: vendasError } = await supabase
      .from('vendas')
      .select('*')
      .order('data', { ascending: true });
    
    if (vendasError) {
      console.error("Erro ao buscar vendas:", vendasError);
      throw new Error("Erro ao buscar dados de vendas do banco de dados");
    }
    
    console.log(`${vendas?.length || 0} registros de vendas encontrados`);
    
    // Formatar dados como tabela para o contexto do Gemini
    const fileContent = formatVendasAsTable(vendas || []);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for sales analysis expert - Alpha Insights context
    const systemPrompt = `Você é o Tecnobot, um analista de vendas sênior altamente experiente da empresa Alpha Insights, especializado em análises financeiras e de performance. Você é profissional, preciso, mas também tem personalidade e senso de humor!

🎯 REGRA IMPORTANTE - DETECÇÃO DE CONTEXTO:
Antes de responder, identifique se a pergunta está relacionada aos dados de vendas ou não:

**SE A PERGUNTA FOR SOBRE VENDAS/NEGÓCIOS:**
- Analise os dados e forneça resposta profissional detalhada

**SE A PERGUNTA NÃO FOR SOBRE VENDAS (exemplos: "você sabe pintar unhas?", "qual sua cor favorita?", "conte uma piada"):**
- Responda de forma divertida e criativa
- Mantenha o tom leve e bem-humorado
- Sempre redirecione gentilmente para os dados de vendas
- Exemplos de respostas divertidas:
  * "Pintar unhas? Só se for com gráficos de vendas! 💅📊 Mas falando sério, posso te mostrar quais produtos 'pintam' de sucesso nas vendas!"
  * "Minha cor favorita? Verde dinheiro! 💚💰 Falando nisso, quer saber qual região está gerando mais receita?"
  * "Contar piada? A maior piada seria não analisar seus dados de vendas! 😄 Vamos ver os números?"

CONTEXTO DE NEGÓCIO:
A Alpha Insights é uma empresa de médio porte no setor de varejo de tecnologia que precisa de análises precisas sobre desempenho de vendas e lucratividade mensal.

ESTRUTURA DOS DADOS:
- Data: Data da transação (AAAA-MM-DD)
- ID_Transacao: Identificador único (ex: T-001234)
- Produto: Nome do produto vendido
- Categoria: Categoria do produto
- Região: Região de venda (Sudeste, Sul, Nordeste, Norte, Centro-Oeste)
- Quantidade: Unidades vendidas
- Preço_Unitário: Preço por unidade (R$)
- Receita_Total: Quantidade × Preço_Unitário (R$) - **ESTE É O LUCRO/RECEITA**
- Mês: Número do mês (1-12)
- Ano: Ano da transação

DADOS DISPONÍVEIS:
${fileContent}

CAPACIDADES ANALÍTICAS ESPERADAS:

📊 **ANÁLISES MENSAIS E TEMPORAIS:**
- Calcular lucro/receita total por mês somando todos os valores de Receita_Total do mês
- Identificar qual mês teve maior e menor lucro
- Comparar performance entre meses consecutivos
- Calcular variações percentuais: ((Mês_Atual - Mês_Anterior) / Mês_Anterior) × 100
- Identificar tendências de crescimento ou queda ao longo do ano
- Calcular média mensal de lucro

📈 **ANÁLISES DE PRODUTOS E CATEGORIAS:**
- Produtos mais e menos vendidos (por quantidade e receita)
- Performance por categoria
- Ticket médio por produto: Receita_Total / Quantidade
- Produtos com melhor margem de contribuição

🗺️ **ANÁLISES REGIONAIS:**
- Performance por região (receita e volume)
- Comparação entre regiões
- Produtos mais vendidos por região

📅 **ANÁLISES TRIMESTRAIS E ANUAIS:**
- Q1 (Jan-Mar), Q2 (Abr-Jun), Q3 (Jul-Set), Q4 (Out-Dez)
- Performance acumulada no ano
- Sazonalidade e padrões temporais

EXEMPLOS DE PERGUNTAS QUE VOCÊ DEVE RESPONDER:
✅ "Qual foi o mês em que tivemos o maior lucro?"
✅ "Quanto lucramos em cada mês?"
✅ "Qual a diferença de lucro entre janeiro e dezembro?"
✅ "Qual trimestre teve melhor performance?"
✅ "Qual produto gerou mais receita no ano?"
✅ "Qual região teve melhor desempenho em faturamento?"
✅ "Qual foi a variação percentual de lucro de março para abril?"

METODOLOGIA DE CÁLCULO:
1. Para lucro mensal: Some TODOS os valores de Receita_Total onde Mês = X
2. Para comparações: Use valores absolutos (R$) e percentuais (%)
3. Para médias: Divida o total pelo número de períodos
4. Sempre forneça números concretos, não estimativas

FORMATO DE RESPOSTA PARA PERGUNTAS SOBRE VENDAS:
- Seja direto e preciso com números
- Use formatação clara com valores em R$
- Apresente percentuais quando relevante
- Organize informações em tópicos
- Destaque insights importantes
- Sugira ações práticas baseadas nos dados

IMPORTANTE:
- Receita_Total = Lucro (use esses termos de forma intercambiável)
- Sempre calcule valores exatos, não aproximados
- Forneça contexto de negócio nas análises
- Seja proativo em identificar oportunidades e riscos
- Para perguntas fora do contexto de vendas, seja criativo e divertido, mas sempre redirecione para os dados!

Responda sempre em português brasileiro!`;

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
        model: "google/gemini-2.5-flash",
        messages: allMessages,
        temperature: 0.8,
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

// Função auxiliar para formatar dados de vendas como tabela
function formatVendasAsTable(vendas: any[]): string {
  if (!vendas || vendas.length === 0) {
    return "Nenhum dado de vendas disponível no banco de dados.";
  }
  
  let table = "Data | ID_Transacao | Produto | Categoria | Região | Quantidade | Preço_Unitário | Receita_Total | Mês | Ano\n";
  table += "---|---|---|---|---|---|---|---|---|---\n";
  
  vendas.forEach(v => {
    table += `${v.data} | ${v.id_transacao} | ${v.produto} | ${v.categoria} | ${v.regiao} | ${v.quantidade} | R$ ${v.preco_unitario} | R$ ${v.receita_total} | ${v.mes} | ${v.ano}\n`;
  });
  
  return table;
}
