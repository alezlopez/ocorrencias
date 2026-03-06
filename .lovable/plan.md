

## Enviar apenas o nome do arquivo no payload (não a URL completa)

### O que será feito

Editar `src/components/ContractEditor.tsx` — na linha 349, em vez de `mediaUrl = publicUrlData.publicUrl`, extrair apenas o nome do arquivo gerado (`{timestamp}_{sanitizedName}`).

Como o `filePath` já contém `whatsapp-media/{timestamp}_{sanitizedName}`, basta extrair o nome do arquivo dele:

```typescript
// Antes:
mediaUrl = publicUrlData.publicUrl;

// Depois:
const fileName = filePath.split('/').pop(); // "1772805499207_7.jpeg"
mediaUrl = fileName;
```

O campo `mediaUrl` no payload passará a conter apenas `1772805499207_7.jpeg` em vez da URL completa.

### Arquivo
- **Editar** `src/components/ContractEditor.tsx` — linha ~349, trocar URL pública pelo nome do arquivo

