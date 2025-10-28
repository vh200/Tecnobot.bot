import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Database, CheckCircle2 } from "lucide-react";

interface DataImportProps {
  onImportComplete?: () => void;
}

export const DataImport = ({ onImportComplete }: DataImportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const { toast } = useToast();

  const parseCsv = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace('﻿', ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      return row;
    });
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);

      // Fetch the CSV file from public folder
      const response = await fetch('/vendas_consolidadas_com_mes.csv');
      const csvText = await response.text();
      
      const csvData = parseCsv(csvText);

      toast({
        title: "Processando dados",
        description: `Importando ${csvData.length} registros...`,
      });

      const { data, error } = await supabase.functions.invoke('import-csv', {
        body: { csvData }
      });

      if (error) throw error;

      setImportComplete(true);
      toast({
        title: "Importação concluída!",
        description: `${data.totalRecords} registros foram importados com sucesso.`,
      });

      onImportComplete?.();

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Importação de Dados
        </CardTitle>
        <CardDescription>
          Importe os dados consolidados de vendas (12 meses) para o banco de dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {importComplete ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Dados importados com sucesso!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                O chatbot agora pode analisar todos os dados de vendas.
              </p>
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleImport} 
            disabled={isImporting}
            className="w-full"
            size="lg"
          >
            {isImporting ? (
              <>
                <Upload className="h-5 w-5 mr-2 animate-pulse" />
                Importando dados...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Importar Dados de Vendas
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};