import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, X } from 'lucide-react';

interface Student {
  codigo_aluno: number;
  aluno: string;
  nome_responsavel: string;
  whatsapp_fin: string;
}

interface ContractPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  selectedStudents: Student[];
  contractTitle: string;
  isBatchMode: boolean;
}

export const ContractPreview = ({ 
  isOpen, 
  onClose, 
  content, 
  selectedStudents, 
  contractTitle,
  isBatchMode 
}: ContractPreviewProps) => {
  
  const replaceVariables = (htmlContent: string, student?: Student) => {
    let processedContent = htmlContent;
    
    if (student) {
      // Substituir variáveis pelos dados do aluno
      processedContent = processedContent.replace(
        /\{\{NOME_ALUNO\}\}/g, 
        student.aluno || '[Nome do Aluno]'
      );
      processedContent = processedContent.replace(
        /\{\{NOME_RESPONSAVEL\}\}/g, 
        student.nome_responsavel || '[Nome do Responsável]'
      );
      
      // Remover as classes de estilo das variáveis no preview
      processedContent = processedContent.replace(
        /<span class="bg-primary\/10 text-primary px-2 py-1 rounded font-medium">/g,
        '<span class="font-semibold text-primary">'
      );
    }
    
    return processedContent;
  };

  const handleDownloadPDF = () => {
    // TODO: Implementar geração de PDF
    console.log('Gerar PDF para download');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Preview: {contractTitle || 'Documento'}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            {isBatchMode && selectedStudents.length > 0 ? (
              // Modo lote - mostrar um documento para cada aluno
              selectedStudents.map((student, index) => (
                <div key={student.codigo_aluno} className="space-y-4">
                  {index > 0 && (
                    <div className="border-t border-dashed border-border pt-8">
                      <div className="text-center text-sm text-muted-foreground mb-4">
                        Documento {index + 1} de {selectedStudents.length}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-accent/30 p-3 rounded-lg mb-4">
                    <h4 className="font-semibold text-sm mb-2">
                      Documento {index + 1}:
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Aluno:</strong> {student.aluno}</p>
                      <p><strong>Responsável:</strong> {student.nome_responsavel}</p>
                      <p><strong>WhatsApp:</strong> {student.whatsapp_fin}</p>
                    </div>
                  </div>
                  
                  <div
                    className="prose prose-sm max-w-none bg-background p-6 rounded border print:shadow-none"
                    dangerouslySetInnerHTML={{ 
                      __html: replaceVariables(content, student) 
                    }}
                  />
                </div>
              ))
            ) : (
              // Mostrar documento com variáveis não substituídas quando não há alunos
              <div
                className="prose prose-sm max-w-none bg-background p-6 rounded border"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>
        </ScrollArea>

        {selectedStudents.length > 0 && (
          <div className="p-6 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground text-center">
              {selectedStudents.length} documento(s) serão gerados para assinatura
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};