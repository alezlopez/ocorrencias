

## Seletor de Templates WhatsApp com suporte a tipos diferentes

### Contexto
O usuário quer preparar o sistema para múltiplos templates da API oficial do WhatsApp, cada um com capacidades diferentes: **só texto**, **texto + mídia**, **texto + link**. Hoje só tem o "recado_geral" (só texto), mas quer a estrutura pronta.

### O que será feito

1. **Novo arquivo `src/components/WhatsAppTemplates.ts`** — definição dos templates WhatsApp com tipagem que inclui: `id`, `name`, `description`, `type` (enum: `text` | `media` | `link`), `templateName` (nome no Facebook), `bodyText` (texto fixo do template com `{{1}}` como placeholder), e flags como `acceptsMedia`, `acceptsLink`.

   Templates iniciais:
   - `recado_geral` — tipo `text`, sem mídia, sem link (o que já existe)
   - `recado_midia` — tipo `media`, aceita imagem/PDF (placeholder para quando aprovar)
   - `recado_link` — tipo `link`, aceita URL com preview (placeholder para quando aprovar)

2. **Novo componente `src/components/WhatsAppTemplateSelector.tsx`** — cards visuais para selecionar o template, cada um com:
   - Ícone distinto por tipo (MessageSquare para texto, Image para mídia, Link para link)
   - Badge colorido indicando o tipo
   - Indicação visual de "disponível" vs "em breve" (templates ainda não aprovados)
   - Ao selecionar, condiciona o formulário: se `text`, esconde upload de arquivo; se `media`, mostra upload obrigatório; se `link`, mostra campo de URL

3. **Editar `src/components/ContractEditor.tsx`** — na seção "Diversos":
   - Adicionar o `WhatsAppTemplateSelector` como passo intermediário (entre seleção de aluno e editor)
   - Condicionar exibição do campo de anexo e campo de URL conforme o tipo do template selecionado
   - Incluir o `templateName` selecionado no payload (`template: selectedWhatsAppTemplate.templateName`)
   - Se tipo `text`, esconder o input de arquivos (o template não aceita mídia)

4. **Ajustar `WhatsAppPreview`** — se o template for de mídia, mostrar um placeholder de imagem no balão; se for de link, mostrar um preview de link estilo WhatsApp (card com URL)

### Layout do seletor

```text
┌─────────────────────────────────────────────┐
│  3. Escolher Template WhatsApp              │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ 💬 Texto │ │ 🖼 Mídia │ │ 🔗 Link  │    │
│  │          │ │          │ │          │    │
│  │ Recado   │ │ Recado + │ │ Recado + │    │
│  │ Geral    │ │ Imagem   │ │ Link     │    │
│  │          │ │ EM BREVE │ │ EM BREVE │    │
│  │[Selecio.]│ │[Indispon]│ │[Indispon]│    │
│  └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────┘
```

### Arquivos
- **Criar** `src/components/WhatsAppTemplates.ts` — definição de templates e tipos
- **Criar** `src/components/WhatsAppTemplateSelector.tsx` — componente de seleção visual
- **Editar** `src/components/ContractEditor.tsx` — integrar seletor no fluxo Diversos, condicionar campos
- **Editar** `src/components/WhatsAppPreview.tsx` — suporte visual para tipos mídia e link

