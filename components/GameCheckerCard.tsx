import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { LastResult } from '../types';
import { UploadIcon, XCircleIcon, CurrencyDollarIcon, TrophyIcon, CalendarIcon, ChartBarIcon } from './Icons';
import { CheckedGame, SummaryData } from '../types';
import { fetchResultByConcurso } from '../services/geminiService';

interface GameCheckerCardProps {
  lastResult: LastResult;
}

const COST_PER_GAME = 3.00;

const parsePrize = (prizeStr: string): number => {
    if (!prizeStr) return 0;
    return parseFloat(prizeStr.replace("R$ ", "").replace(/\./g, "").replace(",", "."));
};

const calculateSummary = (checkResults: CheckedGame[], hasPrizeData: boolean): SummaryData | null => {
    if (checkResults.length === 0) return null;

    const totalGames = checkResults.length;
    const totalCost = totalGames * COST_PER_GAME;
    const winningGames = checkResults.filter(r => r.prize > 0);
    const totalWinnings = winningGames.reduce((acc, game) => acc + game.prize, 0);
    const netResult = totalWinnings - totalCost;
    
    const hitsDistribution = new Map<number, number>();
    winningGames.forEach(game => {
        hitsDistribution.set(game.hits, (hitsDistribution.get(game.hits) || 0) + 1);
    });

    const sortedDistribution = Array.from(hitsDistribution.entries())
      .sort((a, b) => b[0] - a[0]);

    return { 
        totalGames, 
        totalWinningGames: winningGames.length, 
        totalWinnings, 
        totalCost,
        netResult,
        sortedDistribution,
        hasPrizeData
    };
};


