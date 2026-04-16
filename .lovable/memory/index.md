# Project Memory

## Core
- UI: Verde, vermelho e dourado. Fundo branco, cards em verde-claro.
- Título principal: 'Envio de Mensagens'. Sistema apenas de mensagens (Diversos). Ocorrências foi removido e NÃO deve ser re-adicionado.
- Assinatura oficial: 'Colégio Zampieri' CNPJ '55.704.506/0001-73'.
- Contato: Priorizar sempre a Mãe. Pai é fallback se Mãe não tiver telefone.
- Limite: 4.000 mensagens por período de 30 dias (reset dia 15). Envio bloqueado ao atingir limite.

## Memories
- [Tabela Alunos (alunos_26)](mem://database/primary-table-source) — Estrutura da tabela e mapeamento de campos dos alunos e pais
- [Seleção de Alunos](mem://features/student-selection) — Fluxo de seleção individual e em lote (Turma Completa)
- [Envio em Lote (Webhooks)](mem://integration/webhook-batch-processing) — Estrutura do payload em array para Edge Functions
- [WhatsApp Business API](mem://integration/whatsapp-business-api) — Templates oficiais e estrutura fixa de mensagens
- [Criação de Mensagens Diversas](mem://features/whatsapp-message-creation) — Editor de texto, variáveis, formatação HTML e limites de mídia
- [Configuração de Webhooks n8n](mem://integration/webhooks) — Endpoints, Edge Function proxy e armazenamento de mídia
