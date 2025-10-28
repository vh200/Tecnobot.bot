import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvData } = await req.json();
    
    if (!csvData || !Array.isArray(csvData)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSV data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Transform CSV data to match database schema
    const vendas = csvData.map((row: any) => {
      const data = new Date(row.Data);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();

      return {
        data: row.Data,
        id_transacao: row.ID_Transacao,
        produto: row.Produto,
        categoria: row.Categoria,
        regiao: row.Regiao,
        quantidade: parseInt(row.Quantidade),
        preco_unitario: parseFloat(row.Preco_Unitario),
        receita_total: parseFloat(row.Receita_Total),
        mes,
        ano
      };
    });

    // Delete existing data
    const { error: deleteError } = await supabase
      .from('vendas')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Error deleting existing data:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to clear existing data', details: deleteError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new data in batches
    const batchSize = 500;
    let totalInserted = 0;

    for (let i = 0; i < vendas.length; i += batchSize) {
      const batch = vendas.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('vendas')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to insert data', 
            details: insertError,
            inserted: totalInserted 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      totalInserted += batch.length;
      console.log(`Inserted batch ${i / batchSize + 1}: ${batch.length} records (Total: ${totalInserted})`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully imported ${totalInserted} records`,
        totalRecords: totalInserted
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-csv function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});