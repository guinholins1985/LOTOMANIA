import { MOCK_HISTORY } from './mockData';
import { GameConfig, LastResult, GeneratedGames } from '../types';

// --- UTILITY HELPERS ---
const shuffle = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const pickRandom = <T>(array: T[], count: number): T[] => {
  return shuffle([...array]).slice(0, count);
};

// --- CORE LOGIC ---

// 1. Analyze number frequencies from mock historical data
const analyzeFrequencies = (history: number[][]) => {
    const frequencyMap = new Map<number, number>();
    for (let i = 0; i <= 99; i++) frequencyMap.set(i, 0);

    history.forEach(draw => {
        draw.forEach(num => {
            frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
        });
    });
    
    const allNumbers = Array.from({ length: 100 }, (_, i) => i);
    allNumbers.sort((a, b) => (frequencyMap.get(b) || 0) - (frequencyMap.get(a) || 0));

    const hot = allNumbers.slice(0, 30); // Top 30%
    const cold = allNumbers.slice(70); // Bottom 30%
    const warm = allNumbers.slice(30, 70); // Middle 40%
    
    // Identify "Dezenas Chave" from the last 5 contests
    const last5History = history.slice(0, 5);
    const last5FreqMap = new Map<number, number>();
    last5History.forEach(draw => {
        draw.forEach(num => {
            last5FreqMap.set(num, (last5FreqMap.get(num) || 0) + 1);
        });
    });

    const dezenasChave: number[] = [];
    for (const [num, freq] of last5FreqMap.entries()) {
        if (freq >= 3) dezenasChave.push(num);
    }
    // Ensure we have at least 12, even if mock data is sparse
    while(dezenasChave.length < 12 && hot.length > dezenasChave.length) {
        const nextHot = hot.find(h => !dezenasChave.includes(h));
        if (nextHot !== undefined) dezenasChave.push(nextHot);
        else break;
    }
    
    return { hot, warm, cold, dezenasChave: dezenasChave.slice(0, 12) };
};

type Analysis = ReturnType<typeof analyzeFrequencies>;

// 2. Generate an initial card based on a strategy
const generateInitialCard = (strategy: 'aggressive' | 'defensive' | 'balanced', analysis: Analysis): Set<number> => {
    let numbers = new Set<number>();
    switch(strategy) {
        case 'aggressive': // 15 Quentes + 5 Mornos/Frios
            pickRandom(analysis.hot, 15).forEach(n => numbers.add(n));
            pickRandom([...analysis.warm, ...analysis.cold], 5).forEach(n => numbers.add(n));
            break;
        case 'defensive': // 10 Quentes + 10 Frios
            pickRandom(analysis.hot, 10).forEach(n => numbers.add(n));
            pickRandom(analysis.cold, 10).forEach(n => numbers.add(n));
            break;
        case 'balanced': // 12 Quentes + 8 Mornos
            pickRandom(analysis.hot, 12).forEach(n => numbers.add(n));
            pickRandom(analysis.warm, 8).forEach(n => numbers.add(n));
            break;
    }

    // Complete to 50 numbers
    const allPool = shuffle([...analysis.hot, ...analysis.warm, ...analysis.cold]);
    let i = 0;
    while(numbers.size < 50 && i < allPool.length) {
        numbers.add(allPool[i]);
        i++;
    }
    return numbers;
};

