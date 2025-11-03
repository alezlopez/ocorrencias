import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Send, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StudentSearch } from './StudentSearch';
import { TemplateSelector } from './TemplateSelector';
import { ContractPreview } from './ContractPreview';
import { RichTextEditor } from './RichTextEditor';
import { CONTRACT_TEMPLATES, ContractTemplate } from './ContractTemplates';
import { supabase } from '@/integrations/supabase/client';
import html2pdf from 'html2pdf.js';

interface ContractData {
  title: string;
  parties: string;
  content: string;
}

interface Student {
  id: number;
  name: string;
  parents: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
    type: string;
  }[];
  selectedParent?: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
    type: string;
  } | null;
}

export const ContractEditor = () => {
  const [contractData, setContractData] = useState<ContractData>({
    title: '',
    parties: '',
    content: ''
  });

  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'ocorrencias' | 'atas' | 'diversos' | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [diversosText, setDiversosText] = useState('');
  const [diversosFiles, setDiversosFiles] = useState<File[]>([]);

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

  const handleStudentRemove = (studentId: number) => {
    setSelectedStudents(prev => prev.filter(student => student.id !== studentId));
  };

  const handleParentSelect = (studentId: number, parent: { name: string; cpf: string; email: string; phone: string; type: string }) => {
    setSelectedStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, selectedParent: parent }
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
        const selectedParent = student.selectedParent;
        const nomeResponsavel = selectedParent ? selectedParent.name : '[Nome do Responsável]';
        const cpfResponsavel = selectedParent ? selectedParent.cpf : '[CPF do Responsável]';
        
        const webhookData = {
          nomeResponsavel,
          cpfResponsavel,
          whatsapp: selectedParent ? selectedParent.phone : '[WhatsApp não informado]',
          base64,
          nomeAluno: student.name
        };

        // Enviar para a edge function
        const { data, error } = await supabase.functions.invoke('send-to-zapsign', {
          body: webhookData
        });

        if (error) {
          console.error('Erro ao enviar para ZapSign:', error);
          throw new Error(`Erro ao enviar documento para ${student.name}: ${error.message}`);
        }

        // Verificar se houve erro na resposta da edge function
        if (data && !data.success) {
          console.error('Webhook retornou erro:', data);
          throw new Error(`Erro ao enviar documento para ${student.name}: ${data.error}`);
        }

        console.log(`Documento enviado com sucesso para ${student.name}:`, data);

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
      const selectedParent = student.selectedParent;
      
      processedContent = processedContent.replace(
        /\{\{NOME_ALUNO\}\}/g, 
        student.name || '[Nome do Aluno]'
      );
      processedContent = processedContent.replace(
        /\{\{NOME_RESPONSAVEL\}\}/g, 
        selectedParent.name || '[Nome do Responsável]'
      );
      processedContent = processedContent.replace(
        /\{\{CPF_RESPONSAVEL\}\}/g, 
        selectedParent.cpf || '[CPF do Responsável]'
      );
      processedContent = processedContent.replace(
        /\{\{TELEFONE_RESPONSAVEL\}\}/g, 
        selectedParent.phone || '[Telefone do Responsável]'
      );
      processedContent = processedContent.replace(
        /\{\{EMAIL_RESPONSAVEL\}\}/g, 
        selectedParent.email || '[Email do Responsável]'
      );
      
      // Variáveis adicionais para "Diversos"
      const nomePai = student.parents.find(p => p.type === 'Pai')?.name || '[Nome do Pai]';
      const nomeMae = student.parents.find(p => p.type === 'Mãe')?.name || '[Nome da Mãe]';
      
      processedContent = processedContent.replace(
        /\{\{NOME_PAI\}\}/g, 
        nomePai
      );
      processedContent = processedContent.replace(
        /\{\{NOME_MAE\}\}/g, 
        nomeMae
      );
    }
    
    return processedContent;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove o prefixo "data:...;base64,"
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSendDiversos = async () => {
    if (!diversosText.trim()) {
      toast({
        title: "Texto não preenchido",
        description: "Por favor, preencha o texto do documento.",
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
        description: "Enviando documentos diversos...",
      });

      // Converter arquivos para base64
      const arquivosBase64 = await Promise.all(
        diversosFiles.map(async (file) => ({
          nome: file.name,
          tipo: file.type,
          tamanho: file.size,
          base64: await fileToBase64(file)
        }))
      );

      // Preparar array com dados de todos os alunos
      const alunos = selectedStudents.map(student => {
        const processedText = replaceVariables(diversosText, student);
        
        return {
          texto: processedText,
          nomeAluno: student.name,
          nomeResponsavel: student.selectedParent?.name || '',
          cpfResponsavel: student.selectedParent?.cpf || '',
          whatsapp: student.selectedParent?.phone || ''
        };
      });

      const payload = {
        alunos,
        arquivos: arquivosBase64
      };

      const response = await fetch('https://n8n.colegiozampieri.com/webhook/b1a9391d-4115-45f9-aa1f-08119c4ca2fd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar documentos');
      }

      toast({
        title: "Documentos enviados!",
        description: `Documentos enviados para ${selectedStudents.length} aluno(s)!`,
      });

      // Limpar campos
      setDiversosText('');
      setDiversosFiles([]);

    } catch (error) {
      console.error('Erro ao enviar documentos diversos:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar documentos. Tente novamente.",
        variant: "destructive",
      });
    }
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
                Envio de Documentos para Assinatura
              </h1>
              <p className="text-muted-foreground text-lg">
                Selecione o aluno, defina o tipo e escolha o modelo
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

          {/* Mensagem de instruções quando alunos estão selecionados mas sem responsável */}
          {selectedStudents.length > 0 && !selectedStudents.every(s => s.selectedParent) && (
            <Card className="shadow-card animate-slide-up border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Ação necessária
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Alguns alunos ainda não têm um responsável selecionado. Selecione um responsável (Pai ou Mãe) para cada aluno antes de continuar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tipo de Documento */}
          {selectedStudents.length > 0 && selectedStudents.every(s => s.selectedParent) && (
            <>
              <Card className="shadow-card animate-slide-up">
                <CardHeader className="bg-gradient-card rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    2. Tipo de Documento
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant={documentType === 'ocorrencias' ? 'default' : 'outline'}
                      onClick={() => { setDocumentType('ocorrencias'); setSelectedTemplate(null); }}
                    >
                      Ocorrências
                    </Button>
                    <Button
                      variant={documentType === 'atas' ? 'default' : 'outline'}
                      onClick={() => { setDocumentType('atas'); setSelectedTemplate(null); }}
                    >
                      Atas
                    </Button>
                    <Button
                      variant={documentType === 'diversos' ? 'default' : 'outline'}
                      onClick={() => { setDocumentType('diversos'); setSelectedTemplate(null); }}
                    >
                      Diversos
                    </Button>
                  </div>
                  {documentType === 'atas' && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Modelos de Atas: confirme se devemos usar modelos pré-definidos ou outra forma de envio.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Seleção de Modelo (apenas Ocorrências) */}
              {documentType === 'ocorrencias' && (
                <Card className="shadow-card animate-slide-up">
                  <CardHeader className="bg-gradient-card rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      3. Escolher Modelo
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

              {/* Formulário Diversos */}
              {documentType === 'diversos' && (
                <Card className="shadow-card animate-slide-up">
                  <CardHeader className="bg-gradient-card rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      3. Preencher Documento Diversos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <RichTextEditor
                        value={diversosText}
                        onChange={setDiversosText}
                      />
                    </div>

                    <div>
                      <Label htmlFor="diversosFiles" className="mb-2 block">
                        Anexar Documentos (opcional)
                      </Label>
                      <Input
                        id="diversosFiles"
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setDiversosFiles(files);
                        }}
                        className="w-full"
                      />
                      {diversosFiles.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <strong>Arquivos selecionados:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {diversosFiles.map((file, index) => (
                              <li key={index}>{file.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <Button 
                      size="lg"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-primary hover:opacity-90 transition-smooth"
                      onClick={handleSendDiversos}
                    >
                      <Send className="h-4 w-4" />
                      Enviar Documentos Diversos
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Preview do Documento */}
          {selectedTemplate && selectedStudents.length > 0 && selectedStudents.every(s => s.selectedParent) && (
            <Card className="shadow-card animate-slide-up">
              <CardHeader className="bg-gradient-card rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  4. Preview do Documento
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