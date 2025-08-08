import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Download, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StudentSearch } from './StudentSearch';
import { TemplateSelector } from './TemplateSelector';
import { ContractPreview } from './ContractPreview';
import { CONTRACT_TEMPLATES, ContractTemplate } from './ContractTemplates';
import html2pdf from 'html2pdf.js';

interface ContractData {
  title: string;
  parties: string;
  content: string;
  attachments: File[];
}

interface Student {
  codigo_aluno: number;
  aluno: string;
  nome_responsavel: string;
  whatsapp_fin: string;
  CPF_resp_fin: string;
  cpf_pai?: string;
  cpf_mae?: string;
  telefone_pai?: string;
  telefone_mae?: string;
  nome_pai?: string;
  nome_mae?: string;
  email_pai?: string;
  email_mae?: string;
  selectedParent?: 'pai' | 'mae';
}

export const ContractEditor = () => {
  const [contractData, setContractData] = useState<ContractData>({
    title: '',
    parties: '',
    content: '',
    attachments: []
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setContractData(prev => ({ 
      ...prev, 
      attachments: [...prev.attachments, ...files] 
    }));
    toast({
      title: "Arquivo anexado",
      description: `${files.length} arquivo(s) anexado(s) com sucesso.`,
    });
  };

  const removeAttachment = (index: number) => {
    setContractData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
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

  const handleSendForSignature = () => {
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

    const message = selectedStudents.length > 1 
      ? `Documento enviado para ${selectedStudents.length} responsável(eis)!`
      : "Documento enviado para assinatura eletrônica!";

    toast({
      title: "Documento enviado!",
      description: message,
    });
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

  const handleDownloadPDF = async () => {
    try {
      if (!selectedTemplate) {
        toast({
          title: "Modelo não selecionado",
          description: "Por favor, selecione um modelo antes de gerar o PDF.",
          variant: "destructive",
        });
        return;
      }

      if (selectedStudents.length === 0) {
        toast({
          title: "Nenhum aluno selecionado",
          description: "Selecione pelo menos um aluno para gerar o PDF.",
          variant: "destructive",
        });
        return;
      }

      for (let i = 0; i < selectedStudents.length; i++) {
        const student = selectedStudents[i];
        const processedContent = replaceVariables(contractData.content, student);
        
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
          filename: `${contractData.title}_${student.aluno.replace(/\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        await html2pdf().set(options).from(tempElement).save();
        
        if (i < selectedStudents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast({
        title: "PDFs gerados!",
        description: `${selectedStudents.length} arquivo(s) baixado(s) com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Sistema de Documentos Escolares
          </h1>
          <p className="text-muted-foreground text-lg">
            Selecione o aluno, escolha o modelo e gere documentos automaticamente
          </p>
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

          {/* Anexos */}
          <Card className="shadow-card animate-slide-up">
            <CardHeader className="bg-gradient-card rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Anexos (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-smooth">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" type="button">
                    Selecionar Arquivos
                  </Button>
                </Label>
              </div>

              {contractData.attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>Arquivos Anexados:</Label>
                  {contractData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações */}
          {selectedTemplate && selectedStudents.length > 0 && selectedStudents.every(s => s.selectedParent) && (
            <Card className="shadow-card animate-slide-up">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="flex items-center gap-2"
                      onClick={handleDownloadPDF}
                    >
                      <Download className="h-4 w-4" />
                      Baixar PDF
                    </Button>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <strong>Modelo:</strong> {contractData.title}
                      </div>
                      <div>
                        <strong>Alunos selecionados:</strong> {selectedStudents.length}
                      </div>
                      <div>
                        <strong>Anexos:</strong> {contractData.attachments.length} arquivo(s)
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