-- Criar tabela de vendas para armazenar os dados mensais
CREATE TABLE public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  id_transacao TEXT NOT NULL UNIQUE,
  produto TEXT NOT NULL,
  categoria TEXT NOT NULL,
  regiao TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  receita_total DECIMAL(10,2) NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhorar performance de consultas
CREATE INDEX idx_vendas_data ON public.vendas(data);
CREATE INDEX idx_vendas_mes_ano ON public.vendas(mes, ano);
CREATE INDEX idx_vendas_produto ON public.vendas(produto);
CREATE INDEX idx_vendas_categoria ON public.vendas(categoria);
CREATE INDEX idx_vendas_regiao ON public.vendas(regiao);

-- Habilitar RLS (mas tornar público para leitura, já que são dados demo)
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Permitir leitura pública de vendas"
ON public.vendas
FOR SELECT
USING (true);

-- Adicionar comentário na tabela
COMMENT ON TABLE public.vendas IS 'Dados de vendas mensais da Alpha Insights para análise pelo bot';
