
Resumo

Vou corrigir isso em duas frentes: banco e interface. A causa raiz já está identificada no Supabase: o RPC `get_current_message_period()` está quebrando no banco antes mesmo de retornar dados, então o frontend fica preso em “Carregando...”.

Causa raiz confirmada

Ao validar diretamente no Supabase, a função falha com este erro:

```text
ERROR: column reference "period_start" is ambiguous
CONTEXT: PL/pgSQL function get_current_message_period() line 14 at SQL statement
```

Isso acontece porque a função usa `RETURNS TABLE(period_start, period_end, ...)`, e esses nomes viram variáveis internas do PL/pgSQL. Dentro do `INSERT ... ON CONFLICT (period_start)`, o Postgres passa a enxergar `period_start` como ambíguo entre:
- a coluna da tabela `message_usage`
- a variável de saída da própria função

Ou seja: o problema principal não é a policy RLS em si, e sim a função SQL quebrada.

O que vou implementar

1. Corrigir definitivamente as funções do contador no banco
- Reescrever `get_current_message_period()`
- Reescrever `increment_message_count(count integer)`
- Usar nomes internos sem colisão, por exemplo:
  - `v_period_start`
  - `v_period_end`
- Trocar `ON CONFLICT (period_start)` por `ON CONFLICT ON CONSTRAINT ...` para eliminar ambiguidade
- Garantir que `increment_message_count()` crie/garanta o período antes de atualizar, evitando update sem linha

2. Revisar e ajustar a segurança/RLS do contador
- Manter a tabela `message_usage` protegida por RLS
- Confirmar que o acesso direto à tabela continue restrito
- Como as funções são `SECURITY DEFINER`, elas podem consultar/atualizar a tabela sem depender da policy do usuário final
- Restringir `EXECUTE` das funções para `authenticated` em vez de deixar exposto a `PUBLIC`, para ficar consistente com o sistema administrativo

3. Corrigir o comportamento do frontend
No `ContractEditor.tsx`:
- separar estados:
  - `messageUsage`
  - `isUsageLoading`
  - `usageError`
- parar de deixar `null` significar “carregando para sempre”
- mostrar 3 estados visuais corretos:
  - carregando
  - carregado com números
  - erro ao carregar
- se o RPC falhar, exibir mensagem clara no cabeçalho em vez de “Carregando...” eterno

4. Melhorar a robustez do envio
- Após envio bem-sucedido, continuar incrementando o contador
- Se a atualização do contador falhar, mostrar erro explícito
- Recarregar o contador após envio com tratamento de erro real

Arquivos que serão alterados

- `supabase/migrations/...sql`
  - correção das funções
  - ajuste de permissões `EXECUTE`
- `src/components/ContractEditor.tsx`
  - tratamento real de loading/erro do contador
  - cabeçalho sempre visível sem loop infinito de loading

Resultado esperado

- O contador aparece no cabeçalho de forma confiável
- O período atual é criado automaticamente no banco
- O contador deixa de ficar eternamente carregando
- O bloqueio de limite volta a funcionar com base em dados reais
- A tabela continua protegida por RLS, mas as funções passam a operar corretamente

Detalhes técnicos

Banco:
```text
message_usage
  RLS: mantida
  acesso direto: restrito
  leitura/escrita do contador: via SECURITY DEFINER
```

Fluxo final:
```text
Tela abre
  -> frontend chama get_current_message_period()
  -> função garante linha do período atual
  -> retorna messages_sent + max_messages
  -> cabeçalho mostra contador

Ao enviar mensagem
  -> send-whatsapp
  -> increment_message_count(total)
  -> refetch do contador
```

Validação que vou fazer depois da implementação

- abrir a tela e confirmar que o cabeçalho mostra os números
- validar que o RPC retorna uma linha do período atual
- enviar uma mensagem e confirmar incremento
- simular erro do RPC e verificar fallback visual sem loading infinito
- conferir que usuário não autenticado não consegue executar o RPC
