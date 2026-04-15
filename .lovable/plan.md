

## Login Administrativo

### O que será feito
Criar uma tela de login para proteger o acesso ao sistema. Apenas usuários cadastrados via Supabase Dashboard poderão acessar. Não haverá tela de cadastro.

### Alterações

1. **Criar página de Login** (`src/pages/Login.tsx`)
   - Formulário com email e senha
   - Usa `supabase.auth.signInWithPassword()`
   - Redireciona para `/` após login bem-sucedido

2. **Criar componente de proteção de rota** (`src/components/ProtectedRoute.tsx`)
   - Verifica sessão ativa com `supabase.auth.onAuthStateChange`
   - Redireciona para `/login` se não autenticado
   - Mostra loading enquanto verifica

3. **Atualizar `src/App.tsx`**
   - Adicionar rota `/login`
   - Envolver a rota `/` com `ProtectedRoute`

4. **Adicionar botão de logout** no `ContractEditor.tsx`
   - Botão discreto no header para `supabase.auth.signOut()`

### Detalhes técnicos
- Usa Supabase Auth nativo (email/password)
- Cadastro de usuários feito manualmente no Supabase Dashboard (Auth > Users)
- Sessão persistida via localStorage (já configurado no client)