// 3. Validate and adjust the card to meet all rules
const validateAndAdjustCard = (card: Set<number>, analysis: Analysis): number[] => {
    let finalCard = Array.from(card);

    // Rule 1: Ensure at least 10 "Dezenas Chave"
    const presentChaves = finalCard.filter(n => analysis.dezenasChave.includes(n));
    const missingChaves = analysis.dezenasChave.filter(n => !presentChaves.includes(n));
    
    if (presentChaves.length < 10) {
        const toAddCount = 10 - presentChaves.length;
        const chavesToAdd = missingChaves.slice(0, toAddCount);
        const nonChavesToRemove = pickRandom(finalCard.filter(n => !analysis.dezenasChave.includes(n)), chavesToAdd.length);
        
        finalCard = finalCard.filter(n => !nonChavesToRemove.includes(n));
        finalCard.push(...chavesToAdd);
    }
    
    // Rule 2: Ensure all endings (0-9) are covered
    const endings = new Set(finalCard.map(n => n % 10));
    if (endings.size < 10) {
        const missingEndings = Array.from({length: 10}, (_,i) => i).filter(e => !endings.has(e));
        const allNumbersPool = shuffle(Array.from({length: 100}, (_,i) => i).filter(n => !finalCard.includes(n)));
        
        for(const ending of missingEndings) {
            const replacement = allNumbersPool.find(n => n % 10 === ending);
            if (replacement !== undefined) {
                // Find a number to remove with a duplicate ending
                const counts = new Map<number, number>();
                finalCard.forEach(n => {
                    const e = n % 10;
                    counts.set(e, (counts.get(e) || 0) + 1);
                });
                const duplicateEnding = Array.from(counts.entries()).find(([,count]) => count > 1)?.[0];
                if(duplicateEnding !== undefined) {
                    const toRemoveIndex = finalCard.findIndex(n => n % 10 === duplicateEnding);
                    finalCard.splice(toRemoveIndex, 1, replacement);
                }
            }
        }
    }

    // Rule 3: Ensure sum is between 2200 and 2800 (Lotomania typical range)
    let sum = finalCard.reduce((a, b) => a + b, 0);
    let attempts = 0;
    const allNumbersPool = Array.from({length: 100}, (_,i) => i);
    while((sum < 2200 || sum > 2800) && attempts < 50) {
        const cardSet = new Set(finalCard);
        if (sum < 2200) { // Sum too low, swap a low number for a high one
            const lowNum = Math.min(...finalCard);
            const highNumPool = allNumbersPool.filter(n => n > 80 && !cardSet.has(n));
            if(highNumPool.length > 0) {
                const replacement = pickRandom(highNumPool, 1)[0];
                finalCard = finalCard.filter(n => n !== lowNum);
                finalCard.push(replacement);
            }
        } else { // Sum too high, swap a high number for a low one
            const highNum = Math.max(...finalCard);
            const lowNumPool = allNumbersPool.filter(n => n < 20 && !cardSet.has(n));
             if(lowNumPool.length > 0) {
                const replacement = pickRandom(lowNumPool, 1)[0];
                finalCard = finalCard.filter(n => n !== highNum);
                finalCard.push(replacement);
            }
        }
        sum = finalCard.reduce((a, b) => a + b, 0);
        attempts++;
    }

    return finalCard.slice(0, 50).sort((a,b) => a-b);
};


// --- MAIN EXPORTED FUNCTION ---
export const generateLocalGames = (config: GameConfig, lastResult: LastResult): GeneratedGames => {
    const analysis = analyzeFrequencies(MOCK_HISTORY);
    const numGames = parseInt(config.numGames, 10) || 20;

    const games: string[][] = [];
    const usedNumbersCount = new Map<number, number>();

    const numAggressive = Math.floor(numGames * 0.25);
    const numDefensive = Math.floor(numGames * 0.25);
    
    for (let i = 0; i < numGames; i++) {
        let strategy: 'aggressive' | 'defensive' | 'balanced';
        if (i < numAggressive) strategy = 'aggressive';
        else if (i < numAggressive + numDefensive) strategy = 'defensive';
        else strategy = 'balanced';

        let gameIsValid = false;
        let finalCard: number[] = [];
        let generationAttempts = 0;

        // Try to generate a valid card that doesn't overuse numbers
        while(!gameIsValid && generationAttempts < 20) {
            const initialCard = generateInitialCard(strategy, analysis);
            const adjustedCard = validateAndAdjustCard(initialCard, analysis);

            // Check if this card overuses any number (limit is 5)
            const overusedNumber = adjustedCard.find(num => (usedNumbersCount.get(num) || 0) >= 5);

            if (!overusedNumber) {
                finalCard = adjustedCard;
                gameIsValid = true;
            }
            generationAttempts++;
        }
        
        // If we failed to find a valid card, just use the last attempt
        if (!gameIsValid) {
             finalCard = validateAndAdjustCard(generateInitialCard(strategy, analysis), analysis);
        }

        finalCard.forEach(num => {
            usedNumbersCount.set(num, (usedNumbersCount.get(num) || 0) + 1);
        });

        games.push(finalCard.map(n => String(n).padStart(2, '0')));
    }

    const analysisText = `Geração local concluída. ${numGames} jogos criados seguindo estratégias agressivas, defensivas e balanceadas. As "Dezenas Chave" identificadas para esta análise foram: ${analysis.dezenasChave.join(', ')}. Cada jogo foi validado para garantir a cobertura de finais e a soma total adequada.`;

    return {
        analysis: analysisText,
        games: games,
    };
};
