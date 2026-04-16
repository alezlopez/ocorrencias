

## Reformulação UX — Sistema de Mensagens

### Resumo
Remover a aba "Ocorrências", simplificar o fluxo para apenas mensagens (Diversos), adicionar sistema de contagem de mensagens com limite de 4.000 por período (reset dia 15), e melhorar a UX geral.

### 1. Criar tabela de contagem de mensagens

Nova migration para criar tabela `message_usage`:

```sql
CREATE TABLE public.message_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL,
  period_end date NOT NULL,
  messages_sent integer NOT NULL DEFAULT 0,
  max_messages integer NOT NULL DEFAULT 4000,
  created_at timestamptz DEFAULT now(),
  UNIQUE(period_start)
);

ALTER TABLE public.message_usage ENABLE ROW LEVEL SECURITY;

-- RLS: admins podem ler e atualizar
CREATE POLICY "Admins can manage message_usage"
  ON public.message_usage FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

Criar função para obter/incrementar contagem do período atual:

```sql
CREATE OR REPLACE FUNCTION public.get_current_message_period()
RETURNS TABLE(period_start date, period_end date, messages_sent integer, max_messages integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p_start date;
  p_end date;
BEGIN
  -- Período: dia 15 do mês atual até dia 14 do próximo mês
  IF EXTRACT(DAY FROM CURRENT_DATE) >= 15 THEN
    p_start := date_trunc('month', CURRENT_DATE) + interval '14 days';
    p_end := (date_trunc('month', CURRENT_DATE) + interval '1 month' + interval '14 days')::date;
  ELSE
    p_start := (date_trunc('month', CURRENT_DATE) - interval '1 month' + interval '14 days')::date;
    p_end := (date_trunc('month', CURRENT_DATE) + interval '14 days')::date;
  END IF;

  -- Criar registro se não existir
  INSERT INTO message_usage (period_start, period_end)
  VALUES (p_start, p_end)
  ON CONFLICT (period_start) DO NOTHING;

  RETURN QUERY SELECT mu.period_start, mu.period_end, mu.messages_sent, mu.max_messages
  FROM message_usage mu WHERE mu.period_start = p_start;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_message_count(count integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p_start date;
BEGIN
  IF EXTRACT(DAY FROM CURRENT_DATE) >= 15 THEN
    p_start := date_trunc('month', CURRENT_DATE) + interval '14 days';
  ELSE
    p_start := (date_trunc('month', CURRENT_DATE) - interval '1 month' + interval '14 days')::date;
  END IF;
  UPDATE message_usage SET messages_sent = messages_sent + count WHERE period_start = p_start;
END;
$$;
```

### 2. Remover Ocorrências do `ContractEditor.tsx`

- Remover o botão "Ocorrências" e toda a lógica associada (seleção de template de contrato, envio para ZapSign, preview de contrato)
- Remover imports não utilizados: `TemplateSelector`, `ContractPreview`, `ContractTemplates`, `html2pdf`
- Remover states: `selectedTemplate`, `contractData`, `isPreviewOpen`, `documentType`
- O fluxo passa direto: seleção de aluno → template WhatsApp → preencher mensagem → enviar

### 3. Redesign da UX no `ContractEditor.tsx`

- **Header**: Atualizar título para "Envio de Mensagens" com subtítulo limpo
- **Barra de uso**: Adicionar componente visual (progress bar) mostrando "X de 4.000 mensagens usadas" com cor que muda (verde → amarelo → vermelho)
- **Fluxo simplificado em 3 passos** (sem seleção de tipo de documento):
  1. Selecionar Aluno(s)
  2. Escolher Template
  3. Preencher e Enviar
- **Bloquear envio** quando limite atingido, mostrando alerta
- **Incrementar contador** após envio bem-sucedido (quantidade = número de alunos no payload)

### 4. Arquivos alterados

| Arquivo | Ação |
|---------|------|
| `src/components/ContractEditor.tsx` | Refatorar: remover ocorrências, simplificar fluxo, adicionar barra de uso |
| `src/components/TemplateSelector.tsx` | Pode ser removido (não mais utilizado) |
| `src/components/ContractTemplates.ts` | Pode ser removido |
| `src/components/ContractPreview.tsx` | Pode ser removido |
| `src/components/TimbradoA4.tsx` | Pode ser removido |
| Migration | Criar tabela `message_usage` + funções SQL |

### 5. Resultado esperado

- Interface mais limpa com apenas 3 passos
- Barra de progresso de mensagens visível no topo
- Bloqueio automático ao atingir 4.000 mensagens por período
- Reset automático a cada dia 15

