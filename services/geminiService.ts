
import { GoogleGenAI, Type } from "@google/genai";
import { LastResult } from "../types";

export const fetchLatestResultFromWeb = async (): Promise<LastResult> => {
    if (!process.env.API_KEY) {
        throw new Error('Chave de API do Gemini não configurada.');
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = "Busque na web o resultado do último concurso da Lotomania. Preciso do número do concurso, data, os 20 números sorteados, o valor acumulado para o próximo concurso, e a distribuição completa dos prêmios (faixas de acertos, número de vencedores e valor do prêmio para cada faixa).";

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        concurso: { type: Type.NUMBER },
                        data: { type: Type.STRING },
                        numeros: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        acumuladoProximoConcurso: { type: Type.STRING },
                        premiacao: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    acertos: { type: Type.NUMBER },
                                    vencedores: { type: Type.NUMBER },
                                    premio: { type: Type.STRING }
                                },
                                required: ['acertos', 'vencedores', 'premio']
                            }
                        }
                    },
                    required: ['concurso', 'data', 'numeros', 'acumuladoProximoConcurso', 'premiacao']
                },
            }
        });
        
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);

        if (!result.concurso || !Array.isArray(result.numeros) || !Array.isArray(result.premiacao)) {
            throw new Error('Resposta da IA está em um formato inválido.');
        }

        // Ensure numbers are padded
        result.numeros = result.numeros.map((n: string | number) => String(n).padStart(2, '0'));

        return result as LastResult;

    } catch (error) {
        console.error("Erro ao buscar último resultado com Gemini:", error);
        throw new Error('Falha ao buscar o último resultado da Lotomania. Verifique a conexão e a chave de API.');
    }
};

// Note: generateGamesWithGemini is removed as the app now prioritizes the local generator.
// If API-based generation is needed again, it can be re-added here.
