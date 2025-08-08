import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookData {
  nomeResponsavel: string;
  cpfResponsavel: string;
  whatsapp: string;
  base64: string;
  nomeAluno: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nomeResponsavel, cpfResponsavel, whatsapp, base64, nomeAluno }: WebhookData = await req.json();

    console.log(`Iniciando envio para webhook - Aluno: ${nomeAluno}, Responsável: ${nomeResponsavel}`);

    const webhookUrl = 'https://n8n.colegiozampieri.com/webhook/ocorrenciaszapsign';
    const payload = {
      nomeResponsavel,
      cpfResponsavel,
      whatsapp,
      base64,
      nomeAluno
    };

    console.log('Payload sendo enviado:', {
      nomeResponsavel,
      cpfResponsavel,
      whatsapp: whatsapp.substring(0, 5) + '***', // Mascarar parte do telefone nos logs
      nomeAluno,
      base64Length: base64.length
    });

    // Send data to the webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Colégio-Zampieri-Sistema/1.0'
      },
      body: JSON.stringify(payload),
    });

    console.log(`Response status: ${webhookResponse.status} ${webhookResponse.statusText}`);

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error(`Webhook falhou: Status ${webhookResponse.status} - ${webhookResponse.statusText}`);
      console.error('Response body:', errorText);
      
      // Retornar erro mais específico para o frontend
      let errorMessage = `Erro ${webhookResponse.status}: ${webhookResponse.statusText}`;
      
      if (webhookResponse.status === 404) {
        errorMessage = 'Webhook não encontrado. Verifique se o sistema N8N está funcionando corretamente.';
      } else if (webhookResponse.status >= 500) {
        errorMessage = 'Erro no servidor do webhook. Tente novamente em alguns minutos.';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: {
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
            url: webhookUrl
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 // Mudando para 400 para não ser tratado como erro interno
        }
      );
    }

    const webhookResult = await webhookResponse.text();
    console.log('Webhook executado com sucesso:', webhookResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Documento enviado com sucesso para ${nomeAluno}`,
        webhookResponse: webhookResult
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Erro na edge function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erro interno: ${error.message}`,
        type: 'internal_error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})