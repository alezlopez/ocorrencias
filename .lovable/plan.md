

## Remover Opção "Atas" do Tipo de Documento

### Resumo
Remover o botão "Atas" da seleção de tipo de documento, mantendo apenas "Ocorrências" e "Diversos".

### Alterações no arquivo `src/components/ContractEditor.tsx`

1. **Atualizar o tipo do estado `documentType`**
   - Remover `'atas'` das opções permitidas
   - De: `'ocorrencias' | 'atas' | 'diversos' | null`
   - Para: `'ocorrencias' | 'diversos' | null`

2. **Remover o botão "Atas"**
   - Excluir o `<Button>` com texto "Atas" da seção de seleção de tipo de documento

3. **Remover a mensagem condicional de Atas**
   - Excluir o bloco `{documentType === 'atas' && (...)}` que exibe a mensagem sobre modelos de Atas

### Resultado
A interface mostrará apenas dois botões na seção "Tipo de Documento":
- **Ocorrências** - para envio de ocorrências com modelos pré-definidos
- **Diversos** - para envio de documentos diversos com texto livre e anexos

