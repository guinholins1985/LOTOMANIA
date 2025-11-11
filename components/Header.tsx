import React, { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';
import { SignalIcon, ClockIcon, LightningIcon } from './Icons';

interface HeaderProps {
  onUpdate: () => void;
  isLoading: boolean;
  lastUpdated: Date;
  isAutoSync: boolean;
  onAutoSyncChange: (value: boolean) => void;
}

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " anos atrás";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses atrás";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " dias atrás";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " horas atrás";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutos atrás";
  if (seconds < 10) return "agora mesmo";
  return Math.floor(seconds) + " segundos atrás";
};

const Header: React.FC<HeaderProps> = ({ onUpdate, isLoading, lastUpdated, isAutoSync, onAutoSyncChange }) => {
  const [isSystemOn, setIsSystemOn] = useState(false);
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(lastUpdated));

  useEffect(() => {
    setTimeAgo(formatTimeAgo(lastUpdated));
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(lastUpdated));
    }, 5000); // update every 5 seconds
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <SignalIcon className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">Sistema Lotomania Ultra</h1>
            <p className="text-sm text-gray-400">Modo Manual</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full">
          <span className={`text-sm font-bold ${isSystemOn ? 'text-green-400' : 'text-gray-400'}`}>{isSystemOn ? 'ON' : 'OFF'}</span>
          <ToggleSwitch checked={isSystemOn} onChange={setIsSystemOn} />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-gray-300">
        <div className="flex items-center gap-2 text-sm">
          <ClockIcon className="w-5 h-5" />
          <span>Última atualização: {timeAgo}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Auto-sync</span>
          <ToggleSwitch checked={isAutoSync} onChange={onAutoSyncChange} />
        </div>
      </div>
      <button 
        onClick={onUpdate}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full text-white font-bold py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-yellow-500/20 border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-b-4">
        {isLoading ? (
          <>
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Atualizando...
          </>
        ) : (
          <>
            <LightningIcon className="w-5 h-5" />
            <span>Atualizar Agora</span>
          </>
        )}
      </button>
    </header>
  );
};

export default Header;