
import React from 'react';
import { CurrencyDollarIcon } from './Icons';
import { LastResult } from '../types';

interface PrizeDistributionCardProps {
  result: LastResult;
}

const PrizeDistributionCard: React.FC<PrizeDistributionCardProps> = ({ result }) => {
  return (
    <div className="bg-[#1A1A2E] p-6 rounded-2xl border-t-2 border-l-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-100">Distribuição de Prêmios</h2>
          <p className="text-sm text-gray-400">Referente ao Concurso {result.concurso}</p>
        </div>
        <div className="w-full sm:w-auto text-center p-3 bg-black/20 rounded-lg">
          <p className="text-xs text-yellow-300 font-semibold">Acumulado próximo concurso</p>
          <p className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <CurrencyDollarIcon className="w-6 h-6 text-yellow-400" />
            {result.acumuladoProximoConcurso}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-black/20">
            <tr>
              <th scope="col" className="px-4 py-3">Acertos</th>
              <th scope="col" className="px-4 py-3 text-center">Vencedores</th>
              <th scope="col" className="px-4 py-3 text-right">Prêmio</th>
            </tr>
          </thead>
          <tbody>
            {result.premiacao.map((item, index) => (
              <tr key={index} className="border-b border-gray-700 hover:bg-gray-800/50">
                <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  {item.acertos}
                </th>
                <td className="px-4 py-3 text-center">{item.vencedores.toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3 text-right font-mono">{item.premio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrizeDistributionCard;
