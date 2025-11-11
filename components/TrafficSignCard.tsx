import React from 'react';
import { TrafficSign } from '../types';

interface TrafficSignCardProps {
  sign: TrafficSign;
  onClick: () => void;
}

const TwoWayTrafficIcon: React.FC = () => (
    <div className="relative w-24 h-24 mx-auto mb-3">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Red Triangle */}
            <polygon points="50,5 95,90 5,90" fill="#cc0000" />
             {/* Yellow inner Triangle */}
            <polygon points="50,12 89,88 11,88" fill="#ffcc00" />
            {/* Arrows */}
            <g fill="#000000">
                <path d="M 30 45 H 70 L 65 40 M 70 45 L 65 50" stroke="#000000" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 70 60 H 30 L 35 55 M 30 60 L 35 65" stroke="#000000" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
        </svg>
    </div>
);


export const TrafficSignCard: React.FC<TrafficSignCardProps> = ({ sign, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white/90 rounded-lg p-4 shadow-lg border border-slate-200/80 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] cursor-pointer"
    >
      <div className="flex justify-center items-center mb-2">
         <TwoWayTrafficIcon />
      </div>
      <div>
        <p className="font-semibold text-slate-800 mb-1">
          Tên biển báo: 
          <span className="font-medium text-indigo-700 ml-2">{sign.name}</span>
        </p>
        <p className="font-semibold text-slate-800">
          Ý nghĩa: 
          <span className="font-normal text-slate-600 block mt-1 text-sm">{sign.meaning}</span>
        </p>
      </div>
    </div>
  );
};