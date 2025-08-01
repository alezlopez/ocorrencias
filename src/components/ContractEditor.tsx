import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload, FileText, Eye, Download, Send, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StudentSearch } from './StudentSearch';
import { RichTextEditor } from './RichTextEditor';
import { ContractPreview } from './ContractPreview';

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
}

export const ContractEditor = () => {
  const [contractData, setContractData] = useState<ContractData>({
    title: '',
    parties: '',
    content: `<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>

<p><strong>CONTRATANTE:</strong> [Nome da empresa/pessoa]</p>
<p><strong>CONTRATADO:</strong> <span class="bg-primary/10 text-primary px-2 py-1 rounded font-medium">{{NOME_RESPONSAVEL}}</span></p>
<p><strong>ALUNO:</strong> <span class="bg-primary/10 text-primary px-2 py-1 rounded font-medium">{{NOME_ALUNO}}</span></p>

<h3>CLÁUSULA 1ª - DO OBJETO</h3>
<p>O presente contrato tem por objeto a prestação de serviços educacionais para o aluno <span class="bg-primary/10 text-primary px-2 py-1 rounded font-medium">{{NOME_ALUNO}}</span>...</p>

<h3>CLÁUSULA 2ª - DAS OBRIGAÇÕES</h3>
<p>São obrigações do CONTRATADO:</p>
<ul>
<li>Executar os serviços conforme especificado;</li>
<li>Manter sigilo sobre informações confidenciais;</li>
</ul>

<h3>CLÁUSULA 3ª - DO VALOR E FORMA DE PAGAMENTO</h3>
<p>O valor total dos serviços será de R$ _______, a ser pago pelo responsável <span class="bg-primary/10 text-primary px-2 py-1 rounded font-medium">{{NOME_RESPONSAVEL}}</span>...</p>

<h3>CLÁUSULA 4ª - DO PRAZO</h3>
<p>O presente contrato terá vigência de _____ dias...</p>

<p><br/>Data: ___/___/_____</p>
<p>Assinatura do Contratante: _________________________</p>
<p>Assinatura do Contratado (<span class="bg-primary/10 text-primary px-2 py-1 rounded font-medium">{{NOME_RESPONSAVEL}}</span>): _________________________</p>`,
    attachments: []
  });

  const [showPreview, setShowPreview] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleContentChange = (content: string) => {
    setContractData(prev => ({ ...prev, content }));
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

  const handleSendForSignature = () => {
    if (!contractData.title) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título do contrato.",
        variant: "destructive",
      });
      return;
    }

    if (batchMode && selectedStudents.length === 0) {
      toast({
        title: "Nenhum aluno selecionado",
        description: "Selecione pelo menos um aluno para envio em lote.",
        variant: "destructive",
      });
      return;
    }

    if (!batchMode && !contractData.parties) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha as partes do contrato.",
        variant: "destructive",
      });
      return;
    }

    const message = batchMode 
      ? `Contrato enviado para ${selectedStudents.length} responsável(eis)!`
      : "Contrato enviado para assinatura eletrônica!";

    toast({
      title: "Contrato enviado!",
      description: message,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Sistema de Assinatura Digital
          </h1>
          <p className="text-muted-foreground text-lg">
            Crie, edite e envie contratos para assinatura eletrônica
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Informações do Contrato */}
          <Card className="shadow-card animate-slide-up">
            <CardHeader className="bg-gradient-card rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Informações do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Contrato *</Label>
                  <Input
                    id="title"
                    value={contractData.title}
                    onChange={(e) => setContractData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Contrato de Prestação de Serviços"
                    className="transition-smooth"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="batch-mode"
                    checked={batchMode}
                    onCheckedChange={setBatchMode}
                  />
                  <Label htmlFor="batch-mode" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Envio em Lote
                  </Label>
                </div>
              </div>

              {batchMode ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Selecionar Alunos</Label>
                    <StudentSearch
                      selectedStudents={selectedStudents}
                      onStudentSelect={handleStudentSelect}
                      onStudentRemove={handleStudentRemove}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="parties">Partes Envolvidas *</Label>
                  <Input
                    id="parties"
                    value={contractData.parties}
                    onChange={(e) => setContractData(prev => ({ ...prev, parties: e.target.value }))}
                    placeholder="Ex: Empresa ABC e Cliente XYZ"
                    className="transition-smooth"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editor de Contrato */}
          <Card className="shadow-card animate-slide-up">
            <CardContent className="p-6">
              <RichTextEditor 
                value={contractData.content}
                onChange={handleContentChange}
                onPreview={() => setIsPreviewOpen(true)}
              />
            </CardContent>
          </Card>

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
          <Card className="shadow-card animate-slide-up">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button variant="outline" size="lg" className="flex items-center gap-2">
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
                
                {contractData.title && (
                  <div className="p-4 bg-accent rounded-lg">
                    <h4 className="font-semibold text-sm text-foreground mb-2">
                      Resumo do Contrato:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <strong>Título:</strong> {contractData.title}
                      </div>
                      {!batchMode && contractData.parties && (
                        <div>
                          <strong>Partes:</strong> {contractData.parties}
                        </div>
                      )}
                      {batchMode && selectedStudents.length > 0 && (
                        <div>
                          <strong>Alunos selecionados:</strong> {selectedStudents.length}
                        </div>
                      )}
                      <div>
                        <strong>Anexos:</strong> {contractData.attachments.length} arquivo(s)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Modal */}
        <ContractPreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          content={contractData.content}
          selectedStudents={selectedStudents}
          contractTitle={contractData.title}
          isBatchMode={batchMode}
        />
      </div>
    </div>
  );
};