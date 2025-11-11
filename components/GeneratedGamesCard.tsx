import React, { useState } from 'react';
import { SparklesIcon, CopyIcon, CloseIcon, CheckIcon, DownloadIcon } from './Icons';
import { GeneratedGames } from '../types';

interface GeneratedGamesCardProps {
  generatedData: GeneratedGames;
  onClear: () => void;
}

const GeneratedGamesCard: React.FC<GeneratedGamesCardProps> = ({ generatedData, onClear }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (gameNumbers: string[], index: number) => {
    navigator.clipboard.writeText(gameNumbers.join(', '));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
  };

  const handleExport = () => {
    // Format the games to be one game per line, with numbers separated by ", ".
    // This format is compatible with the GameCheckerCard's import logic.
    const gamesText = generatedData.games
      .map(game => game.join(', '))
      .join('\n');
    
    const fileContent = gamesText;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jogos-lotomania-ultra.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="bg-[#1A1A2E] p-6 rounded-2xl border-2 border-green-500/30 shadow-2xl shadow-green-500/10 relative animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-green-400/20 p-2 rounded-full border-2 border-green-400/50">
            <SparklesIcon className="w-7 h-7 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-400">Jogos Gerados com IA</h2>
            <p className="text-gray-300 font-semibold">Análise e Jogos Estratégicos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button
            onClick={handleExport}
            className="flex items-center gap-2 text-xs text-cyan-300 font-semibold py-1 px-2 rounded-md bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors"
            aria-label="Exportar jogos para TXT"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>Exportar TXT</span>
          </button>
          <button onClick={onClear} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
      </div>


      <div className="bg-black/20 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-lg text-green-300 mb-2">Análise Estratégica da IA:</h3>
        <p className="text-gray-300 text-sm whitespace-pre-wrap">{generatedData.analysis}</p>
      </div>

      <div>
        <h3 className="font-semibold text-lg text-green-300 mb-4">Jogos Sugeridos:</h3>
        <div className="grid grid-cols-1 gap-4">
          {generatedData.games.map((game, index) => (
            <div key={index} className="bg-black/20 p-4 rounded-lg flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-200">Jogo {index + 1}</h4>
                <button
                  onClick={() => handleCopy(game, index)}
                  className="flex items-center gap-2 text-xs text-cyan-300 font-semibold py-1 px-2 rounded-md bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors"
                  aria-label={`Copiar jogo ${index + 1}`}
                >
                  {copiedIndex === index ? (
                    <>
                      <CheckIcon className="w-4 h-4 text-green-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {game.map(num => (
                  <div key={num} className="aspect-square flex items-center justify-center text-sm font-bold text-gray-800 bg-gradient-to-br from-green-300 to-cyan-400 rounded-lg shadow-md shadow-green-500/10">
                    {num}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneratedGamesCard;