## Adicionar Preview de Template WhatsApp no fluxo "Diversos"

### Contexto

O usuário migrou para a API oficial do WhatsApp e tem um template aprovado no Facebook com a estrutura fixa:

```text
Olá, tudo bem? 😁

*Temos um novo recado para você.*

{{1}}

Atenciosamente,

Coordenação do Colégio Zampieri.
```

O usuário só precisa digitar o conteúdo que vai no `{{1}}` — saudação e despedida já fazem parte do template.

### O que muda

1. **Componente `WhatsAppPreview**` (novo) — simula visualmente uma mensagem de WhatsApp (balão verde, estilo mobile) mostrando o template completo com o texto digitado pelo usuário no lugar de `{{1}}`. Atualiza em tempo real conforme o usuário digita. Também substitui variáveis como `{{NOME_ALUNO}}` com dados reais do primeiro aluno selecionado para o preview ficar realista.
2. **Ajuste no `RichTextEditor**` — atualizar o placeholder para deixar claro que o usuário deve digitar apenas o conteúdo da mensagem (sem saudação/despedida).
3. **Ajuste no `ContractEditor**` — na seção "Diversos", exibir o `WhatsAppPreview` ao lado (desktop) ou abaixo (mobile) do editor de texto, criando um layout side-by-side. O preview mostra em tempo real como a mensagem final ficará no WhatsApp do responsável.
4. **Payload de envio** — no `handleSendDiversos`, o campo `texto` enviado ao webhook passa a conter apenas o conteúdo digitado (sem o template wrapper), já que o template é aplicado pela API oficial do WhatsApp. O webhook receberá um campo adicional `template: "recado_geral"` (ou nome do template) para indicar qual template usar na API.
5. Este template em especifico não aceita midia

### Estrutura do layout (seção Diversos)

```text
┌─────────────────────────────────────────────┐
│  3. Preencher Mensagem                      │
├──────────────────────┬──────────────────────┤
│  Editor de texto     │  Preview WhatsApp    │
│  (textarea)          │  ┌──────────────┐    │
│                      │  │ Olá, tudo... │    │
│                      │  │              │    │
│                      │  │ [texto aqui] │    │
│                      │  │              │    │
│                      │  │ Atenciosam.. │    │
│                      │  └──────────────┘    │
├──────────────────────┴──────────────────────┤
│  Anexar Documentos (opcional)               │
│  [Enviar]                                   │
└─────────────────────────────────────────────┘
```

### Arquivos

- **Criar** `src/components/WhatsAppPreview.tsx` — componente de preview visual estilo WhatsApp
- **Editar** `src/components/ContractEditor.tsx` — layout side-by-side na seção Diversos + ajuste no payload
- **Editar** `src/components/RichTextEditor.tsx` — placeholder mais claro