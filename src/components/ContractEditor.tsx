import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Upload, LogOut, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { StudentSearch } from './StudentSearch';
import { RichTextEditor } from './RichTextEditor';
import { WhatsAppTemplate } from './WhatsAppTemplates';
import { WhatsAppTemplateSelector } from './WhatsAppTemplateSelector';
import { supabase } from '@/integrations/supabase/client';

interface Parent {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  type: string;
}

interface Student {
  id: number;
  name: string;
  parents: Parent[];
  selectedParent?: Parent | null;
  selectedParents?: Parent[];
}

interface MessageUsage {
  period_start: string;
  period_end: string;
  messages_sent: number;
  max_messages: number;
}

export const ContractEditor = () => {
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [diversosText, setDiversosText] = useState('');
  const [diversosFiles, setDiversosFiles] = useState<File[]>([]);
  const [selectedWhatsAppTemplate, setSelectedWhatsAppTemplate] = useState<WhatsAppTemplate | null>(null);
  const [diversosLink, setDiversosLink] = useState('');
  const [messageUsage, setMessageUsage] = useState<MessageUsage | null>(null);
  const [isUsageLoading, setIsUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessageUsage();
  }, []);

  const fetchMessageUsage = async () => {
    setIsUsageLoading(true);
    setUsageError(null);
    try {
      const { data, error } = await supabase.rpc('get_current_message_period');
      if (error) throw error;
      if (data && data.length > 0) {
        setMessageUsage(data[0] as MessageUsage);
      } else {
        setUsageError('Nenhum período encontrado.');
      }
    } catch (err) {
      console.error('Erro ao buscar uso de mensagens:', err);
      setUsageError('Erro ao carregar contador.');
    } finally {
      setIsUsageLoading(false);
    }
  };

  const isLimitReached = messageUsage ? messageUsage.messages_sent >= messageUsage.max_messages : false;
  const usagePercent = messageUsage ? (messageUsage.messages_sent / messageUsage.max_messages) * 100 : 0;

  const getUsageColor = () => {
    if (usagePercent >= 90) return 'text-destructive';
    if (usagePercent >= 70) return 'text-yellow-600';
    return 'text-primary';
  };

  const getProgressClass = () => {
    if (usagePercent >= 90) return '[&>div]:bg-destructive';
    if (usagePercent >= 70) return '[&>div]:bg-yellow-500';
    return '';
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudents(prev => [...prev, student]);
  };

  const handleStudentRemove = (studentId: number) => {
    setSelectedStudents(prev => prev.filter(student => student.id !== studentId));
  };

  const handleParentSelect = (studentId: number, parent: Parent) => {
    setSelectedStudents(prev => prev.map(student =>
      student.id === studentId
        ? { ...student, selectedParent: parent }
        : student
    ));
  };

  const replaceVariables = (text: string, student?: Student) => {
    let processed = text;
    const today = new Date().toLocaleDateString('pt-BR');
    processed = processed.replace(/\{\{DATA_HOJE\}\}/g, today);

    if (student && student.selectedParent) {
      const parent = student.selectedParent;
      processed = processed.replace(/\{\{NOME_ALUNO\}\}/g, student.name || '[Nome do Aluno]');
      processed = processed.replace(/\{\{NOME_RESPONSAVEL\}\}/g, parent.name || '[Nome do Responsável]');
      processed = processed.replace(/\{\{CPF_RESPONSAVEL\}\}/g, parent.cpf || '[CPF do Responsável]');
      processed = processed.replace(/\{\{TELEFONE_RESPONSAVEL\}\}/g, parent.phone || '[Telefone do Responsável]');
      processed = processed.replace(/\{\{EMAIL_RESPONSAVEL\}\}/g, parent.email || '[Email do Responsável]');

      const nomePai = student.parents.find(p => p.type === 'Pai')?.name || '[Nome do Pai]';
      const nomeMae = student.parents.find(p => p.type === 'Mãe')?.name || '[Nome da Mãe]';
      processed = processed.replace(/\{\{NOME_PAI\}\}/g, nomePai);
      processed = processed.replace(/\{\{NOME_MAE\}\}/g, nomeMae);
    }
    return processed;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!selectedWhatsAppTemplate) {
      toast({ title: "Template não selecionado", description: "Escolha um template de mensagem.", variant: "destructive" });
      return;
    }
    if (!diversosText.trim()) {
      toast({ title: "Mensagem vazia", description: "Preencha o texto da mensagem.", variant: "destructive" });
      return;
    }
    if (selectedStudents.length === 0) {
      toast({ title: "Nenhum aluno selecionado", description: "Selecione pelo menos um aluno.", variant: "destructive" });
      return;
    }
    if (selectedWhatsAppTemplate.acceptsMedia && diversosFiles.length === 0) {
      toast({ title: "Mídia obrigatória", description: "Este template requer um arquivo de mídia.", variant: "destructive" });
      return;
    }
    if (selectedWhatsAppTemplate.acceptsLink && !diversosLink.trim()) {
      toast({ title: "Link obrigatório", description: "Este template requer uma URL.", variant: "destructive" });
      return;
    }

    // Calcular total de mensagens que serão enviadas
    const totalMessages = selectedStudents.reduce((acc, student) => {
      const parents = student.selectedParents && student.selectedParents.length > 0
        ? student.selectedParents
        : student.selectedParent ? [student.selectedParent] : [];
      return acc + parents.length;
    }, 0);

    if (messageUsage && (messageUsage.messages_sent + totalMessages) > messageUsage.max_messages) {
      toast({
        title: "Limite de mensagens atingido",
        description: `Você tem ${messageUsage.max_messages - messageUsage.messages_sent} mensagens restantes neste período, mas está tentando enviar ${totalMessages}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      toast({ title: "Processando...", description: "Enviando mensagens..." });

      let mediaUrl: string | undefined;

      if (selectedWhatsAppTemplate.acceptsMedia && diversosFiles.length > 0) {
        const file = diversosFiles[0];
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `whatsapp-media/${timestamp}_${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from('zampieri')
          .upload(filePath, file, { contentType: file.type, upsert: false });

        if (uploadError) throw new Error(`Erro ao fazer upload: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage.from('zampieri').getPublicUrl(filePath);
        mediaUrl = publicUrlData.publicUrl;
      }

      const arquivosBase64 = selectedWhatsAppTemplate.acceptsMedia
        ? []
        : await Promise.all(
            diversosFiles.map(async (file) => ({
              nome: file.name, tipo: file.type, tamanho: file.size,
              base64: await fileToBase64(file),
            }))
          );

      const alunos = selectedStudents.flatMap(student => {
        const processedText = replaceVariables(diversosText, student);
        const parents = student.selectedParents && student.selectedParents.length > 0
          ? student.selectedParents
          : student.selectedParent ? [student.selectedParent] : [];

        return parents.map(parent => ({
          texto: processedText,
          nomeAluno: student.name,
          codigoAluno: student.id,
          nomeResponsavel: parent.name || '',
          cpfResponsavel: parent.cpf || '',
          whatsapp: parent.phone || '',
        }));
      });

      const payload: Record<string, unknown> = {
        alunos,
        arquivos: arquivosBase64,
        template: selectedWhatsAppTemplate.templateName || "recado_geral",
      };
      if (mediaUrl) payload.mediaUrl = mediaUrl;
      if (selectedWhatsAppTemplate.acceptsLink && diversosLink) payload.link = diversosLink;

      const { data: fnData, error: fnError } = await supabase.functions.invoke('send-whatsapp', { body: payload });

      if (fnError) throw new Error(fnError.message || 'Erro ao enviar');
      if (fnData && !fnData.success) throw new Error(fnData.error || 'Erro ao enviar');

      // Incrementar contador
      await supabase.rpc('increment_message_count', { count: totalMessages });
      await fetchMessageUsage();

      toast({
        title: "Mensagens enviadas!",
        description: `${totalMessages} mensagem(ns) enviada(s) com sucesso!`,
      });

      setDiversosText('');
      setDiversosFiles([]);
      setDiversosLink('');
      setSelectedWhatsAppTemplate(null);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const allParentsSelected = selectedStudents.length > 0 && selectedStudents.every(s => s.selectedParent);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
          >
            <LogOut className="mr-1 h-4 w-4" />
            Sair
          </Button>
          <div className="flex items-center gap-4 mb-6">
            <img
              src="/lovable-uploads/f23dd2df-3cc1-4994-b227-eb27c08bb994.png"
              alt="Colégio Zampieri Logo"
              className="h-16 w-16 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Envio de Mensagens
              </h1>
              <p className="text-muted-foreground">
                Colégio Zampieri — Comunicação com responsáveis
              </p>
            </div>
          </div>

          {/* Barra de uso — sempre visível */}
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Mensagens no período</span>
              </div>
              <span className={`text-sm font-bold ${usageError ? 'text-destructive' : messageUsage ? getUsageColor() : 'text-muted-foreground'}`}>
                {isUsageLoading
                  ? 'Carregando...'
                  : usageError
                    ? usageError
                    : messageUsage
                      ? `${messageUsage.messages_sent.toLocaleString()} / ${messageUsage.max_messages.toLocaleString()}`
                      : '—'}
              </span>
            </div>
            <Progress value={messageUsage ? usagePercent : 0} className={`h-2 ${getProgressClass()}`} />
            {isLimitReached && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-destructive/10 rounded-md">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">
                  Limite atingido. O envio está bloqueado até o próximo período (dia 15).
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Passo 1: Selecionar Aluno */}
          <Card className="shadow-card animate-slide-up">
            <CardHeader className="bg-gradient-card rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                Selecionar Aluno(s)
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

          {/* Aviso se falta selecionar responsável */}
          {selectedStudents.length > 0 && !allParentsSelected && (
            <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg animate-slide-up">
              <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-foreground">
                Selecione um responsável para cada aluno antes de continuar.
              </p>
            </div>
          )}

          {/* Passo 2: Escolher Template */}
          {allParentsSelected && (
            <Card className="shadow-card animate-slide-up">
              <CardHeader className="bg-gradient-card rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                  Escolher Template
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <WhatsAppTemplateSelector
                  selectedTemplate={selectedWhatsAppTemplate}
                  onTemplateSelect={setSelectedWhatsAppTemplate}
                />
              </CardContent>
            </Card>
          )}

          {/* Passo 3: Preencher e Enviar */}
          {allParentsSelected && selectedWhatsAppTemplate && (
            <Card className="shadow-card animate-slide-up">
              <CardHeader className="bg-gradient-card rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                  Preencher e Enviar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <RichTextEditor
                  value={diversosText}
                  onChange={setDiversosText}
                />

                {selectedWhatsAppTemplate.acceptsLink && (
                  <div>
                    <Label htmlFor="diversosLink" className="mb-2 block">URL do Link</Label>
                    <Input
                      id="diversosLink"
                      type="url"
                      placeholder="https://exemplo.com"
                      value={diversosLink}
                      onChange={(e) => setDiversosLink(e.target.value)}
                    />
                  </div>
                )}

                {selectedWhatsAppTemplate.acceptsMedia && (
                  <div>
                    <Label htmlFor="diversosFiles" className="mb-2 block">
                      Anexar Mídia (1 arquivo: JPG, PNG, PDF ou vídeo)
                    </Label>
                    <Input
                      id="diversosFiles"
                      type="file"
                      accept="image/jpeg,image/png,application/pdf,video/mp4,video/quicktime,video/x-msvideo,video/webm"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          const file = files[0];
                          const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
                          if (!allowedTypes.includes(file.type)) {
                            toast({ title: "Tipo não permitido", description: "Apenas JPG, PNG, PDF e vídeos.", variant: "destructive" });
                            e.target.value = '';
                            return;
                          }
                          setDiversosFiles([file]);
                        }
                      }}
                    />
                    {diversosFiles.length > 0 && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <strong>Arquivo:</strong> {diversosFiles[0].name}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-primary hover:opacity-90 transition-smooth"
                  onClick={handleSend}
                  disabled={isSending || isLimitReached}
                >
                  <Send className="h-4 w-4" />
                  {isSending ? 'Enviando...' : 'Enviar via SMS'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
