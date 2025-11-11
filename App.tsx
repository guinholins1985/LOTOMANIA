
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
  concurso: 2809,
  data: '13/08/2025',
  numeros: [
    '03', '08', '11', '19', '25', '30', '41', '48', '50', '53', 
    '65', '71', '72', '75', '81', '84', '88', '95', '96', '99'
  ],
  acumuladoProximoConcurso: "R$ 2.700.000,00",
  premiacao: [
    { acertos: 20, vencedores: 0, premio: "R$ 0,00" },
    { acertos: 19, vencedores: 3, premio: "R$ 66.992,99" },
    { acertos: 18, vencedores: 55, premio: "R$ 2.283,85" },
    { acertos: 17, vencedores: 442, premio: "R$ 284,18" },
    { acertos: 16, vencedores: 2562, premio: "R$ 49,02" },
    { acertos: 15, vencedores: 11195, premio: "R$ 11,22" },
    { acertos: 0, vencedores: 0, premio: "R$ 0,00" }
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
  });
  const [lastResult, setLastResult] = useState<LastResult>(INITIAL_LAST_RESULT);
  const [generatedData, setGeneratedData] = useState<GeneratedGames | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchLatestResult = useCallback(async () => {
    try {
      const result = await fetchLatestResultFromWeb();
      setLastResult(result);
      setConfig(prev => ({...prev, targetConcurso: (result.concurso + 1).toString()}));
    } catch (e: any) {
      console.error("Failed to fetch latest result, using initial data.", e.message);
      // Keep using INITIAL_LAST_RESULT as fallback
    }
  }, []);

  useEffect(() => {
    fetchLatestResult();
  }, [fetchLatestResult]);

  const handleUpdate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedData(null);

    try {
        // Always get the freshest result before generating
        await fetchLatestResult();
        const result = generateLocalGames(config, lastResult);
        setGeneratedData(result);
        setLastUpdated(new Date());
    } catch (e: any) {
        setError(e.message || 'Ocorreu um erro desconhecido ao gerar os jogos.');
    } finally {
        setIsLoading(false);
    }
  }, [config, lastResult, fetchLatestResult]);

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