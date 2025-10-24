import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  fileContent: string | null;
  fileName: string | null;
}

export const ChatInterface = ({ fileContent, fileName }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !fileContent) {
      if (!fileContent) {
        toast.error("Por favor, carregue uma planilha primeiro");
      }
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-spreadsheet", {
        body: {
          messages: [...messages, userMessage],
          fileContent,
          fileName,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Erro ao processar mensagem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bot className="h-6 w-6" />
          Chat com Especialista em Vendas
        </h2>
        {fileName && (
          <p className="text-sm text-white/80 mt-1">
            Analisando: {fileName}
          </p>
        )}
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-6">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <div className="inline-flex p-4 bg-muted rounded-full">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  Pronto para analisar seus dados!
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Faça perguntas sobre suas vendas, produtos, regiões, tendências e muito mais.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto mt-6">
                <div className="text-left p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">Exemplo:</p>
                  <p className="text-sm text-foreground">"Qual produto teve mais vendas?"</p>
                </div>
                <div className="text-left p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">Exemplo:</p>
                  <p className="text-sm text-foreground">"Quais regiões têm melhor margem?"</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary to-secondary text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4 bg-background/50">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              fileContent
                ? "Pergunte sobre os dados da planilha..."
                : "Carregue uma planilha para começar"
            }
            disabled={!fileContent || isLoading}
            className="min-h-[60px] resize-none"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || !fileContent || isLoading}
            size="icon"
            className="h-[60px] w-[60px] bg-gradient-to-br from-primary to-secondary hover:opacity-90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
