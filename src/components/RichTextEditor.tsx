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
  UserCheck
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
}

export const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
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
      
      range.insertNode(span);
      range.setStartAfter(span);
      range.setEndAfter(span);
      selection.removeAllRanges();
      selection.addRange(range);
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
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
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => insertVariable('{{NOME_ALUNO}}')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Nome do Aluno
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertVariable('{{NOME_RESPONSAVEL}}')}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Nome do Responsável
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: value }}
          className="min-h-[400px] p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 prose prose-sm max-w-none"
          style={{
            lineHeight: '1.6',
            fontFamily: 'inherit'
          }}
        />

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-accent/50 p-3 rounded">
          <p className="font-medium mb-1">Variáveis disponíveis:</p>
          <p><code className="bg-background px-1 rounded">{'{{NOME_ALUNO}}'}</code> - Será substituído pelo nome do aluno</p>
          <p><code className="bg-background px-1 rounded">{'{{NOME_RESPONSAVEL}}'}</code> - Será substituído pelo nome do responsável</p>
        </div>
      </CardContent>
    </Card>
  );
};