const GameCheckerCard: React.FC<GameCheckerCardProps> = ({ lastResult }) => {
  const [gamesToCheck, setGamesToCheck] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startConcurso, setStartConcurso] = useState(lastResult.concurso.toString());
  const [endConcurso, setEndConcurso] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  interface ContestCheckResult {
    summary: SummaryData;
    details: CheckedGame[];
    concursoData: LastResult;
  }
  const [multiCheckResults, setMultiCheckResults] = useState<Map<number, ContestCheckResult>>(new Map());
  const [grandSummary, setGrandSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    if(lastResult?.concurso) {
        setStartConcurso(lastResult.concurso.toString());
        setEndConcurso('');
    }
  }, [lastResult.concurso]);


  const handleCheckGames = useCallback(async () => {
    setIsChecking(true);
    setCheckError(null);
    setMultiCheckResults(new Map());
    setGrandSummary(null);

    try {
        const startNum = parseInt(startConcurso, 10);
        const endNum = endConcurso ? parseInt(endConcurso, 10) : startNum;

        if (isNaN(startNum) || startNum <= 0 || isNaN(endNum) || endNum < startNum) {
            throw new Error("Intervalo de concursos inválido. Verifique os números.");
        }

        const concursosToCheck = Array.from({ length: endNum - startNum + 1 }, (_, i) => startNum + i);
        
        const fetchedResults = await Promise.all(
            concursosToCheck.map(concurso => {
                if (concurso === lastResult.concurso) {
                    return Promise.resolve(lastResult);
                }
                return fetchResultByConcurso(concurso);
            })
        );
        
        const lines = gamesToCheck.split('\n').filter(line => line.trim() !== '');
        const parsedGames = lines.map(line => {
            const gameNumbers = line.split(/[,;\s]+/).map(n => n.trim().padStart(2, '0')).filter(n => !isNaN(parseInt(n)) && n.length > 0);
            return Array.from(new Set(gameNumbers));
        });

        const resultsByConcurso = new Map<number, ContestCheckResult>();

        for (const resultToUse of fetchedResults) {
            const resultNumbers = new Set(resultToUse.numeros);
            const prizeMap = new Map<number, number>();
            const hasPrizeData = resultToUse.premiacao && resultToUse.premiacao.length > 0;

            if (hasPrizeData) {
              resultToUse.premiacao.forEach(p => {
                  prizeMap.set(p.acertos, parsePrize(p.premio));
              });
            }

            const details: CheckedGame[] = parsedGames.map(gameNumbers => {
              const hitNumbers = new Set(gameNumbers.filter(num => resultNumbers.has(num)));
              const hits = hitNumbers.size;
              const prize = hasPrizeData ? (prizeMap.get(hits) || 0) : -1;
              return { game: gameNumbers, hits, hitNumbers, prize };
            });

            const summary = calculateSummary(details, hasPrizeData);
            if (summary) {
                resultsByConcurso.set(resultToUse.concurso, { summary, details, concursoData: resultToUse });
            }
        }
        setMultiCheckResults(resultsByConcurso);

        // Calculate Grand Summary
        const totalGames = parsedGames.length;
        let totalCost = 0;
        let totalWinnings = 0;
        let totalWinningInstances = 0;
        const grandHitsDistribution = new Map<number, number>();
        let anyPrizeDataAvailable = false;

        resultsByConcurso.forEach(result => {
            totalCost = result.summary.totalCost; // Cost is per-contest check, not aggregated
            if (result.summary.hasPrizeData) {
              anyPrizeDataAvailable = true;
              totalWinnings += result.summary.totalWinnings;
            }
            totalWinningInstances += result.summary.totalWinningGames;
            result.summary.sortedDistribution.forEach(([hits, count]) => {
                grandHitsDistribution.set(hits, (grandHitsDistribution.get(hits) || 0) + count);
            });
        });
        
        setGrandSummary({
            totalGames: parsedGames.length * concursosToCheck.length,
            totalWinningGames: totalWinningInstances,
            totalWinnings,
            totalCost: parsedGames.length * COST_PER_GAME * concursosToCheck.length,
            netResult: totalWinnings - (parsedGames.length * COST_PER_GAME * concursosToCheck.length),
            sortedDistribution: Array.from(grandHitsDistribution.entries()).sort((a, b) => b[0] - a[0]),
            hasPrizeData: anyPrizeDataAvailable
        });

    } catch (e) {
        if (e instanceof Error) {
            setCheckError(e.message);
        } else {
            setCheckError('Ocorreu um erro desconhecido ao conferir os jogos.');
        }
    } finally {
        setIsChecking(false);
    }
  }, [gamesToCheck, lastResult, startConcurso, endConcurso]);
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setCheckError(null);

    // FIX: Explicitly type the 'file' parameter as 'File' to resolve type inference issues.
    const promises = Array.from(files).map((file: File) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.onerror = () => {
          reject(new Error(`Erro ao ler o arquivo ${file.name}`));
        };
        reader.readAsText(file);
      });
    });

    Promise.all(promises)
      .then(contents => {
        const newContent = contents.join('\n');
        setGamesToCheck(prev => (prev.trim() ? prev.trim() + '\n' : '') + newContent);
      })
      .catch((error: Error) => {
        setCheckError(error.message);
      });

    // Reset file input to allow re-uploading the same file
    if (event.target) {
      event.target.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearChecker = () => {
      setGamesToCheck('');
      setMultiCheckResults(new Map());
      setGrandSummary(null);
      setCheckError(null);
      if (lastResult?.concurso) {
        setStartConcurso(lastResult.concurso.toString());
        setEndConcurso('');
      }
  }

  const contestRange = useMemo(() => {
    const startNum = parseInt(startConcurso, 10);
    const endNum = endConcurso ? parseInt(endConcurso, 10) : startNum;
    if (!isNaN(startNum) && startNum > 0 && !isNaN(endNum) && endNum >= startNum) {
        return endNum - startNum + 1;
    }
    return 1;
  }, [startConcurso, endConcurso]);

  return (
    <div className="bg-[#1A1A2E] p-6 rounded-2xl border-t-2 border-l-2 border-blue-500/50 shadow-2xl shadow-blue-500/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-100">Conferidor de Jogos</h2>
        <div className="flex items-center gap-2">
           <input
            type="file" ref={fileInputRef} onChange={handleFileImport}
            accept=".txt" className="hidden" multiple
          />
          <button onClick={triggerFileUpload} className="flex items-center gap-2 text-xs text-cyan-300 font-semibold py-1 px-2 rounded-md bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors" >
            <UploadIcon className="w-4 h-4" />
            <span>Importar Arquivo(s)</span>
          </button>
           { (gamesToCheck || multiCheckResults.size > 0) &&
            <button onClick={clearChecker} className="text-gray-400 hover:text-white transition-colors">
                <XCircleIcon className="w-6 h-6" />
            </button>
           }
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Cole seus jogos abaixo ou importe um ou mais arquivos .txt para conferir com o resultado de um ou mais concursos. Cada jogo tem o custo de R$ {COST_PER_GAME.toFixed(2)}.
      </p>

      <p className="text-xs text-yellow-400 mb-4 bg-yellow-500/10 p-2 rounded-md border border-yellow-500/30">
        <strong>Aviso:</strong> A conferência em um grande intervalo de concursos (<strong>{contestRange} selecionado{contestRange > 1 ? 's' : ''}</strong>) busca dados da fonte oficial. Os resultados são salvos localmente para otimizar buscas futuras. Em caso de falha na rede, o sistema usará o banco de dados histórico local (sem dados de prêmios).
      </p>
      
      <textarea
        value={gamesToCheck} onChange={(e) => setGamesToCheck(e.target.value)}
        rows={6} placeholder="Ex: 01, 02, 03, ..., 50&#10;05, 10, 15, ..., 99"
        className="w-full bg-[#10101A] border-2 border-blue-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-4 mt-4">
        <div className="flex-grow">
            <label htmlFor="startConcurso" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                <CalendarIcon className="w-4 h-4" />
                Concurso Inicial
            </label>
            <input
                id="startConcurso"
                type="number"
                value={startConcurso}
                onChange={(e) => setStartConcurso(e.target.value)}
                placeholder={lastResult.concurso.toString()}
                className="w-full bg-[#10101A] border-2 border-blue-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
        </div>
        <div className="flex-grow">
            <label htmlFor="endConcurso" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                <CalendarIcon className="w-4 h-4" />
                Concurso Final (Opcional)
            </label>
            <input
                id="endConcurso"
                type="number"
                value={endConcurso}
                onChange={(e) => setEndConcurso(e.target.value)}
                placeholder="Ex: 2810"
                className="w-full bg-[#10101A] border-2 border-blue-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
        </div>
        <button onClick={handleCheckGames} disabled={!gamesToCheck.trim() || isChecking} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
             {isChecking && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isChecking ? 'Conferindo...' : 'Conferir Jogos'}
        </button>
      </div>

      {checkError && (
          <div className="mt-4 bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Erro! </strong>
              <span className="block sm:inline">{checkError}</span>
          </div>
      )}
      
      {grandSummary && (
        <div className="mt-6 bg-black/30 p-4 rounded-xl border border-blue-400/30 animate-fade-in">
            <h3 className="font-semibold text-lg text-blue-300 mb-4 flex items-center gap-2"><ChartBarIcon className="w-5 h-5"/> Resumo Geral da Conferência</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Ganhos Totais</p>
                    {grandSummary.hasPrizeData ? (
                        <p className="text-xl font-bold text-green-400 flex items-center justify-center gap-1">
                            <CurrencyDollarIcon className="w-5 h-5" />
                            {grandSummary.totalWinnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    ) : <p className="text-xl font-bold text-yellow-400">N/A</p> }
                </div>
                 <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Valor Gasto</p>
                    <p className="text-xl font-bold text-red-400 flex items-center justify-center gap-1">
                        <CurrencyDollarIcon className="w-5 h-5" />
                        {grandSummary.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Total de Prêmios</p>
                    <p className="text-xl font-bold text-white">{grandSummary.totalWinningGames}</p>
                </div>
                 <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Lucro / Prejuízo</p>
                     {grandSummary.hasPrizeData ? (
                        <p className={`text-xl font-bold flex items-center justify-center gap-1 ${grandSummary.netResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {grandSummary.netResult >= 0 ? '+' : ''}
                            <CurrencyDollarIcon className="w-5 h-5" />
                            {grandSummary.netResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                     ) : <p className="text-xl font-bold text-yellow-400">N/A</p> }
                </div>
            </div>
        </div>
      )}

      {Array.from(multiCheckResults.values()).map(({ summary, details, concursoData }) => (
        <div key={concursoData.concurso} className="mt-6 animate-fade-in">
          <h3 className="font-semibold text-lg text-blue-300 mb-4">Relatório da Conferência (Concurso {concursoData.concurso})</h3>
            <div className="bg-black/20 p-4 rounded-lg grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-center">
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Ganhos Totais</p>
                    {summary.hasPrizeData ? (
                        <p className="text-xl font-bold text-green-400 flex items-center justify-center gap-1">
                            <CurrencyDollarIcon className="w-5 h-5" />
                            {summary.totalWinnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    ) : <p className="text-xl font-bold text-yellow-400">N/A</p>}
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Custo (Jogos)</p>
                    <p className="text-xl font-bold text-red-400 flex items-center justify-center gap-1">
                        <CurrencyDollarIcon className="w-5 h-5" />
                        {summary.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Jogos Premiados</p>
                    <p className="text-xl font-bold text-white">{summary.totalWinningGames} / {summary.totalGames}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Resultado</p>
                    {summary.hasPrizeData ? (
                        <p className={`text-xl font-bold flex items-center justify-center gap-1 ${summary.netResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {summary.netResult >= 0 ? '+' : ''}
                            <CurrencyDollarIcon className="w-5 h-5" />
                            {summary.netResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    ) : <p className="text-xl font-bold text-yellow-400">N/A</p>}
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
            {details.map((result, index) => (
              <div key={index} className="bg-black/20 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-200">Jogo {index + 1}</h4>
                   <div className="flex items-center gap-4">
                     {result.prize > 0 && (
                        <span className="font-bold text-green-400 text-sm">
                            Prêmio: R$ {result.prize.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                     )}
                     {result.prize === 0 && (
                        <span className="font-bold text-gray-400 text-sm">
                            Não Premiado
                        </span>
                     )}
                      {result.prize < 0 && (
                        <span className="font-bold text-yellow-400 text-sm">
                            Prêmio N/A
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
      ))}
    </div>
  );
};

export default GameCheckerCard;
