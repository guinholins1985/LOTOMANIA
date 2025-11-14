import React from 'react';
import { TrophyIcon, StarIcon, LightningIcon, CalendarIcon, ShieldCheckIcon } from './Icons';
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

interface SelectFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: keyof GameConfig;
  helperText: string;
  children: React.ReactNode;
}

const SelectField: React.FC<SelectFieldProps> = ({ icon, label, value, onChange, name, helperText, children }) => (
  <div className="flex flex-col gap-2">
    <label className="flex items-center gap-2 text-md font-semibold text-gray-200">
      {icon}
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-[#10101A] border-2 border-purple-500/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
    <p className="text-xs text-cyan-400">{helperText}</p>
  </div>
);


interface ConfigCardProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  nextConcurso: number;
}

const ConfigCard: React.FC<ConfigCardProps> = ({ config, setConfig, nextConcurso }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: value,
    }));
  };

  return (
    <div className="bg-[#1A1A2E] p-6 rounded-2xl border-t-2 border-l-2 border-purple-500/50 shadow-2xl shadow-purple-500/10">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-100">Análise por Supercomputador: Um especialista em desdobramentos de Lotomania que analisa padrões, probabilidades e algoritmos avançados para maximizar suas chances de acerto.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField 
          icon={<TrophyIcon className="w-5 h-5 text-yellow-400" />}
          label="Quantidade de Jogos"
          name="numGames"
          value={config.numGames}
          onChange={handleChange}
          helperText="Aumenta a cobertura probabilística."
        />
        <InputField 
          icon={<CalendarIcon className="w-5 h-5 text-yellow-400" />}
          label="Concurso Alvo"
          name="targetConcurso"
          value={config.targetConcurso}
          onChange={handleChange}
          placeholder={`Ex: ${nextConcurso}`}
          helperText="Análise específica para o concurso."
        />
        <InputField 
          icon={<StarIcon className="w-5 h-5 text-yellow-400" />}
          label="Números Fixos no Próximo"
          name="fixedNumbers"
          value={config.fixedNumbers}
          onChange={handleChange}
          helperText="Fixar 0-15 dezenas com alta relevância."
        />
        <InputField 
          icon={<LightningIcon className="w-5 h-5 text-yellow-400" />}
          label="Grupos de 50"
          name="groups"
          value={config.groups}
          onChange={handleChange}
          helperText="Define a cobertura estratégica do universo."
        />
         <div className="md:col-span-2">
           <SelectField
              icon={<ShieldCheckIcon className="w-5 h-5 text-yellow-400" />}
              label="Estratégia de Fechamento Quântico"
              name="closingStrategy"
              value={config.closingStrategy}
              onChange={handleChange}
              helperText="Otimiza a geração para alvos específicos. Estratégias mais altas usam análises de risco mais agressivas."
            >
              <option value="balanced">Estratégia Consistência (15-16 Pontos)</option>
              <option value="target_18">Estratégia Prêmio Alto (17-18 Pontos)</option>
              <option value="target_20">Estratégia Vitória Máxima (19-20 Pontos)</option>
            </SelectField>
         </div>
      </div>
    </div>
  );
};

export default ConfigCard;