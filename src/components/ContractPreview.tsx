import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, X } from 'lucide-react';
import { TimbradoA4 } from './TimbradoA4';
import html2pdf from 'html2pdf.js';

interface Student {
  codigo_aluno: number;
  aluno: string;
  nome_responsavel: string;
  whatsapp_fin: string;
  CPF_resp_fin: string;
  cpf_pai: string | null;
  cpf_mae: string | null;
  telefone_pai: string | null;
  telefone_mae: string | null;
  nome_pai: string | null;
  nome_mae: string | null;
  email_pai: string | null;
  email_mae: string | null;
  selectedParent?: 'pai' | 'mae';
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
    
    // Sempre substituir a data atual
    const today = new Date().toLocaleDateString('pt-BR');
    processedContent = processedContent.replace(
      /\{\{DATA_HOJE\}\}/g, 
      today
    );
    
    if (student && student.selectedParent) {
      const isParentPai = student.selectedParent === 'pai';
      
      processedContent = processedContent.replace(
        /\{\{NOME_ALUNO\}\}/g, 
        student.aluno || '[Nome do Aluno]'
      );
      processedContent = processedContent.replace(
        /\{\{NOME_RESPONSAVEL\}\}/g, 
        (isParentPai ? student.nome_pai : student.nome_mae) || '[Nome do Responsável]'
      );
      processedContent = processedContent.replace(
        /\{\{CPF_RESPONSAVEL\}\}/g, 
        (isParentPai ? student.cpf_pai : student.cpf_mae) || '[CPF do Responsável]'
      );
      processedContent = processedContent.replace(
        /\{\{TELEFONE_RESPONSAVEL\}\}/g, 
        (isParentPai ? student.telefone_pai : student.telefone_mae) || '[Telefone do Responsável]'
      );
      processedContent = processedContent.replace(
        /\{\{EMAIL_RESPONSAVEL\}\}/g, 
        (isParentPai ? student.email_pai : student.email_mae) || '[Email do Responsável]'
      );
    }
    
    return processedContent;
  };

  const handleDownloadPDF = async () => {
    try {
      // Se há alunos selecionados, gerar PDF para cada um
      if (selectedStudents.length > 0) {
        for (let i = 0; i < selectedStudents.length; i++) {
          const student = selectedStudents[i];
          const processedContent = replaceVariables(content, student);
          
          // Criar elemento temporário para o PDF
          const tempElement = document.createElement('div');
          tempElement.innerHTML = `
            <div style="
              width: 210mm;
              min-height: 297mm;
              background-image: url(/lovable-uploads/64a6e884-bff1-48e8-af2e-8d05186bf824.png);
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              padding: 5cm 1.27cm 3.3cm 1.27cm;
              box-sizing: border-box;
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.5;
              color: black;
            ">
              ${processedContent}
            </div>
          `;
          
          const options = {
            margin: 0,
            filename: `contrato_${student.aluno.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          
          await html2pdf().set(options).from(tempElement).save();
          
          // Pequeno delay entre downloads para evitar problemas
          if (i < selectedStudents.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } else {
        // Gerar PDF sem substituições
        const tempElement = document.createElement('div');
        tempElement.innerHTML = `
          <div style="
            width: 210mm;
            min-height: 297mm;
            background-image: url(/lovable-uploads/64a6e884-bff1-48e8-af2e-8d05186bf824.png);
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            padding: 5cm 1.27cm 3.3cm 1.27cm;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: black;
          ">
            ${content}
          </div>
        `;
        
        const options = {
          margin: 0,
          filename: `${contractTitle || 'contrato'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        await html2pdf().set(options).from(tempElement).save();
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
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
                      <p><strong>Responsável:</strong> {student.selectedParent === 'pai' ? student.nome_pai : student.nome_mae} ({student.selectedParent === 'pai' ? 'Pai' : 'Mãe'})</p>
                      <p><strong>CPF:</strong> {student.selectedParent === 'pai' ? student.cpf_pai : student.cpf_mae}</p>
                      <p><strong>Telefone:</strong> {student.selectedParent === 'pai' ? student.telefone_pai : student.telefone_mae}</p>
                    </div>
                  </div>
                  
                   <TimbradoA4>
                     <div
                       className="prose prose-sm max-w-none print:shadow-none"
                       style={{ fontSize: '12px', lineHeight: '1.5' }}
                       dangerouslySetInnerHTML={{ 
                         __html: replaceVariables(content, student) 
                       }}
                     />
                   </TimbradoA4>
                </div>
              ))
            ) : (
              // Mostrar documento com variáveis não substituídas quando não há alunos
              <TimbradoA4>
                <div
                  className="prose prose-sm max-w-none print:shadow-none"
                  style={{ fontSize: '12px', lineHeight: '1.5' }}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </TimbradoA4>
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