import React from 'react';
import { LastResult } from '../types';
import { CalendarIcon, CheckCircleIcon } from './Icons';

interface LastResultCardProps {
  result: LastResult;
}

const LastResultCard: React.FC<LastResultCardProps> = ({ result }) => {
  return (
    <div className="bg-[#1A1A2E] p-6 rounded-2xl border-t-2 border-l-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-100">Último Resultado</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CheckCircleIcon className="w-5 h-5 text-cyan-400" />
            <span>Concurso: {result.concurso}</span>
            <span className="text-gray-600">|</span>
            <CalendarIcon className="w-5 h-5 text-cyan-400" />
            <span>Data: {result.data}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {result.numeros.map((numero) => (
          <div
            key={numero}
            className="aspect-square flex items-center justify-center text-sm font-bold text-gray-800 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-lg shadow-md shadow-cyan-500/10"
          >
            {numero}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LastResultCard;
