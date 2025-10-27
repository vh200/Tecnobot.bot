import { ChatInterface } from "@/components/ChatInterface";
import { BarChart3, TrendingUp, Target, Database } from "lucide-react";

const Index = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Powered by Gemini 2.5-Pro
            </span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Tecnobot Analista de Vendas
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Bot Analítico da Alpha Insights - Análise inteligente de dados de vendas mensais com IA
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-2xl mx-auto">
            Consulte seus dados em linguagem natural e obtenha insights imediatos sobre performance, produtos, regiões e tendências
          </p>
        </header>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex p-3 bg-primary/10 rounded-lg mb-4">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Dados Integrados</h3>
            <p className="text-sm text-muted-foreground">
              Todos os dados de vendas já estão no sistema, prontos para análise instantânea
            </p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex p-3 bg-secondary/10 rounded-lg mb-4">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Análise de Tendências</h3>
            <p className="text-sm text-muted-foreground">
              Identifique padrões, sazonalidades e tendências em suas vendas mensais
            </p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex p-3 bg-accent/10 rounded-lg mb-4">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Insights Estratégicos</h3>
            <p className="text-sm text-muted-foreground">
              Receba relatórios e insights imediatos para focar em estratégias de vendas
            </p>
          </div>
        </div>

        {/* Main Content - Chat Full Width */}
        <div className="max-w-6xl mx-auto">
          <div className="h-[700px]">
            <ChatInterface />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground space-y-2">
          <p className="font-semibold">Alpha Insights - Tecnobot Analista de Vendas</p>
          <p>
            Análise inteligente de dados de vendas • Insights em tempo real • Gemini 2.5-Pro
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
