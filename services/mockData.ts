// Helper to get unique random numbers for a single lottery draw
const getRandomUniqueNumbers = (count: number, min: number, max: number): number[] => {
    const numbers = new Set<number>();
    while (numbers.size < count) {
        numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return Array.from(numbers);
};

// Generate a mock history of 50 past Lotomania results.
// This is used by the local generator to analyze number frequencies.
export const MOCK_HISTORY: number[][] = Array.from({ length: 50 }, () =>
    getRandomUniqueNumbers(50, 0, 99).sort((a, b) => a - b)
);
