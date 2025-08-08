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

    console.log(`Sending data to webhook for student: ${nomeAluno}, responsible: ${nomeResponsavel}`);

    // Send data to the webhook
    const webhookResponse = await fetch('https://n8n.colegiozampieri.com/webhook/ocorrenciaszapsign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nomeResponsavel,
        cpfResponsavel,
        whatsapp,
        base64,
        nomeAluno
      }),
    });

    if (!webhookResponse.ok) {
      console.error(`Webhook request failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
      throw new Error(`Webhook request failed: ${webhookResponse.status}`);
    }

    const webhookResult = await webhookResponse.text();
    console.log('Webhook response:', webhookResult);

    return new Response(
      JSON.stringify({ success: true, message: 'Data sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error sending to webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})