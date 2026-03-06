

## Upload de mídia para Storage e envio do link público no payload

### Contexto
Quando o template de mídia estiver ativo, o usuário anexa um arquivo (imagem/PDF). O sistema precisa:
1. Fazer upload para o bucket `zampieri` do Supabase Storage
2. Gerar a URL pública do arquivo
3. Enviar essa URL no payload do webhook (em vez do base64)

### O que será feito

1. **Editar `src/components/ContractEditor.tsx`** — no `handleSendDiversos`:
   - Se o template selecionado for do tipo `media`, fazer upload de cada arquivo em `diversosFiles` para o bucket `zampieri` (path: `whatsapp-media/{timestamp}_{filename}`)
   - Obter a URL pública via `supabase.storage.from('zampieri').getPublicUrl()`
   - Incluir no payload um campo `mediaUrl` com a URL pública (a API do WhatsApp precisa de uma URL acessível, não base64)
   - Remover o envio em base64 para templates de mídia (o webhook recebe a URL direta)

2. **Limitar upload a 1 arquivo** — a API do WhatsApp aceita 1 mídia por mensagem. Alterar o input de arquivo para `multiple={false}` quando for template de mídia, e validar antes do envio.

3. **Validação de tipo de arquivo** — aceitar apenas imagens (jpg, png) e PDF, com feedback visual se o usuário tentar anexar outro tipo.

4. **Ajustar preview** — no `WhatsAppPreview`, se houver arquivo selecionado, mostrar o nome do arquivo no placeholder de mídia em vez do texto genérico "Mídia anexada".

### Fluxo técnico

```text
Usuário anexa arquivo
        ↓
handleSendDiversos()
        ↓
supabase.storage.from('zampieri').upload('whatsapp-media/...', file)
        ↓
supabase.storage.from('zampieri').getPublicUrl(path)
        ↓
payload = { alunos, template: 'recado_midia', mediaUrl: publicUrl }
        ↓
POST → webhook
```

### Arquivos
- **Editar** `src/components/ContractEditor.tsx` — upload para Storage + URL pública no payload + limitar a 1 arquivo + validação de tipo
- **Editar** `src/components/WhatsAppPreview.tsx` — mostrar nome do arquivo no preview de mídia

