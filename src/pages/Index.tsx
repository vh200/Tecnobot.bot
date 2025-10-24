import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ChatInterface } from "@/components/ChatInterface";
import { BarChart3, TrendingUp, Target } from "lucide-react";

const Index = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (file: File, content: string) => {
    setFileContent(content);
    setFileName(file.name);
  };

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
            Tencobot Analista de Vendas
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
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Análise de Tendências</h3>
            <p className="text-sm text-muted-foreground">
              Identifique padrões, sazonalidades e tendências em suas vendas mensais
            </p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex p-3 bg-secondary/10 rounded-lg mb-4">
              <Target className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Insights Estratégicos</h3>
            <p className="text-sm text-muted-foreground">
              Receba relatórios e insights imediatos para focar em estratégias
            </p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex p-3 bg-accent/10 rounded-lg mb-4">
              <BarChart3 className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Análise Completa</h3>
            <p className="text-sm text-muted-foreground">
              Produtos, categorias, regiões, receitas e variações percentuais
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                1. Carregue sua Planilha
              </h2>
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              2. Converse com o Especialista
            </h2>
            <div className="h-[600px]">
              <ChatInterface fileContent={fileContent} fileName={fileName} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground space-y-2">
          <p className="font-semibold">Alpha Insights - Tencobot Analista de Vendas</p>
          <p>
            Análise inteligente de dados de vendas • Insights em tempo real • Gemini 2.5-Pro
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
