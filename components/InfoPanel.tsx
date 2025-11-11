import React from 'react';
import { TrafficSign } from '../types';
import { TrafficSignCard } from './TrafficSignCard';

interface InfoPanelProps {
  detectedSigns: TrafficSign[];
  isLoading: boolean;
  error: string | null;
  onSignSelect: (sign: TrafficSign) => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ detectedSigns, isLoading, error, onSignSelect }) => {
    
  const initialSigns: TrafficSign[] = [
    { name: "Đường hai chiều", meaning: "Biển báo này cho biết đoạn đường sắp tới có hai chiều xe chạy, cần chú ý đi đúng phần đường và quan sát xe ngược chiều." },
    { name: "Đường hai chiều", meaning: "Biển báo này cho biết đoạn đường sắp tới có hai chiều xe chạy, cần chú ý đi đúng phần đường và quan sát xe ngược chiều." },
    { name: "Đường hai chiều", meaning: "Biển báo này cho biết đoạn đường sắp tới có hai chiều xe chạy, cần chú ý đi đúng phần đường và quan sát xe ngược chiều." },
  ];
  
  const signsToDisplay = detectedSigns.length > 0 ? detectedSigns : initialSigns;

  return (
    <aside className="w-80 bg-white/60 backdrop-blur-lg rounded-xl shadow-xl p-4 flex flex-col border border-slate-300/70">
      <h2 className="text-xl font-bold text-center pb-4 text-slate-700">
        Thông Tin Biển Báo
      </h2>
      <div className="flex-grow overflow-y-auto space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
        {!isLoading && error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Lỗi!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        )}
        {!isLoading && !error && signsToDisplay.map((sign, index) => (
          <TrafficSignCard 
            key={index} 
            sign={sign} 
            onClick={() => onSignSelect(sign)}
          />
        ))}
      </div>
    </aside>
  );
};