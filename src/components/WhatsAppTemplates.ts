export type WhatsAppTemplateType = 'text' | 'media' | 'link';

export interface WhatsAppTemplate {
  id: string;
  name: string;
  description: string;
  type: WhatsAppTemplateType;
  templateName: string; // Nome no Facebook Business
  bodyText: string; // Texto do template com {{1}} como placeholder
  acceptsMedia: boolean;
  acceptsLink: boolean;
  available: boolean; // Se já foi aprovado no Facebook
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'recado_geral',
    name: 'Recado Geral',
    description: 'Mensagem de texto simples sem anexos ou links.',
    type: 'text',
    templateName: 'recado_geral',
    bodyText: `Olá, tudo bem? 😁

*Temos um novo recado para você.*

{{1}}

Atenciosamente,

Coordenação do Colégio Zampieri.`,
    acceptsMedia: false,
    acceptsLink: false,
    available: true,
  },
  {
    id: 'recado_midia',
    name: 'Recado + Imagem',
    description: 'Mensagem com imagem ou PDF anexado.',
    type: 'media',
    templateName: 'recado_midia',
    bodyText: `Olá, tudo bem? 😁

*Temos um novo recado para você.*

{{1}}

Atenciosamente,

Coordenação do Colégio Zampieri.`,
    acceptsMedia: true,
    acceptsLink: false,
    available: false,
  },
  {
    id: 'recado_link',
    name: 'Recado + Link',
    description: 'Mensagem com botão de link clicável.',
    type: 'link',
    templateName: 'recado_link',
    headerText: 'Comunicado Importante',
    bodyText: `Olá, tudo bem? 😊

{{1}}

Clique no botão abaixo 👇
Você será direcionado para o google formulário.`,
    buttonText: 'Acessar',
    acceptsMedia: false,
    acceptsLink: true,
    available: true,
  },
];
