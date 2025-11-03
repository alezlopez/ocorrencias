import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Type,
  Plus,
  User,
  UserCheck,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onPreview?: () => void;
}

export const RichTextEditor = ({ value, onChange, onPreview }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Forçar LTR e prevenir auto-detecção
  React.useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.style.direction = 'ltr';
      editor.style.unicodeBidi = 'plaintext';
      editor.setAttribute('dir', 'ltr');
      
      // Observer para forçar LTR em todos os elementos criados dinamicamente
      const observer = new MutationObserver(() => {
        const allElements = editor.querySelectorAll('*');
        allElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.removeAttribute('dir');
            el.style.direction = 'ltr';
          }
        });
      });
      
      observer.observe(editor, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['dir']
      });
      
      return () => observer.disconnect();
    }
  }, []);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      // Forçar LTR após comandos
      const editor = editorRef.current;
      editor.style.direction = 'ltr';
      
      // Remover dir="rtl" de todos os elementos
      const allElements = editor.querySelectorAll('[dir="rtl"]');
      allElements.forEach(el => {
        el.removeAttribute('dir');
        if (el instanceof HTMLElement) {
          el.style.direction = 'ltr';
        }
      });
      
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertVariable = (variable: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const span = document.createElement('span');
      span.className = 'bg-primary/10 text-primary px-2 py-1 rounded font-medium';
      span.textContent = variable;
      
      // Adicionar espaço depois da variável
      const space = document.createTextNode('\u00A0');
      
      range.insertNode(span);
      range.setStartAfter(span);
      range.collapse(true);
      range.insertNode(space);
      
      // Posicionar cursor após o espaço
      range.setStartAfter(space);
      range.setEndAfter(space);
      selection.removeAllRanges();
      selection.addRange(range);
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const editor = editorRef.current;
      
      // Garantir LTR durante digitação
      editor.style.direction = 'ltr';
      
      // Remover qualquer dir="rtl" adicionado pelo navegador
      const allElements = editor.querySelectorAll('[dir="rtl"]');
      allElements.forEach(el => {
        el.removeAttribute('dir');
        if (el instanceof HTMLElement) {
          el.style.direction = 'ltr';
        }
      });
      
      onChange(editor.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevenir comandos que podem adicionar RTL
    if (e.ctrlKey || e.metaKey) {
      if (e.shiftKey && (e.key === 'X' || e.key === 'x')) {
        // Ctrl+Shift+X pode adicionar RTL em alguns navegadores
        e.preventDefault();
      }
    }
  };

  const fontSizes = [
    { label: 'Pequeno', value: '1' },
    { label: 'Normal', value: '3' },
    { label: 'Grande', value: '5' },
    { label: 'Muito Grande', value: '7' }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Editor de Contrato</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-accent rounded-lg">
          {/* Font Size */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Type className="h-4 w-4" />
                Tamanho
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {fontSizes.map((size) => (
                <DropdownMenuItem
                  key={size.value}
                  onClick={() => executeCommand('fontSize', size.value)}
                >
                  {size.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Formatting */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('underline')}
          >
            <Underline className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyLeft')}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyCenter')}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyRight')}
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('insertUnorderedList')}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('insertOrderedList')}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Variables */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Variáveis
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background z-50">
              <DropdownMenuItem
                onClick={() => insertVariable('{{NOME_ALUNO}}')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Nome do Aluno
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertVariable('{{NOME_PAI}}')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Nome do Pai
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertVariable('{{NOME_MAE}}')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Nome da Mãe
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertVariable('{{NOME_RESPONSAVEL}}')}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Nome do Responsável
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertVariable('{{CPF_RESPONSAVEL}}')}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                CPF do Responsável
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertVariable('{{TELEFONE_RESPONSAVEL}}')}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Telefone do Responsável
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertVariable('{{EMAIL_RESPONSAVEL}}')}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Email do Responsável
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertVariable('{{DATA_HOJE}}')}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Data de Hoje
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {onPreview && (
            <>
              <Separator orientation="vertical" className="h-6" />
              
              {/* Preview Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onPreview}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </>
          )}
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          dangerouslySetInnerHTML={{ __html: value }}
          dir="ltr"
          className="min-h-[400px] p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 prose prose-sm max-w-none [&_*]:!direction-ltr"
          style={{
            lineHeight: '1.6',
            fontFamily: 'inherit',
            direction: 'ltr',
            textAlign: 'left',
            unicodeBidi: 'plaintext'
          }}
        />

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-accent/50 p-3 rounded">
          <p className="font-medium mb-1">Variáveis disponíveis:</p>
          <div className="grid grid-cols-2 gap-1">
            <p><code className="bg-background px-1 rounded">{'{{NOME_ALUNO}}'}</code> - Nome do aluno</p>
            <p><code className="bg-background px-1 rounded">{'{{NOME_PAI}}'}</code> - Nome do pai</p>
            <p><code className="bg-background px-1 rounded">{'{{NOME_MAE}}'}</code> - Nome da mãe</p>
            <p><code className="bg-background px-1 rounded">{'{{NOME_RESPONSAVEL}}'}</code> - Nome do responsável</p>
            <p><code className="bg-background px-1 rounded">{'{{CPF_RESPONSAVEL}}'}</code> - CPF do responsável</p>
            <p><code className="bg-background px-1 rounded">{'{{TELEFONE_RESPONSAVEL}}'}</code> - Telefone</p>
            <p><code className="bg-background px-1 rounded">{'{{EMAIL_RESPONSAVEL}}'}</code> - Email</p>
            <p><code className="bg-background px-1 rounded">{'{{DATA_HOJE}}'}</code> - Data atual</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};