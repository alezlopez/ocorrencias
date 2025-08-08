import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { CONTRACT_TEMPLATES, ContractTemplate } from './ContractTemplates';

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onTemplateSelect: (template: ContractTemplate) => void;
}

export const TemplateSelector = ({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        Selecione um Modelo
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CONTRACT_TEMPLATES.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-accent/50'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                {template.description}
              </p>
              <Button 
                variant={selectedTemplate === template.id ? "default" : "outline"}
                size="sm" 
                className="w-full"
              >
                {selectedTemplate === template.id ? 'Selecionado' : 'Selecionar'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedTemplate && (
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-primary font-medium">
            ✓ Modelo selecionado: {CONTRACT_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            As variáveis serão preenchidas automaticamente com os dados do aluno selecionado.
          </p>
        </div>
      )}
    </div>
  );
};