export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'grau_leve',
    name: 'Retirado pelo responsável',
    description: 'Comunicado para lesão leve sofrida pelo aluno',
    content: `<h2 style="text-align: center; margin-bottom: 40px;">COMUNICADO DE OCORRÊNCIA</h2>

<p style="margin-bottom: 25px; line-height: 1.6;">Informamos que, na data de <strong>{{DATA_HOJE}}</strong>, a escola entrou em contato com o(a) Sr(a). <strong>{{NOME_RESPONSAVEL}}</strong>, CPF: <strong>{{CPF_RESPONSAVEL}}</strong>, responsável legal pelo aluno <strong>{{NOME_ALUNO}}</strong> para comunicar sobre uma lesão leve sofrida pelo(a) aluno(a) citado(a).</p>

<p style="margin-bottom: 25px; line-height: 1.6;">Após o contato e ciência do ocorrido, o(a) responsável compareceu à escola e retirou o(a) aluno(a), assumindo a responsabilidade pelo acompanhamento e demais providências fora do ambiente escolar.</p>

<p style="margin-bottom: 40px; line-height: 1.6;">Solicitamos a assinatura abaixo para ciência, registro da retirada e encerramento do atendimento interno referente à ocorrência.</p>

<p style="margin-top: 40px;">Atenciosamente,<br/>
<strong>Coordenação</strong><br/>
<strong>Colégio Zampieri</strong><br/>
<strong>55.704.506/0001-73</strong></p>

<div style="margin-top: 60px;">
<p><strong>Responsável:</strong> <strong>{{NOME_RESPONSAVEL}}</strong></p>
</div>

<div style="margin-top: 60px;">
<p><strong>Testemunhas da escola:</strong></p>
<p style="margin-top: 20px;">1 - Alexandre Zampieri Lopez</p>
<p style="margin-top: 20px;">2 - Daniel Stroebele</p>
</div>`
  },
  {
    id: 'grau_leve_sem_retirada',
    name: 'Grau Leve',
    description: 'Comunicado para lesão leve sem retirada do aluno',
    content: `<h2 style="text-align: center; margin-bottom: 40px;">COMUNICADO DE OCORRÊNCIA</h2>

<p style="margin-bottom: 25px; line-height: 1.6;">Informamos que, na data de <strong>{{DATA_HOJE}}</strong>, a escola entrou em contato com o(a) Sr(a). <strong>{{NOME_RESPONSAVEL}}</strong>, CPF: <strong>{{CPF_RESPONSAVEL}}</strong>, responsável legal pelo aluno <strong>{{NOME_ALUNO}}</strong> para comunicar sobre uma lesão leve sofrida pelo(a) aluno(a) citado(a).</p>

<p style="margin-bottom: 25px; line-height: 1.6;">Após o contato e ciência do ocorrido, o(a) responsável optou por não acionar o SAMU e não retirar o(a) aluno(a) da escola, considerando o estado clínico estável.</p>

<p style="margin-bottom: 25px; line-height: 1.6;">A escola tomou todas as medidas cabíveis, prestou os primeiros cuidados necessários e acompanhou o(a) aluno(a) até o fim do turno escolar.</p>

<p style="margin-bottom: 40px; line-height: 1.6;">Ao assinar este documento, o(a) responsável <strong>{{NOME_RESPONSAVEL}}</strong> declara estar ciente das informações acima e isenta o Colégio Zampieri de qualquer consequência gerada por sua escolha.</p>

<p style="margin-top: 40px;">Atenciosamente,<br/>
<strong>Coordenação</strong><br/>
<strong>Colégio Zampieri</strong><br/>
<strong>55.704.506/0001-73</strong></p>

<div style="margin-top: 60px;">
<p><strong>Assinatura do(a) responsável:</strong></p>
</div>

<div style="margin-top: 60px;">
<p><strong>Testemunhas da escola:</strong></p>
<p style="margin-top: 20px;">1 - Alexandre Zampieri Lopez</p>
<p style="margin-top: 20px;">2 - Daniel Stroebele</p>
</div>`
  },
  {
    id: 'samu',
    name: 'SAMU',
    description: 'Comunicado para lesão com atendimento do SAMU',
    content: `<h2 style="text-align: center; margin-bottom: 40px;">COMUNICADO DE OCORRÊNCIA</h2>

<p style="margin-bottom: 25px; line-height: 1.6;">Informamos que, na data de <strong>{{DATA_HOJE}}</strong>, a escola entrou em contato com o(a) Sr(a). <strong>{{NOME_RESPONSAVEL}}</strong>, CPF: <strong>{{CPF_RESPONSAVEL}}</strong>, responsável legal pelo aluno <strong>{{NOME_ALUNO}}</strong> para comunicar sobre uma lesão lsofrida pelo(a) aluno(a) citado(a).</p>

<p style="margin-bottom: 25px; line-height: 1.6;">Após o contato e ciência do ocorrido, o(a) responsável compareceu à escola, onde foi realizado o atendimento pelo SAMU.</p>

<p style="margin-bottom: 25px; line-height: 1.6;">O(a) aluno(a) foi então retirado(a) da unidade escolar pelo SAMU, acompanhado(a) do(a) responsável, para a devida avaliação médica e demais providências.</p>

<p style="margin-bottom: 25px; line-height: 1.6;">A escola prestou os primeiros cuidados, seguiu todos os protocolos de segurança e permaneceu à disposição durante todo o atendimento.</p>

<p style="margin-bottom: 40px; line-height: 1.6;">Ao assinar este documento, o(a) responsável <strong>{{NOME_RESPONSAVEL}}</strong> declara estar ciente das informações acima e isenta o Colégio Zampieri de qualquer consequência gerada por sua escolha.</p>

<p style="margin-top: 40px;">Atenciosamente,<br/>
<strong>Coordenação</strong><br/>
<strong>Colégio Zampieri</strong><br/>
<strong>55.704.506/0001-73</strong></p>

<div style="margin-top: 60px;">
<p><strong>Assinatura do(a) responsável:</strong></p>
</div>

<div style="margin-top: 60px;">
<p><strong>Testemunhas da escola:</strong></p>
<p style="margin-top: 20px;">1 - Alexandre Zampieri Lopez</p>
<p style="margin-top: 20px;">2 - Daniel Stroebele</p>
</div>`
  }
];