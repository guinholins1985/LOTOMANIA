import React, { useState, useRef } from 'react';
import { LastResult, CheckedGame } from '../types';
import { UploadIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface GameCheckerCardProps {
  lastResult: LastResult;
}

const GameCheckerCard: React.FC<GameCheckerCardProps> = ({ lastResult }) => {
  const [checkedGames, setCheckedGames] = useState<CheckedGame[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const winningNumbers = new Set(lastResult.numeros);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setCheckedGames([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '' && !isNaN(parseInt(line.trim().charAt(0), 10)));
        
        const games: CheckedGame[] = lines.map((line, index) => {
          const cleanedLine = line.replace(/^.*?:\s*/, '');
          const gameNumbersStr = cleanedLine.split(/,?\s+/).filter(n => !isNaN(parseInt(n, 10)));
          
          if (gameNumbersStr.length !== 50) {
             throw new Error(`O Jogo na linha ${index + 1} não contém 50 números. Verifique o arquivo.`);
          }

          const gameNumbers = gameNumbersStr.map(n => String(n).padStart(2, '0'));
          const hits = new Set<string>();
          gameNumbers.forEach(num => {
            if (winningNumbers.has(num)) {
              hits.add(num);
            }
          });
          
          return {
            gameNumbers,
            hitCount: hits.size,
            hits,
          };
        });

        if (games.length === 0) {
            throw new Error("Nenhum jogo válido encontrado no arquivo. Certifique-se de que cada linha contém 50 números separados por vírgula ou espaço.");
        }

        setCheckedGames(games);
      } catch (err: any) {
        setError(err.message || 'Erro ao processar o arquivo. Verifique o formato.');
        setFileName(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
        setError('Falha ao ler o arquivo.');
        setFileName(null);
    }
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearResults = () => {
    setCheckedGames([]);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-[#1A1A2E] p-6 rounded-2xl border-t-2 border-l-2 border-green-500/50 shadow-2xl shadow-green-500/10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            Conferidor de Jogos
          </h2>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt"
            className="hidden"
          />
          <button 
            onClick={triggerFileInput} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm text-white font-semibold py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
          >
            <UploadIcon className="w-5 h-5" />
            <span>Importar e Conferir TXT</span>
          </button>
      </div>

      {error && <p className="text-sm text-red-400 bg-red-500/20 p-3 rounded-lg">{error}</p>}

      {fileName && !error && (
        <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-300">Conferindo arquivo: <span className="font-bold text-white">{fileName}</span></p>
          <button onClick={clearResults} className="text-gray-400 hover:text-white" aria-label="Limpar resultados">
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {checkedGames.length > 0 && (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {checkedGames.map((game, index) => (
                <div key={index} className="bg-black/20 p-4 rounded-lg">
                    <h3 className="font-bold text-white mb-3">Jogo {index + 1} - <span className="text-green-400">{game.hitCount} Acertos</span></h3>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {game.gameNumbers.map((num) => {
                            const isHit = game.hits.has(num);
                            return (
                                <div key={num} className={`aspect-square flex items-center justify-center text-xs font-bold rounded-lg shadow-inner
                                  ${isHit
                                    ? 'bg-green-500 text-white'
                                    : 'bg-fuchsia-600 text-white'
                                  }`
                                }>
                                  {num}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default GameCheckerCard;
