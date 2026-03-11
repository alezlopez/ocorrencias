

## Selecionar pai e mãe por padrão na Turma Completa

### Problema atual
Quando se seleciona uma turma completa, o sistema escolhe apenas **um** responsável (prioriza mãe com telefone, depois pai). O usuário quer que **ambos** (pai e mãe) sejam incluídos para garantir todos os contatos.

### Abordagem

Alterar o modelo de dados de `selectedParent` (singular) para `selectedParents` (array), e ajustar toda a cadeia:

1. **Interfaces (`StudentSearch.tsx` e `ContractEditor.tsx`)**: Adicionar `selectedParents` como array de pais ao tipo `Student`, mantendo compatibilidade.

2. **`StudentSearch.tsx` — `selectTurmaStudents`** (linha ~171-179): Em vez de escolher um único `firstValidParent`, preencher `selectedParents` com **todos** os pais válidos (que tenham nome informado). Manter `selectedParent` como o primeiro da lista para compatibilidade com contratos.

3. **`ContractEditor.tsx` — `handleSendDiversos`** (linha ~367-377): Na montagem do array `alunos`, fazer um `flatMap` em vez de `map` — para cada student, gerar uma entrada por parent em `selectedParents`, cada um com seu próprio `nomeResponsavel`, `cpfResponsavel` e `whatsapp`.

4. **UI de alunos selecionados** (`StudentSearch.tsx` ~280-330): Exibir todos os responsáveis selecionados quando houver múltiplos, com opção de remover individualmente.

5. **Busca individual**: Mantém o comportamento atual (selecionar um responsável manualmente), sem mudanças.

### Arquivos a editar
- `src/components/StudentSearch.tsx` — interface Student, lógica de turma, UI de exibição
- `src/components/ContractEditor.tsx` — interface Student, payload flatMap, validações

### Resultado
Ao selecionar turma completa, cada aluno terá pai e mãe selecionados. No payload do webhook, cada aluno gerará **duas** entradas (uma por responsável com dados válidos), garantindo que ambos recebam a mensagem.

