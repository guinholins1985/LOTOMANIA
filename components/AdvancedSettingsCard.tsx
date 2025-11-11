import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { LightningIcon, CheckIcon, ArrowPathIcon, EyeIcon, TargetIcon } from './Icons';
import { GameConfig } from '../types';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, label, description, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      {icon}
      <div>
        <h4 className="font-semibold text-gray-200">{label}</h4>
        <p className={`flex items-center gap-1 text-sm ${checked ? 'text-green-400' : 'text-gray-400'}`}>
          {checked && <CheckIcon className="w-4 h-4" />}
          {description}
        </p>
      </div>
    </div>
    <ToggleSwitch checked={checked} onChange={onChange} />
  </div>
);

interface AdvancedSettingsCardProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
}

const AdvancedSettingsCard: React.FC<AdvancedSettingsCardProps> = ({ config, setConfig }) => {
  
  const handleToggle = (key: keyof GameConfig, value: boolean) => {
    setConfig(prev => ({...prev, [key]: value}));
  };

  return (
    <div className="bg-[#1A1A2E] p-6 rounded-2xl border-t-2 border-l-2 border-purple-500/50 shadow-2xl shadow-purple-500/10">
      <h2 className="text-lg font-bold text-gray-100 mb-6 flex items-center gap-2">
        <TargetIcon className="w-6 h-6 text-purple-400" />
        Configurações de Precisão Ultra Avançada
      </h2>
      <div className="flex flex-col gap-6">
        <SettingRow 
          icon={<div className="p-2 bg-purple-500/20 rounded-full"><LightningIcon className="w-6 h-6 text-purple-400" /></div>}
          label="Sistema Ultra Avançado"
          description={config.ultraSystem ? 'Ativado - Máxima Precisão' : 'Desativado'}
          checked={config.ultraSystem}
          onChange={(value) => handleToggle('ultraSystem', value)}
        />
        <SettingRow 
          icon={<div className="p-2 bg-green-500/20 rounded-full"><ArrowPathIcon className="w-6 h-6 text-green-400" /></div>}
          label="Aposta Espelho"
          description={config.mirrorBet ? 'Ativada' : 'Desativada'}
          checked={config.mirrorBet}
          onChange={(value) => handleToggle('mirrorBet', value)}
        />
        <SettingRow 
          icon={<div className="p-2 bg-cyan-500/20 rounded-full"><EyeIcon className="w-6 h-6 text-cyan-400" /></div>}
          label="Análise Avançada"
          description={config.advancedAnalysis ? 'Ativa' : 'Inativa'}
          checked={config.advancedAnalysis}
          onChange={(value) => handleToggle('advancedAnalysis', value)}
        />
      </div>
    </div>
  );
};

export default AdvancedSettingsCard;