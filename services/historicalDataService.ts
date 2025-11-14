import { MOCK_HISTORY } from './mockData';
import { LastResult, HistoricalResult } from '../types';

// Create a Map for faster lookups
const historyMap = new Map<number, HistoricalResult>();
MOCK_HISTORY.forEach(result => {
    historyMap.set(result.concurso, result);
});

export const getHistoricalResult = (concurso: number): Partial<LastResult> | null => {
    const historicalData = historyMap.get(concurso);
    if (!historicalData) {
        return null;
    }

    return {
        concurso: historicalData.concurso,
        data: historicalData.data,
        numeros: historicalData.numeros.map(n => String(n).padStart(2, '0')),
        // premiacao and acumuladoProximoConcurso are intentionally missing
    };
};
