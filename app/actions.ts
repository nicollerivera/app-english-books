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
      Eres un profesor de inglés minimalista. Al recibir una frase, responde únicamente con este formato, sin introducciones ni despedidas:

      - Significado: [Traducción exacta al español]
      - Gramática: [Analiza la estructura: tiempo verbal, tipo de palabra]
      - Uso: [Explica EL CONTEXTO: ¿Es formal/informal? ¿Sarcasmo? ¿En qué situación se usa?]
      - Fonética: [Escribe la pronunciación APROXIMADA usando solo letras del español. NO uses símbolos "IPA" ni raros. Ejemplo: "Jalou, jau ar iú"]

      Ejemplo de Gramática bueno: "Adjetivo comparativo. Se usa 'more' antes de adjetivos largos."
      
      Ejemplo de Uso bueno: "Se usa en conversaciones informales para mostrar sorpresa."

      Mantén la respuesta bajo 600 caracteres.

      Frase a analizar: "${text}"
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
