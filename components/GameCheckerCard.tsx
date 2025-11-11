import React, { useState, useCallback, useRef } from 'react';
import { LastResult } from '../types';
import { UploadIcon } from './Icons';

interface GameCheckResult {
  game: string[];
  hits: number;
  hitNumbers: string[];
}

interface GameCheckerCardProps {
  lastResult: LastResult;
}

const GameCheckerCard: React.FC<GameCheckerCardProps> = ({ lastResult }) => {
  const [gamesToCheck, setGamesToCheck] = useState('');
  const [checkResults, setCheckResults] = useState<GameCheckResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheckGames = useCallback(() => {
    const lastResultNumbers = new Set(lastResult.numeros);
    const lines = gamesToCheck.split('\n').filter(line => line.trim() !== '');
    
    const results: GameCheckResult[] = lines.map(line => {
      // Split by comma, semicolon, or one or more whitespace characters
      const gameNumbers = line.split(/[,;\s]+/).map(n => n.trim().padStart(2, '0')).filter(n => !isNaN(parseInt(n)) && n.length > 0);
      const uniqueGameNumbers = Array.from(new Set(gameNumbers));

      const hitNumbers = uniqueGameNumbers.filter(num => lastResultNumbers.has(num));
      return {
        game: uniqueGameNumbers,
        hits: hitNumbers.length,
        hitNumbers: hitNumbers,
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

  return (
    <div className="bg-[#1A1A2E] p-6 rounded-2xl border-t-2 border-l-2 border-blue-500/50 shadow-2xl shadow-blue-500/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-100">Conferidor de Jogos</h2>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".txt"
            className="hidden"
          />
          <button
            onClick={triggerFileUpload}
            className="flex items-center gap-2 text-xs text-cyan-300 font-semibold py-1 px-2 rounded-md bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors"
            aria-label="Importar jogos de arquivo TXT"
          >
            <UploadIcon className="w-4 h-4" />
            <span>Importar TXT</span>
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Cole seus jogos abaixo (um por linha, números separados por vírgula, espaço ou ponto e vírgula) para conferir com o resultado do concurso {lastResult.concurso}.
      </p>
      
      <textarea
        value={gamesToCheck}
        onChange={(e) => setGamesToCheck(e.target.value)}
        rows={6}
        placeholder="Ex: 01, 02, 03, ..., 50&#10;05, 10, 15, ..., 99"
        className="w-full bg-[#10101A] border-2 border-blue-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-4"
      />
      
      <button
        onClick={handleCheckGames}
        disabled={!gamesToCheck.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Conferir Jogos
      </button>
      
      {checkResults.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg text-blue-300 mb-4">Resultados da Conferência:</h3>
          <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-2">
            {checkResults.map((result, index) => (
              <div key={index} className="bg-black/20 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-200">Jogo {index + 1}</h4>
                  <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                    result.hits >= 15 ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {result.hits} Acertos
                  </span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {result.game.slice(0, 50).map(num => {
                      const isHit = result.hitNumbers.includes(num);
                      return (
                        <div
                            key={num}
                            className={`aspect-square flex items-center justify-center text-sm font-bold rounded-lg transition-all
                            ${isHit ? 'bg-green-400 text-gray-900 ring-2 ring-green-300' : 'bg-gray-600 text-gray-200'}`}
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
