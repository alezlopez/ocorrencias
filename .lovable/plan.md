

## Diagnóstico

O código atual em `ContractEditor.tsx` (linha 349) **já está correto** — ele atribui `publicUrlData.publicUrl` (a URL completa) ao campo `mediaUrl`.

O log do console que aparece ("Mídia enviada com sucesso. **Arquivo**: 1772812140227_4.jpeg") é da versão **anterior** do código, antes da última edição. A versão atual do código diz "**URL**:" no log.

### O que precisa acontecer

Basta **recarregar o preview** (hard refresh) para que a versão atualizada do código seja carregada. Não há nenhuma alteração de código necessária — o `mediaUrl` já envia o link completo tipo:

```
https://lzdhrtcugqnqmyapgmbs.supabase.co/storage/v1/object/public/zampieri/whatsapp-media/1772812140227_4.jpeg
```

Se após o refresh o problema persistir, posso investigar mais a fundo.

