

## Permitir upload de vídeo no template Recado + Mídia

### O que será feito

Adicionar formatos de vídeo (MP4, MOV, AVI) ao campo de upload de arquivos no template "Recado + Mídia" da aba Diversos.

### Alteração

**Arquivo:** `src/components/ContractEditor.tsx` — linha ~607

Alterar o atributo `accept` do input de arquivo de:
```
accept="image/jpeg,image/png,application/pdf"
```
para:
```
accept="image/jpeg,image/png,application/pdf,video/mp4,video/quicktime,video/x-msvideo,video/webm"
```

Isso permitirá upload de arquivos JPG, PNG, PDF, MP4, MOV, AVI e WebM.

