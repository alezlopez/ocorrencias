import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Enviando payload para webhook n8n:', JSON.stringify({
      template: payload.template,
      alunosCount: payload.alunos?.length,
      hasMedia: !!payload.mediaUrl,
      hasLink: !!payload.link,
    }));

    const webhookUrl = 'https://n8n.colegiozampieri.com/webhook/b1a9391d-4115-45f9-aa1f-08119c4ca2fd';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log(`Webhook response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Webhook erro ${response.status}: ${response.statusText}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const result = await response.text();
    console.log('Webhook sucesso:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Enviado com sucesso', result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Erro na edge function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
