/**
 * TodoSeguros Chatbot Worker — Cloudflare Worker
 * 
 * Deploy: wrangler deploy
 * Environment variable required: GROQ_API_KEY
 */

const SYSTEM_PROMPT = `Eres el asistente virtual de TodoSeguros (todoseguros.pro), un sitio web informativo sobre seguros en España.

Tu objetivo es ayudar a los visitantes a entender los diferentes tipos de seguros disponibles en España y orientarles hacia la mejor opción para su situación.

REGLAS IMPORTANTES:
- Responde SIEMPRE en español de España.
- Sé amable, claro y conciso. Respuestas de máximo 3-4 párrafos.
- NO des asesoramiento financiero ni legal específico. Recuerda que somos un sitio informativo, NO agentes ni corredores de seguros.
- Recomienda siempre consultar con un mediador autorizado o directamente con la aseguradora antes de contratar.
- Si no sabes algo, dilo honestamente.
- Puedes recomendar que visiten las páginas del sitio para más información.

TIPOS DE SEGUROS QUE CUBRIMOS:
1. Seguro de Coche — Obligatorio en España. Terceros, terceros ampliado, todo riesgo.
2. Seguro de Moto — Obligatorio. Mismo esquema que coche.
3. Seguro de Hogar — No obligatorio pero recomendable. Continente, contenido, RC familiar.
4. Seguro de Salud — Privado complementario a la Seguridad Social. Cuadro médico, copago, reembolso.
5. Seguro de Vida — No obligatorio (salvo hipoteca). Temporal, vinculado hipoteca, ahorro.
6. Seguro de Decesos — El más contratado de España (~50% hogares). Sepelio, gestiones, asistencia familiar.
7. Seguro de Mascotas — RC obligatoria para perros desde Ley Bienestar Animal 2023.
8. Seguro de Viaje — Recomendable fuera UE. Asistencia médica, cancelación, equipaje.
9. Seguro de Comunidades — Cubre elementos comunes del edificio.
10. Seguro de Autónomos — RC profesional, multirriesgo, ciberriesgo.

ASEGURADORAS PRINCIPALES EN ESPAÑA:
Mapfre, Mutua Madrileña, Línea Directa, AXA, Allianz, Generali, Zurich, Adeslas (Segurcaixa), Sanitas, DKV, Asisa, Santa Lucía, Ocaso, Caser, VidaCaixa, Direct Seguros, Hiscox.

HERRAMIENTAS DEL SITIO:
- Comparador de aseguradoras por tipo de seguro
- Calculadora de presupuesto de seguros
- Guías informativas en cada página de seguro

NO HAGAS:
- No inventes precios exactos. Usa rangos orientativos.
- No recomiendes una aseguradora sobre otra de forma parcial.
- No des información sobre leyes de otros países.
- No respondas preguntas fuera del ámbito de seguros en España.`;

const ALLOWED_ORIGINS = [
  'https://todoseguros.pro',
  'https://www.todoseguros.pro',
  'https://todoseguros.pages.dev',
  'http://localhost:8788',
  'http://localhost:3000',
  'http://127.0.0.1:8788',
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json();
      const userMessages = body.messages;

      if (!Array.isArray(userMessages) || userMessages.length === 0) {
        return new Response(JSON.stringify({ error: 'Mensaje vacío' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const lastMsg = userMessages[userMessages.length - 1];
      if (!lastMsg || !lastMsg.content || typeof lastMsg.content !== 'string' || lastMsg.content.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Mensaje vacío' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (lastMsg.content.length > 1000) {
        return new Response(JSON.stringify({ error: 'Mensaje demasiado largo (máx. 1000 caracteres)' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...userMessages.slice(-6).map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content).slice(0, 1000),
        })),
      ];

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.9,
        }),
      });

      if (!groqResponse.ok) {
        const errText = await groqResponse.text();
        console.error('Groq API error:', groqResponse.status, errText);
        return new Response(JSON.stringify({
          reply: 'Lo siento, estoy teniendo problemas técnicos. Por favor, inténtalo de nuevo en unos momentos.',
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await groqResponse.json();
      const reply = data.choices?.[0]?.message?.content || 'No he podido generar una respuesta. Inténtalo de nuevo.';

      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({
        reply: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
