import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Underline, Type, Plus, User, UserCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onPreview?: () => void;
}

export const RichTextEditor = ({ value, onChange, onPreview }: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + variable + " " + text.substring(end);
    onChange(newText);

    // Posicionar cursor após a variável
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variable.length + 1;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const applyFormatting = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (!selectedText) return;

    let formattedText = "";
    switch (tag) {
      case "bold":
        formattedText = `*${selectedText}*`;
        break;
      case "italic":
        formattedText = `_${selectedText}_`;
        break;
      case "underline":
        formattedText = `~${selectedText}~`;
        break;
      default:
        return;
    }

    const text = textarea.value;
    const newText = text.substring(0, start) + formattedText + text.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + formattedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Editor de texto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-accent rounded-lg">
          {/* Formatting */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormatting("bold")}
            title="Negrito (selecione o texto primeiro)"
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormatting("italic")}
            title="Itálico (selecione o texto primeiro)"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormatting("underline")}
            title="Sublinhado (selecione o texto primeiro)"
          >
            <Underline className="h-4 w-4" />
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
              <DropdownMenuItem onClick={() => insertVariable("{{NOME_ALUNO}}")} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome do Aluno
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertVariable("{{NOME_PAI}}")} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome do Pai
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertVariable("{{NOME_MAE}}")} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome da Mãe
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => insertVariable("{{DATA_HOJE}}")} className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Data de Hoje
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Editor - Textarea simples */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite o texto do documento aqui. Se necessário, use os botões acima para inserir variáveis."
          className="min-h-[400px] font-sans text-base leading-relaxed"
          dir="ltr"
          style={{ direction: "ltr", textAlign: "left" }}
        />

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-accent/50 p-3 rounded">
          <p className="font-medium mb-2">Como usar:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>Formatação:</strong> Selecione o texto e clique em Negrito, Itálico ou Sublinhado
            </li>
            <li>
              <strong>Variáveis:</strong> Clique no botão "Variáveis" para inserir dados dinâmicos
            </li>
          </ul>
          <p className="font-medium mt-3 mb-1">Variáveis disponíveis:</p>
          <div className="grid grid-cols-2 gap-1">
            <p>
              <code className="bg-background px-1 rounded">{"{{NOME_ALUNO}}"}</code> - Nome do aluno
            </p>
            <p>
              <code className="bg-background px-1 rounded">{"{{NOME_PAI}}"}</code> - Nome do pai
            </p>
            <p>
              <code className="bg-background px-1 rounded">{"{{NOME_MAE}}"}</code> - Nome da mãe
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
