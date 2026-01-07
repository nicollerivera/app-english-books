'use server';

export async function explainText(text: string) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return {
            error: true,
            data: "⚠️ No se ha configurado la API Key de Groq. Por favor, añade GROQ_API_KEY=tu_clave_aqui en tu archivo .env.local"
        };
    }

    try {
        const prompt = `
      Actúa como un compañero de estudio divertido, ingenioso y breve.
      Explica el siguiente texto: "${text}".
      
      Reglas:
      1. ¡SÉ BREVE! Nada de biblias. Máximo 2-3 frases por punto.
      2. Tono: Humorístico, casual y directo. Usa emojis. ⚡️
      3. Estructura:
         - 🇪🇸 **Traducción**: Lo que significa en español (coloquial si aplica).
         - 🤓 **El "por qué"**: Explicación rápida y sencilla.
         - 😂 **Dato**: Algo divertido o un chiste corto relacionado.
      
      No te enrolles. ¡Hazlo ágil y en español!
    `;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "Eres un profesor de inglés experto y amable."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Groq API Error:", data.error);
            return { error: true, data: "Error consultando a Groq: " + data.error.message };
        }

        const explanation = data.choices?.[0]?.message?.content;
        if (!explanation) return { error: true, data: "No se pudo obtener una explicación." };

        return { error: false, data: explanation };

    } catch (error) {
        console.error("Server Action Error:", error);
        return { error: true, data: "Error de conexión con el servidor de IA." };
    }
}
