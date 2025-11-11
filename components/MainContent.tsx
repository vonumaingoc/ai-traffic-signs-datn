import React, { useRef, useEffect } from 'react';
import { DisplayMode } from '../types';

interface MainContentProps {
  displayMode: DisplayMode;
  sourceUrl: string | null;
}

const WebcamDisplay: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const startWebcam = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };

        startWebcam();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain rounded-lg" />;
};

const IdleDisplay: React.FC = () => (
    <div className="text-center text-slate-500 flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-32 h-32 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
        </div>
        <h2 className="text-2xl font-semibold text-slate-600">Khu vực hiển thị</h2>
        <p>Chọn một tùy chọn bên trái để bắt đầu nhận diện biển báo giao thông.</p>
    </div>
);


export const MainContent: React.FC<MainContentProps> = ({ displayMode, sourceUrl }) => {
  const renderContent = () => {
    switch (displayMode) {
      case DisplayMode.Image:
        return sourceUrl ? (
          <img src={sourceUrl} alt="Uploaded content" className="max-w-full max-h-full object-contain rounded-lg" />
        ) : null;
      case DisplayMode.Video:
         return sourceUrl ? (
          <video src={sourceUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-lg" />
        ) : null;
      case DisplayMode.Webcam:
        return <WebcamDisplay />;
      case DisplayMode.Idle:
      default:
        return <IdleDisplay />;
    }
  };

  return (
    <main className="flex-1 bg-white/60 backdrop-blur-lg rounded-xl shadow-xl p-4 flex items-center justify-center border border-slate-300/70">
      {renderContent()}
    </main>
  );
};