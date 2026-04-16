

## Enviar código do aluno no payload do webhook

### O que será feito

Adicionar o campo `codigoAluno` no array `alunos` do payload enviado para a Edge Function `send-whatsapp`, que por sua vez repassa para o webhook n8n.

### Alteração

**Arquivo: `src/components/ContractEditor.tsx` (linha ~213)**

No trecho que monta o array `alunos`, adicionar `codigoAluno: student.id` (o campo `codigo_aluno` já está disponível no objeto do aluno selecionado):

```typescript
return parents.map(parent => ({
  texto: processedText,
  nomeAluno: student.name,
  codigoAluno: student.id,  // <-- novo campo
  nomeResponsavel: parent.name || '',
  cpfResponsavel: parent.cpf || '',
  whatsapp: parent.phone || '',
}));
```

A Edge Function `send-whatsapp` já repassa o payload inteiro para o webhook n8n via `JSON.stringify(payload)`, então o campo chegará automaticamente sem precisar alterar a function.

### Verificação necessária

Confirmar qual propriedade do objeto `student` contém o código do aluno (provavelmente `student.id` que mapeia para `codigo_aluno` da tabela `alunos_26`).

