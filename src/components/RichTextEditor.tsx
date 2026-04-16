import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, User, UserCheck } from "lucide-react";
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

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variable.length + 1;
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

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= 250) {
              onChange(e.target.value);
            }
          }}
          placeholder="Digite o conteúdo da mensagem..."
          className="min-h-[200px] font-sans text-base leading-relaxed"
          maxLength={250}
          dir="ltr"
          style={{ direction: "ltr", textAlign: "left" }}
        />
        <div className="text-xs text-muted-foreground text-right">
          {value.length}/250 caracteres
        </div>
      </CardContent>
    </Card>
  );
};
