export type WhatsAppTemplateType = 'text' | 'media' | 'link';

export interface WhatsAppTemplate {
  id: string;
  name: string;
  description: string;
  type: WhatsAppTemplateType;
  templateName: string;
  headerText?: string;
  bodyText: string;
  buttonText?: string;
  acceptsMedia: boolean;
  acceptsLink: boolean;
  available: boolean;
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
    name: 'Recado + Mídia',
    description: 'Mensagem com imagem, vídeo ou PDF anexado e botão de acesso.',
    type: 'media',
    templateName: 'recado_midia',
    bodyText: `Olá, tudo bem? 😊

{{1}}

Clique no botão abaixo👇
Nossas midias ficam hospedadas em nosso servidor`,
    buttonText: 'Acessar conteúdo',
    acceptsMedia: true,
    acceptsLink: false,
    available: true,
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
