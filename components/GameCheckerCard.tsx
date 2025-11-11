import React, { useState, useCallback, useRef, useMemo } from 'react';
import { LastResult } from '../types';
import { UploadIcon, XCircleIcon, CurrencyDollarIcon, TrophyIcon } from './Icons';
import { CheckedGame } from '../types';

interface GameCheckerCardProps {
  lastResult: LastResult;
}

const parsePrize = (prizeStr: string): number => {
    if (!prizeStr) return 0;
    // Remove "R$ ", dots for thousands, and replace comma with dot for decimal
    return parseFloat(prizeStr.replace("R$ ", "").replace(/\./g, "").replace(",", "."));
};


const GameCheckerCard: React.FC<GameCheckerCardProps> = ({ lastResult }) => {
  const [gamesToCheck, setGamesToCheck] = useState('');
  const [checkResults, setCheckResults] = useState<CheckedGame[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheckGames = useCallback(() => {
    const lastResultNumbers = new Set(lastResult.numeros);
    
    const prizeMap = new Map<number, number>();
    lastResult.premiacao.forEach(p => {
        prizeMap.set(p.acertos, parsePrize(p.premio));
    });

    const lines = gamesToCheck.split('\n').filter(line => line.trim() !== '');
    
    const results: CheckedGame[] = lines.map(line => {
      const gameNumbers = line.split(/[,;\s]+/).map(n => n.trim().padStart(2, '0')).filter(n => !isNaN(parseInt(n)) && n.length > 0);
      const uniqueGameNumbers = Array.from(new Set(gameNumbers));

      const hitNumbers = new Set(uniqueGameNumbers.filter(num => lastResultNumbers.has(num)));
      const hits = hitNumbers.size;
      const prize = prizeMap.get(hits) || 0;

      return {
        game: uniqueGameNumbers,
        hits: hits,
        hitNumbers: hitNumbers,
        prize: prize
      };
    });

    setCheckResults(results);
  }, [gamesToCheck, lastResult]);
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setGamesToCheck(text);
      };
      reader.readAsText(file);
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearChecker = () => {
      setGamesToCheck('');
      setCheckResults([]);
  }

  const summary = useMemo(() => {
    if (checkResults.length === 0) return null;

    const winningGames = checkResults.filter(r => r.prize > 0);
    const totalWinnings = winningGames.reduce((acc, game) => acc + game.prize, 0);
    
    const hitsDistribution = new Map<number, number>();
    winningGames.forEach(game => {
        hitsDistribution.set(game.hits, (hitsDistribution.get(game.hits) || 0) + 1);
    });

    const sortedDistribution = Array.from(hitsDistribution.entries())
      .sort((a, b) => b[0] - a[0]); // Sort by number of hits, descending

    return { 
        totalGames: checkResults.length, 
        totalWinningGames: winningGames.length, 
        totalWinnings, 
        sortedDistribution 
    };
  }, [checkResults]);

  return (
    <div className="bg-[#1A1A2E] p-6 rounded-2xl border-t-2 border-l-2 border-blue-500/50 shadow-2xl shadow-blue-500/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-100">Conferidor de Jogos</h2>
        <div className="flex items-center gap-2">
           <input
            type="file" ref={fileInputRef} onChange={handleFileImport}
            accept=".txt" className="hidden"
          />
          <button onClick={triggerFileUpload} className="flex items-center gap-2 text-xs text-cyan-300 font-semibold py-1 px-2 rounded-md bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors" >
            <UploadIcon className="w-4 h-4" />
            <span>Importar TXT</span>
          </button>
           { (gamesToCheck || checkResults.length > 0) &&
            <button onClick={clearChecker} className="text-gray-400 hover:text-white transition-colors">
                <XCircleIcon className="w-6 h-6" />
            </button>
           }
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Cole seus jogos abaixo ou importe um arquivo .txt para conferir com o resultado do concurso {lastResult.concurso}.
      </p>
      
      <textarea
        value={gamesToCheck} onChange={(e) => setGamesToCheck(e.target.value)}
        rows={6} placeholder="Ex: 01, 02, 03, ..., 50&#10;05, 10, 15, ..., 99"
        className="w-full bg-[#10101A] border-2 border-blue-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-4"
      />
      
      <button onClick={handleCheckGames} disabled={!gamesToCheck.trim()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors">
        Conferir Jogos
      </button>
      
      {summary && (
        <div className="mt-6 animate-fade-in">
          <h3 className="font-semibold text-lg text-blue-300 mb-4">Relatório da Conferência</h3>
            <div className="bg-black/20 p-4 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-center">
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Total Faturado</p>
                    <p className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
                        <CurrencyDollarIcon className="w-6 h-6" />
                        {summary.totalWinnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Jogos Conferidos</p>
                    <p className="text-2xl font-bold text-white">{summary.totalGames}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Jogos Premiados</p>
                    <p className="text-2xl font-bold text-white">{summary.totalWinningGames}</p>
                </div>
            </div>
            
            {summary.sortedDistribution.length > 0 && (
                <div className="bg-black/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-md text-gray-200 mb-2 flex items-center gap-2"><TrophyIcon className="w-5 h-5 text-yellow-400" /> Resumo de Prêmios:</h4>
                    <ul className="text-sm text-gray-300 space-y-1 pl-2">
                        {summary.sortedDistribution.map(([hits, count]) => (
                            <li key={hits}>
                                <span className="font-bold text-white">{count} Jogo{count > 1 ? 's' : ''}</span> com <span className="font-bold text-white">{hits} Acertos</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
          <h3 className="font-semibold text-lg text-blue-300 mt-6 mb-4">Detalhes dos Jogos:</h3>
          <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-2">
            {checkResults.map((result, index) => (
              <div key={index} className="bg-black/20 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-200">Jogo {index + 1}</h4>
                   <div className="flex items-center gap-4">
                     {result.prize > 0 && (
                        <span className="font-bold text-green-400 text-sm">
                            Prêmio: R$ {result.prize.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                     )}
                     <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                        result.prize > 0 ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-300'
                     }`}>
                        {result.hits} Acertos
                    </span>
                   </div>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {result.game.slice(0, 50).map(num => {
                      const isHit = result.hitNumbers.has(num);
                      return (
                        <div
                            key={num}
                            className={`aspect-square flex items-center justify-center text-sm font-bold rounded-lg transition-all
                            ${isHit ? 'bg-green-400 text-gray-900 ring-2 ring-green-300 shadow-lg shadow-green-500/20' : 'bg-fuchsia-800/80 text-fuchsia-100'}`}
                        >
                            {num}
                        </div>
                      );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCheckerCard;