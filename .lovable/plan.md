

## Priorizar Mãe na seleção de Turma Completa

### Regra
Na seleção por turma completa, selecionar **apenas a Mãe**. Selecionar o Pai **somente** quando a Mãe não tiver telefone cadastrado.

### Alterações

**Arquivo:** `src/components/StudentSearch.tsx` — linhas 168-177

Substituir a lógica atual (que seleciona todos os pais válidos) por:

```typescript
const mae = parents.find(p => p.type === 'Mãe');
const pai = parents.find(p => p.type === 'Pai');

// Priorizar mãe; usar pai somente se mãe não tiver telefone
const selectedParent = (mae && mae.phone) ? mae : (pai && pai.phone) ? pai : mae || pai || null;

return {
  id: parseInt(item.codigo_aluno),
  name: item.nome_aluno,
  parents: parents,
  selectedParent: selectedParent,
  selectedParents: selectedParent ? [selectedParent] : []
};
```

Isso garante que cada aluno tenha apenas **um** responsável selecionado (mãe por padrão, pai como fallback), gerando uma única entrada no payload.

