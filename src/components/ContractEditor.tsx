import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StudentSearch } from './StudentSearch';
import { TemplateSelector } from './TemplateSelector';
import { ContractPreview } from './ContractPreview';
import { CONTRACT_TEMPLATES, ContractTemplate } from './ContractTemplates';
import { supabase } from '@/integrations/supabase/client';
import html2pdf from 'html2pdf.js';

interface ContractData {
  title: string;
  parties: string;
  content: string;
}

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

export const ContractEditor = () => {
  const [contractData, setContractData] = useState<ContractData>({
    title: '',
    parties: '',
    content: ''
  });

  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template.id);
    setContractData(prev => ({ 
      ...prev, 
      content: template.content,
      title: template.name
    }));
  };


  const handleStudentSelect = (student: Student) => {
    setSelectedStudents(prev => [...prev, student]);
  };

  const handleStudentRemove = (codigoAluno: number) => {
    setSelectedStudents(prev => prev.filter(student => student.codigo_aluno !== codigoAluno));
  };

  const handleParentSelect = (codigoAluno: number, parentType: 'pai' | 'mae') => {
    setSelectedStudents(prev => prev.map(student => 
      student.codigo_aluno === codigoAluno 
        ? { ...student, selectedParent: parentType }
        : student
    ));
  };

  const handleSendForSignature = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Modelo não selecionado",
        description: "Por favor, selecione um modelo de contrato.",
        variant: "destructive",
      });
      return;
    }

    if (selectedStudents.length === 0) {
      toast({
        title: "Nenhum aluno selecionado",
        description: "Selecione pelo menos um aluno para envio.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Processando...",
        description: "Gerando documentos e enviando para assinatura...",
      });

      for (let i = 0; i < selectedStudents.length; i++) {
        const student = selectedStudents[i];
        const processedContent = replaceVariables(contractData.content, student);
        
        // Gerar PDF em base64
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
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        const pdfBlob = await html2pdf().set(options).from(tempElement).outputPdf('blob');
        
        // Converter para base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]); // Remove o prefixo "data:..."
          };
          reader.readAsDataURL(pdfBlob);
        });

        // Preparar dados para envio
        const isParentPai = student.selectedParent === 'pai';
        const nomeResponsavel = (isParentPai ? student.nome_pai : student.nome_mae) || '[Nome do Responsável]';
        const cpfResponsavel = (isParentPai ? student.cpf_pai : student.cpf_mae) || '[CPF do Responsável]';
        
        const webhookData = {
          nomeResponsavel,
          cpfResponsavel,
          whatsapp: student.whatsapp_fin || '[WhatsApp não informado]',
          base64,
          nomeAluno: student.aluno
        };

        // Enviar para a edge function
        const { data, error } = await supabase.functions.invoke('send-to-zapsign', {
          body: webhookData
        });

        if (error) {
          console.error('Erro ao enviar para ZapSign:', error);
          throw new Error(`Erro ao enviar documento para ${student.aluno}: ${error.message}`);
        }

        // Verificar se houve erro na resposta da edge function
        if (data && !data.success) {
          console.error('Webhook retornou erro:', data);
          throw new Error(`Erro ao enviar documento para ${student.aluno}: ${data.error}`);
        }

        console.log(`Documento enviado com sucesso para ${student.aluno}:`, data);

        // Aguardar entre envios para não sobrecarregar
        if (i < selectedStudents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const message = selectedStudents.length > 1 
        ? `Documentos enviados para ${selectedStudents.length} responsáveis!`
        : "Documento enviado para assinatura eletrônica!";

      toast({
        title: "Documentos enviados!",
        description: message,
      });

    } catch (error) {
      console.error('Erro ao enviar documentos:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar documentos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img 
              src="/lovable-uploads/f23dd2df-3cc1-4994-b227-eb27c08bb994.png" 
              alt="Colégio Zampieri Logo" 
              className="h-20 w-20 object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Envio de Ocorrências para assinatura
              </h1>
              <p className="text-muted-foreground text-lg">
                Selecione o aluno, escolha o modelo e gere documentos automaticamente
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Seleção de Aluno */}
          <Card className="shadow-card animate-slide-up">
            <CardHeader className="bg-gradient-card rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                1. Selecionar Aluno
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <StudentSearch
                selectedStudents={selectedStudents}
                onStudentSelect={handleStudentSelect}
                onStudentRemove={handleStudentRemove}
                onParentSelect={handleParentSelect}
              />
            </CardContent>
          </Card>

          {/* Seleção de Modelo */}
          {selectedStudents.length > 0 && selectedStudents.every(s => s.selectedParent) && (
            <Card className="shadow-card animate-slide-up">
              <CardHeader className="bg-gradient-card rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  2. Escolher Modelo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <TemplateSelector
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={handleTemplateSelect}
                />
              </CardContent>
            </Card>
          )}

          {/* Preview do Documento */}
          {selectedTemplate && selectedStudents.length > 0 && selectedStudents.every(s => s.selectedParent) && (
            <Card className="shadow-card animate-slide-up">
              <CardHeader className="bg-gradient-card rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  3. Preview do Documento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="p-4 bg-accent/30 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Documento será gerado automaticamente com as seguintes informações:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <strong>Modelo:</strong> {CONTRACT_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                    </div>
                    <div>
                      <strong>Aluno(s):</strong> {selectedStudents.length} selecionado(s)
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsPreviewOpen(true)}
                    className="mt-3"
                  >
                    Visualizar Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Ações */}
          {selectedTemplate && selectedStudents.length > 0 && selectedStudents.every(s => s.selectedParent) && (
            <Card className="shadow-card animate-slide-up">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button 
                      size="lg"
                      className="flex items-center gap-2 bg-gradient-primary hover:opacity-90 transition-smooth"
                      onClick={handleSendForSignature}
                    >
                      <Send className="h-4 w-4" />
                      Enviar para Assinatura
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-accent rounded-lg">
                    <h4 className="font-semibold text-sm text-foreground mb-2">
                      Resumo do Documento:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <strong>Modelo:</strong> {contractData.title}
                      </div>
                      <div>
                        <strong>Alunos selecionados:</strong> {selectedStudents.length}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Modal */}
        <ContractPreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          content={contractData.content}
          selectedStudents={selectedStudents}
          contractTitle={contractData.title}
          isBatchMode={true}
        />
      </div>
    </div>
  );
};