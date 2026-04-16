

## Remover preview e textos de ajuda dos templates

### Alterações

1. **`src/components/WhatsAppTemplateSelector.tsx`** — Remover a descrição de cada template (linha 78)

2. **`src/components/TemplateSelector.tsx`** — Remover a descrição de cada template (linhas 35-37) e o bloco de ajuda inferior "Modelo selecionado / variáveis preenchidas automaticamente" (linhas 50-58)

3. **`src/components/ContractEditor.tsx`** — Remover o WhatsAppPreview do formulário Diversos (linhas 582-590), ajustando o grid para coluna única. Também remover o bloco "Preview do Documento" das Ocorrências (linhas 661-694)

### Resultado
Os seletores de template ficam mais limpos, mostrando apenas nome, ícone e badge. O preview do WhatsApp e o preview do documento de ocorrências são removidos.

