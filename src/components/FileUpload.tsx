import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUpload: (file: File, content: string) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Por favor, envie apenas arquivos CSV ou Excel (.xlsx, .xls)");
      return;
    }

    setUploadedFile(file);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileUpload(file, content);
      toast.success(`Arquivo "${file.name}" carregado com sucesso!`);
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [onFileUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center
          transition-all duration-300
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border bg-card hover:border-primary/50"
          }
        `}
      >
        {uploadedFile ? (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-semibold text-foreground">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="ml-2 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Arquivo carregado! Agora você pode fazer perguntas sobre os dados.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex p-4 bg-gradient-to-br from-primary to-secondary rounded-full">
              <Upload className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Arraste sua planilha aqui
              </h3>
              <p className="text-muted-foreground">
                Ou clique para selecionar um arquivo
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos suportados: CSV, XLSX, XLS
              </p>
            </div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};
