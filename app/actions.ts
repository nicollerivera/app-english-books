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
      Eres un profesor de inglés experto. Analiza la siguiente frase con precisión quirúrgica:

      1. Significado: Traducción fiel. NO cambies nombres de animales ni objetos (Boa es Boa, no Anaconda).
      2. Gramática: Breve análisis sintáctico.
      3. Uso: Contexto (formal, literario, etc.).
      4. Fonética: Transcribe los sonidos usando SOLO sílabas que un hispanohablante leería igual.
         - Usa guiones para separar sílabas.
         - Tilda la sílaba tónica.
         - Usa "j" para "h", "u" para "w", "sh" para sonidos suaves.
         - MAL: "Bow ahn" (parece inglés).
         - BIEN: "Bó-a con-stríc-tor".

      Formato de respuesta (sin markdown extra, solo las 4 líneas):
      - Significado: ...
      - Gramática: ...
      - Uso: ...
      - Fonética: ...

      Frase: "${text}"
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
                        content: "Eres un profesor de inglés experto que explica de forma clara y sintética."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.5
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Groq API Error:", data.error);
            // Manejo amigable del límite de velocidad (Rate Limit)
            if (data.error.code === 'rate_limit_exceeded' || data.error.message?.includes('Rate limit')) {
                return { error: true, data: "⏳ El maestro está tomando aire. Espera 2 segundos y vuelve a intentar." };
            }
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
