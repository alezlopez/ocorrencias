import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Image, Link, FileText, Check } from 'lucide-react';
import { WhatsAppTemplate, WHATSAPP_TEMPLATES } from './WhatsAppTemplates';
import { cn } from '@/lib/utils';

interface WhatsAppTemplateSelectorProps {
  selectedTemplate: WhatsAppTemplate | null;
  onTemplateSelect: (template: WhatsAppTemplate) => void;
}

const typeConfig = {
  text: {
    icon: MessageSquare,
    badgeLabel: 'Só Texto',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  media: {
    icon: Image,
    badgeLabel: 'Mídia',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  link: {
    icon: Link,
    badgeLabel: 'Link',
    badgeClass: 'bg-violet-100 text-violet-700 border-violet-200',
  },
};

export const WhatsAppTemplateSelector = ({
  selectedTemplate,
  onTemplateSelect,
}: WhatsAppTemplateSelectorProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {WHATSAPP_TEMPLATES.map((template) => {
        const config = typeConfig[template.type];
        const Icon = config.icon;
        const isSelected = selectedTemplate?.id === template.id;
        const isDisabled = !template.available;

        return (
          <button
            key={template.id}
            onClick={() => !isDisabled && onTemplateSelect(template)}
            disabled={isDisabled}
            className={cn(
              'relative rounded-xl border-2 p-5 text-left transition-all duration-200',
              isDisabled
                ? 'opacity-50 cursor-not-allowed border-border bg-muted/30'
                : isSelected
                ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                : 'border-border bg-card hover:border-primary/40 hover:shadow-sm cursor-pointer'
            )}
          >
            {/* Selected check */}
            {isSelected && (
              <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}

            <div className="flex flex-col items-center text-center gap-3">
              <div
                className={cn(
                  'h-12 w-12 rounded-xl flex items-center justify-center',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-6 w-6" />
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm">{template.name}</h4>
                
              </div>

              <Badge variant="outline" className={cn('text-xs', config.badgeClass)}>
                {config.badgeLabel}
              </Badge>

              {isDisabled && (
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Em breve
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
