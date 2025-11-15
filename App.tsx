import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LastResultCard from './components/LastResultCard';
import ConfigCard from './components/ConfigCard';
import AdvancedSettingsCard from './components/AdvancedSettingsCard';
import PrizeDistributionCard from './components/PrizeDistributionCard';
import GeneratedGamesCard from './components/GeneratedGamesCard';
import GameCheckerCard from './components/GameCheckerCard';
import { GameConfig, LastResult, GeneratedGames } from './types';
import { fetchLatestResultFromWeb } from './services/geminiService';
import { generateLocalGames } from './services/localGameGenerator';

const INITIAL_LAST_RESULT: LastResult = {
  concurso: 2848,
  data: '12/11/2025',
  numeros: [
    '01', '02', '07', '08', '19', '21', '25', '27', '37', '38', 
    '47', '49', '52', '59', '64', '66', '74', '85', '88', '92'
  ],
  acumuladoProximoConcurso: "R$ 3.500.000,00",
  premiacao: [
    { acertos: 20, vencedores: 0, premio: "R$ 0,00" },
    { acertos: 19, vencedores: 4, premio: "R$ 75.123,45" },
    { acertos: 18, vencedores: 60, premio: "R$ 2.504,12" },
    { acertos: 17, vencedores: 480, premio: "R$ 313,01" },
    { acertos: 16, vencedores: 2800, premio: "R$ 56,00" },
    { acertos: 15, vencedores: 12000, premio: "R$ 13,00" },
  ]
};

const App: React.FC = () => {
  const [config, setConfig] = useState<GameConfig>({
    numGames: '20',
    fixedNumbers: '5',
    groups: '2',
    targetConcurso: (INITIAL_LAST_RESULT.concurso + 1).toString(),
    ultraSystem: true,
    mirrorBet: false,
    advancedAnalysis: true,
    closingStrategy: 'target_18',
  });
  const [lastResult, setLastResult] = useState<LastResult>(INITIAL_LAST_RESULT);
  const [generatedData, setGeneratedData] = useState<GeneratedGames | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isAutoSync, setIsAutoSync] = useState(true);

  const fetchLatestResult = useCallback(async () => {
    try {
      const result = await fetchLatestResultFromWeb();
      if (result.concurso > lastResult.concurso) {
        setLastResult(result);
        setConfig(prev => ({...prev, targetConcurso: (result.concurso + 1).toString()}));
        setLastUpdated(new Date());
      }
    } catch (e: any) {
      console.error("Failed to fetch latest result, using existing data.", e.message);
    }
  }, [lastResult.concurso]);

  useEffect(() => {
    // Initial fetch
    fetchLatestResult();
  }, []); // Only on mount

  useEffect(() => {
    if (isAutoSync) {
      const intervalId = setInterval(() => {
        console.log("Auto-syncing latest results...");
        fetchLatestResult();
      }, 86400000); // 24 hours

      return () => clearInterval(intervalId);
    }
  }, [isAutoSync, fetchLatestResult]);

  const handleUpdate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedData(null);

    try {
        // Always get the freshest result before generating
        await fetchLatestResult();
        // Use a function callback with setLastResult to ensure generateLocalGames gets the most recent state
        setLastResult(currentLastResult => {
            const result = generateLocalGames(config, currentLastResult);
            setGeneratedData(result);
            return currentLastResult; // state doesn't change here
        });
        setLastUpdated(new Date());
    } catch (e: any) {
        setError(e.message || 'Ocorreu um erro desconhecido ao gerar os jogos.');
    } finally {
        setIsLoading(false);
    }
  }, [config, fetchLatestResult]);

  const clearGeneratedData = () => {
    setGeneratedData(null);
  }

  return (
    <div className="bg-[#0D0D1A] min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <Header 
          onUpdate={handleUpdate} 
          isLoading={isLoading} 
          lastUpdated={lastUpdated} 
          isAutoSync={isAutoSync}
          onAutoSyncChange={setIsAutoSync}
        />

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Erro! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {generatedData && (
          <GeneratedGamesCard 
            generatedData={generatedData}
            onClear={clearGeneratedData}
          />
        )}
        
        <ConfigCard config={config} setConfig={setConfig} nextConcurso={lastResult.concurso + 1} />
        <AdvancedSettingsCard config={config} setConfig={setConfig} />
        <GameCheckerCard lastResult={lastResult} />
        <LastResultCard result={lastResult} />
        <PrizeDistributionCard result={lastResult} />

        <footer className="text-center text-gray-500 text-sm mt-4">
          <p>&copy; {new Date().getFullYear()} Sistema Lotomania Ultra. Ferramenta para fins de entretenimento.</p>
          <p>Lembre-se de jogar com responsabilidade.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;