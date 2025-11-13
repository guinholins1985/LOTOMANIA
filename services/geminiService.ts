

import { GoogleGenAI } from "@google/genai";
import { LastResult } from "../types";

export const fetchLatestResultFromWeb = async (): Promise<LastResult> => {
    if (!process.env.API_KEY) {
        throw new Error('Chave de API do Gemini não configurada.');
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Busque na web o resultado do último concurso da Lotomania. Retorne a resposta estritamente como um objeto JSON. O objeto deve ter as seguintes chaves: "concurso" (number), "data" (string no formato "dd/mm/yyyy"), "numeros" (array de strings, cada um com 2 dígitos), "acumuladoProximoConcurso" (string, ex: "R$ 1.234.567,89"), e "premiacao" (um array de objetos, onde cada objeto tem "acertos" (number), "vencedores" (number), e "premio" (string)). Não inclua nenhuma formatação markdown como \`\`\`json ou qualquer outro texto explicativo, apenas o JSON bruto.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }],
                // FIX: Removed responseMimeType and responseSchema as they are not compatible with googleSearch tool.
                // The prompt has been updated to request a JSON response directly.
            }
        });
        
        let jsonStr = response.text.trim();
        
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }

        const result = JSON.parse(jsonStr);

        if (!result.concurso || !Array.isArray(result.numeros) || !Array.isArray(result.premiacao)) {
            throw new Error('Resposta da IA está em um formato inválido.');
        }

        // Ensure numbers are padded
        result.numeros = result.numeros.map((n: string | number) => String(n).padStart(2, '0'));

        return result as LastResult;

    } catch (error) {
        console.error("Erro ao buscar último resultado com Gemini:", error);
        if (error instanceof SyntaxError) {
             throw new Error('Falha ao processar a resposta da IA. A resposta não era um JSON válido.');
        }
        throw new Error('Falha ao buscar o último resultado da Lotomania. Verifique a conexão e a chave de API.');
    }
};

export const fetchResultByConcurso = async (concurso: number): Promise<LastResult> => {
    if (!process.env.API_KEY) {
        throw new Error('Chave de API do Gemini não configurada.');
    }
     if (concurso <= 0) {
        throw new Error('Número do concurso deve ser positivo.');
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Busque na web o resultado do concurso ${concurso} da Lotomania. Se o concurso não for encontrado, retorne um objeto JSON com uma chave "error". Caso contrário, retorne a resposta estritamente como um objeto JSON. O objeto deve ter as seguintes chaves: "concurso" (number), "data" (string no formato "dd/mm/yyyy"), "numeros" (array de strings, cada um com 2 dígitos), "acumuladoProximoConcurso" (string, ex: "R$ 1.234.567,89"), e "premiacao" (um array de objetos, onde cada objeto tem "acertos" (number), "vencedores" (number), e "premio" (string)). Não inclua nenhuma formatação markdown como \`\`\`json ou qualquer outro texto explicativo, apenas o JSON bruto.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        
        let jsonStr = response.text.trim();
        
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }

        const result = JSON.parse(jsonStr);
        
        if(result.error) {
            throw new Error(`Não foi possível encontrar o resultado do concurso ${concurso}.`);
        }

        if (!result.concurso || !Array.isArray(result.numeros) || !Array.isArray(result.premiacao)) {
            throw new Error('Resposta da IA está em um formato inválido.');
        }
        
        if (result.concurso !== concurso) {
             console.warn(`A IA retornou o concurso ${result.concurso} em vez do solicitado ${concurso}. Usando o resultado retornado.`);
        }

        // Ensure numbers are padded
        result.numeros = result.numeros.map((n: string | number) => String(n).padStart(2, '0'));

        return result as LastResult;

    } catch (error) {
        console.error(`Erro ao buscar resultado do concurso ${concurso} com Gemini:`, error);
        if (error instanceof SyntaxError) {
             throw new Error('Falha ao processar a resposta da IA. A resposta não era um JSON válido.');
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Falha ao buscar o resultado do concurso ${concurso}.`);
    }
};
// Note: generateGamesWithGemini is removed as the app now prioritizes the local generator.
// If API-based generation is needed again, it can be re-added here.