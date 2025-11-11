import React from 'react';
import { TrafficSign, DetailedSignInfo } from '../types';

interface SignDetailPopupProps {
  sign: TrafficSign;
  details: DetailedSignInfo | null;
  isLoading: boolean;
  onClose: () => void;
}

const TwoWayTrafficIcon: React.FC<{ sizeClass: string }> = ({ sizeClass }) => (
    <div className={`relative ${sizeClass} mx-auto`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <polygon points="50,5 95,90 5,90" fill="#cc0000" />
            <polygon points="50,12 89,88 11,88" fill="#ffcc00" />
            <g fill="#000000">
                <path d="M 30 45 H 70 L 65 40 M 70 45 L 65 50" stroke="#000000" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 70 60 H 30 L 35 55 M 30 60 L 35 65" stroke="#000000" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
        </svg>
    </div>
);

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="font-bold text-indigo-700">{title}:</h3>
        <p className="text-slate-600 mt-1">{children}</p>
    </div>
);


export const SignDetailPopup: React.FC<SignDetailPopupProps> = ({ sign, details, isLoading, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-scale-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors z-10"
          aria-label="Đóng popup"
        >
          <CloseIcon />
        </button>
        
        <div className="text-center mb-4">
            <TwoWayTrafficIcon sizeClass="w-28 h-28" />
            <h2 className="text-2xl font-bold text-slate-800 mt-4 mb-1">{sign.name}</h2>
            <p className="text-slate-500 text-sm italic">"{sign.meaning}"</p>
        </div>
        
        <hr className="my-3" />

        <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isLoading && (
                <div className="flex flex-col justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-slate-600">Đang tải thông tin chi tiết...</p>
                </div>
            )}
            
            {!isLoading && details && (
                 <div className="text-left space-y-4">
                    <DetailSection title="Mã hiệu">{details.signCode}</DetailSection>
                    <DetailSection title="Giải thích chi tiết">{details.detailedMeaning}</DetailSection>
                    <DetailSection title="Các trường hợp áp dụng">{details.applicationCases}</DetailSection>
                    <DetailSection title="Mức phạt vi phạm">{details.penalties}</DetailSection>
                </div>
            )}
            
            {!isLoading && !details && (
                 <div className="flex flex-col justify-center items-center h-48 text-center">
                    <p className="text-red-600">Không thể tải được thông tin chi tiết.</p>
                    <p className="text-sm text-slate-500">Vui lòng kiểm tra lại kết nối và thử lại.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};