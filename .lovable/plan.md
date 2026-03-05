

## Migrar de `alunos_comunicados_whatsapp` para `alunos_26`

### Mapeamento de campos

| alunos_comunicados_whatsapp | alunos_26 | Observação |
|---|---|---|
| `nome_do_aluno` | `nome_aluno` | Nome diferente |
| `turma` | `curso` | Campo equivalente |
| `nome_da_mae` | `nome_mae` | Nome diferente |
| `cpf_mae` | `cpf_mae` | Igual |
| `ddd_mae` + `celular_mae` | `telefone_mae` | Telefone já completo em alunos_26 |
| `nome_pai` | `nome_pai` | Igual |
| `cpf_pai` | `cpf_pai` | Igual |
| `ddd_pai` + `celular_pai` | `celular_pai` | Telefone já completo em alunos_26 |
| `codigo_aluno` | `codigo_aluno` | Igual |

### Alterações em `src/components/StudentSearch.tsx`

1. **Busca de turmas**: Trocar `.from('alunos_comunicados_whatsapp')` para `.from('alunos_26')` e `.select('turma')` para `.select('curso')`, renomear referências de `turma` para `curso`

2. **Busca individual de alunos**: Trocar tabela e campo de busca de `nome_do_aluno` para `nome_aluno`

3. **Busca por turma**: Trocar tabela e campo `.eq('turma', turma)` para `.eq('curso', turma)`

4. **Mapeamento de dados dos pais**: Simplificar telefone - não precisa mais concatenar DDD + celular, pois `telefone_mae` e `celular_pai` já vêm completos na tabela `alunos_26`

5. **Nomes dos campos**: Atualizar `item.nome_do_aluno` para `item.nome_aluno`, `item.nome_da_mae` para `item.nome_mae`

### Resultado
O sistema passará a buscar todos os dados de alunos e responsáveis da tabela `alunos_26`, mantendo toda a funcionalidade existente (busca individual, seleção por turma, priorização de mãe).

