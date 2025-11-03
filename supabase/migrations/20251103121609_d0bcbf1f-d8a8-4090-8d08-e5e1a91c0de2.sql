-- Remover política antiga e criar nova para acesso público
DROP POLICY IF EXISTS "Usuários autenticados podem ler turmas" ON public.turmas_alunos;

-- Criar política de leitura pública para turmas_alunos
CREATE POLICY "Permitir leitura pública de turmas" 
ON public.turmas_alunos 
FOR SELECT 
USING (true);