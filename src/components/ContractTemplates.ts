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
    id: 'contrato_servicos',
    name: 'Contrato de Prestação de Serviços',
    description: 'Contrato padrão para prestação de serviços educacionais',
    content: `<h2 style="text-align: center; margin-bottom: 30px;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>

<p><strong>CONTRATANTE:</strong> Colégio Zampieri<br/>
<strong>CNPJ:</strong> 55.704.506/0001-73</p>
<p><strong>CONTRATADO:</strong> <strong>{{NOME_RESPONSAVEL}}</strong></p>
<p><strong>CPF:</strong> <strong>{{CPF_RESPONSAVEL}}</strong></p>
<p><strong>ALUNO:</strong> <strong>{{NOME_ALUNO}}</strong></p>
<p><strong>DATA:</strong> <strong>{{DATA_HOJE}}</strong></p>

<h3>CLÁUSULA 1ª - DO OBJETO</h3>
<p>O presente contrato tem por objeto a prestação de serviços educacionais para o aluno <strong>{{NOME_ALUNO}}</strong>, incluindo atividades pedagógicas, acompanhamento escolar e demais serviços correlatos.</p>

<h3>CLÁUSULA 2ª - DAS OBRIGAÇÕES</h3>
<p><strong>São obrigações do CONTRATANTE:</strong></p>
<ul>
<li>Prestar os serviços educacionais conforme especificado;</li>
<li>Manter a qualidade do ensino;</li>
<li>Zelar pela segurança do aluno.</li>
</ul>

<p><strong>São obrigações do CONTRATADO:</strong></p>
<ul>
<li>Efetuar o pagamento das mensalidades em dia;</li>
<li>Acompanhar o desenvolvimento do aluno;</li>
<li>Manter os dados atualizados.</li>
</ul>

<h3>CLÁUSULA 3ª - DO VALOR E FORMA DE PAGAMENTO</h3>
<p>O valor e forma de pagamento serão conforme acordado entre as partes, sendo o responsável <strong>{{NOME_RESPONSAVEL}}</strong> o responsável pelos pagamentos.</p>

<h3>CLÁUSULA 4ª - DO PRAZO</h3>
<p>O presente contrato terá vigência conforme período letivo estabelecido pela instituição.</p>

<div style="margin-top: 60px;">
<p>Data: <strong>{{DATA_HOJE}}</strong></p>
<p>Assinatura do Contratante (Colégio Zampieri - CNPJ: 55.704.506/0001-73): _________________________</p>
<p>Assinatura do Contratado (<strong>{{NOME_RESPONSAVEL}}</strong>): _________________________</p>
</div>`
  },
  {
    id: 'comunicado_geral',
    name: 'Comunicado Geral',
    description: 'Modelo para comunicados gerais aos responsáveis',
    content: `<h2 style="text-align: center; margin-bottom: 30px;">COMUNICADO</h2>

<p><strong>Para:</strong> Sr(a). <strong>{{NOME_RESPONSAVEL}}</strong></p>
<p><strong>CPF:</strong> <strong>{{CPF_RESPONSAVEL}}</strong></p>
<p><strong>Responsável por:</strong> <strong>{{NOME_ALUNO}}</strong></p>
<p><strong>Data:</strong> <strong>{{DATA_HOJE}}</strong></p>

<div style="margin-top: 40px;">
<p>Prezado(a) responsável,</p>

<p>Através deste comunicado, informamos sobre [ASSUNTO A SER ESPECIFICADO] referente ao aluno <strong>{{NOME_ALUNO}}</strong>.</p>

<p>[CONTEÚDO DO COMUNICADO A SER PERSONALIZADO]</p>

<p>Para maiores esclarecimentos, favor entrar em contato com a coordenação da escola.</p>
</div>

<p style="margin-top: 40px;">Atenciosamente,<br/>
<strong>Coordenação</strong><br/>
<strong>Colégio Zampieri</strong><br/>
<strong>55.704.506/0001-73</strong></p>

<div style="margin-top: 60px;">
<p><strong>Ciente:</strong></p>
<p>Assinatura do(a) responsável: _________________________</p>
<p>Data: ___/___/_____</p>
</div>`
  }
];