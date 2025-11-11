import React from 'react';
import { TrophyIcon, StarIcon, LightningIcon, CalendarIcon } from './Icons';
import { GameConfig } from '../types';

interface InputFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: keyof GameConfig;
  helperText: string;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ icon, label, value, onChange, name, helperText, placeholder }) => (
  <div className="flex flex-col gap-2">
    <label className="flex items-center gap-2 text-md font-semibold text-gray-200">
      {icon}
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-[#10101A] border-2 border-purple-500/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
    />
    <p className="text-xs text-cyan-400">{helperText}</p>
  </div>
);

interface ConfigCardProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  nextConcurso: number;
}

const ConfigCard: React.FC<ConfigCardProps> = ({ config, setConfig, nextConcurso }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: value,
    }));
  };

  return (
    <div className="bg-[#1A1A2E] p-6 rounded-2xl border-t-2 border-l-2 border-purple-500/50 shadow-2xl shadow-purple-500/10">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-100">Algoritmo matemático de alta precisão para acertos de 16-20 pontos</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField 
          icon={<TrophyIcon className="w-5 h-5 text-yellow-400" />}
          label="Quantidade de Jogos"
          name="numGames"
          value={config.numGames}
          onChange={handleChange}
          helperText="Precisão otimizada: 20-50"
        />
        <InputField 
          icon={<StarIcon className="w-5 h-5 text-yellow-400" />}
          label="Números Fixos no Próximo"
          name="fixedNumbers"
          value={config.fixedNumbers}
          onChange={handleChange}
          helperText="Fixar 0-15 números do último concurso"
        />
        <InputField 
          icon={<LightningIcon className="w-5 h-5 text-yellow-400" />}
          label="Grupos de 50"
          name="groups"
          value={config.groups}
          onChange={handleChange}
          helperText="Cobertura máxima estratégica"
        />
        <InputField 
          icon={<CalendarIcon className="w-5 h-5 text-yellow-400" />}
          label="Concurso Alvo"
          name="targetConcurso"
          value={config.targetConcurso}
          onChange={handleChange}
          placeholder={`Ex: ${nextConcurso}`}
          helperText="Análise específica"
        />
      </div>
    </div>
  );
};

export default ConfigCard;