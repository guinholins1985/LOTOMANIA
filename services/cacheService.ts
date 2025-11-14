import { LastResult } from '../types';

const CACHE_PREFIX = 'lotomania_result_';
const LATEST_CACHE_KEY = 'lotomania_latest_result';
// Cache latest result for 1 hour to reduce fetches but keep it relatively fresh.
const LATEST_CACHE_DURATION_MS = 60 * 60 * 1000; 

interface CachedItem<T> {
    timestamp: number;
    data: T;
}

export const getCachedResult = (concurso: number): LastResult | null => {
    try {
        const itemStr = localStorage.getItem(`${CACHE_PREFIX}${concurso}`);
        if (!itemStr) return null;
        
        // Historical data is stored permanently without an expiry wrapper
        return JSON.parse(itemStr) as LastResult;
    } catch (error) {
        console.error("Error reading from cache:", error);
        return null;
    }
};

export const setCachedResult = (result: LastResult): void => {
    try {
        if (result && result.concurso) {
            localStorage.setItem(`${CACHE_PREFIX}${result.concurso}`, JSON.stringify(result));
        }
    } catch (error) {
        console.error("Error writing to cache:", error);
        // Don't throw, caching is a non-critical enhancement
    }
};

export const getCachedLatestResult = (): LastResult | null => {
     try {
        const itemStr = localStorage.getItem(LATEST_CACHE_KEY);
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr) as CachedItem<LastResult>;
        const now = new Date().getTime();
        
        if (now - item.timestamp > LATEST_CACHE_DURATION_MS) {
            localStorage.removeItem(LATEST_CACHE_KEY); // Expired
            return null;
        }

        return item.data;
    } catch (error) {
        console.error("Error reading latest from cache:", error);
        return null;
    }
}

export const setCachedLatestResult = (result: LastResult): void => {
    try {
        if(result && result.concurso) {
            const item: CachedItem<LastResult> = {
                timestamp: new Date().getTime(),
                data: result
            };
            localStorage.setItem(LATEST_CACHE_KEY, JSON.stringify(item));
            // Also cache it under its specific concurso number permanently
            setCachedResult(result);
        }
    } catch (error) {
        console.error("Error writing latest to cache:", error);
    }
}
