// Este serviço foi atualizado para usar uma API de dados direta em vez de IA.
// O nome do arquivo é mantido para simplicidade, evitando alterações de importação em outros arquivos.
import { LastResult, Premiacao } from "../types";
import {
    getCachedResult,
    setCachedResult,
    getCachedLatestResult,
    setCachedLatestResult
} from './cacheService';
import { getHistoricalResult } from './historicalDataService';


// Endpoint da API direta para resultados oficiais da Lotomania.
const LOTTERY_API_BASE_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotomania';

/**
 * Formata um valor numérico para o padrão de moeda brasileiro (BRL).
 */
const formatCurrency = (value: number): string => {
    if (typeof value !== 'number') return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

/**
 * Transforma os dados brutos da API oficial no formato `LastResult` usado pela aplicação.
 * @param apiData - O JSON bruto da API da Caixa.
 * @returns Um objeto `LastResult` formatado.
 */
const transformApiDataToLastResult = (apiData: any): LastResult => {
    const premiacao: Premiacao[] = apiData.listaRateioPremio.map((item: any) => {
        // Extrai o número de acertos de strings como "20 Acertos" ou "Nenhum Acerto"
        const acertos = parseInt(item.descricaoFaixa.split(' ')[0], 10) || 0;
        return {
            acertos,
            vencedores: item.numeroDeGanhadores,
            premio: formatCurrency(item.valorPremio)
        };
    });

    return {
        concurso: apiData.numero,
        data: apiData.dataApuracao,
        numeros: apiData.listaDezenas.map((n: string) => String(n).padStart(2, '0')),
        acumuladoProximoConcurso: formatCurrency(apiData.valorEstimadoProximoConcurso),
        premiacao,
    };
};

/**
 * Busca o último resultado da Lotomania diretamente da fonte de dados oficial.
 * Utiliza o cache para minimizar requisições de rede.
 */
export const fetchLatestResultFromWeb = async (): Promise<LastResult> => {
    const cachedLatest = getCachedLatestResult();
    if (cachedLatest) {
        console.log("Retornando o último resultado do cache.");
        return cachedLatest;
    }

    try {
        const response = await fetch(LOTTERY_API_BASE_URL);
        if (!response.ok) {
            throw new Error(`Falha na rede ao buscar último resultado: Status ${response.status}`);
        }
        const apiData = await response.json();
        const result = transformApiDataToLastResult(apiData);

        setCachedLatestResult(result);
        return result;

    } catch (error) {
        console.error("Erro ao buscar último resultado da API direta:", error);
        throw new Error('Não foi possível buscar o último resultado. A fonte de dados pode estar temporariamente indisponível.');
    }
};

/**
 * Busca um resultado específico da Lotomania pelo número do concurso.
 * Tenta buscar da API, mas usa dados históricos locais como fallback.
 */
export const fetchResultByConcurso = async (concurso: number): Promise<LastResult> => {
    const cachedResult = getCachedResult(concurso);
    // Retorna do cache se for um resultado completo (com dados de premiação)
    if (cachedResult && cachedResult.premiacao && cachedResult.premiacao.length > 0) {
        console.log(`Retornando resultado completo do concurso ${concurso} do cache.`);
        return cachedResult;
    }

    const partialHistoricalResult = getHistoricalResult(concurso);

    try {
        const response = await fetch(`${LOTTERY_API_BASE_URL}/${concurso}`);
        if (!response.ok) {
             if (response.status === 404) {
                 throw new Error(`Não foi possível encontrar o resultado do concurso ${concurso}.`);
             }
            throw new Error(`Falha na rede ao buscar concurso ${concurso}: Status ${response.status}`);
        }
        const apiData = await response.json();
        const result = transformApiDataToLastResult(apiData);

        setCachedResult(result); // Armazena o resultado completo no cache
        return result;

    } catch (error) {
        console.error(`API falhou para concurso ${concurso}:`, error);
        
        // Fallback para dados históricos locais se a API falhar
        if (partialHistoricalResult) {
            console.log(`API falhou. Usando dados históricos locais para o concurso ${concurso}.`);
            // Retorna um resultado parcial sem dados de premiação
            const fallbackResult = {
                ...partialHistoricalResult,
                acumuladoProximoConcurso: "N/A",
                premiacao: []
            } as LastResult;
            
            return fallbackResult;
        }
        
        // Re-lança o erro original se a API falhar e não houver dados históricos
        if (error instanceof Error) {
            throw error; 
        }
        throw new Error(`Falha ao buscar o resultado do concurso ${concurso}.`);
    }
};
