import React from 'react';
import { DisplayMode } from '../types';

interface SidebarProps {
  setDisplayMode: (mode: DisplayMode) => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

const ImageIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const VideoIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" /></svg>;
const WebcamIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>;
const SpeakerOnIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>;
const SpeakerOffIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>;
const LogoIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.368-7.01a1.012 1.012 0 011.63-.49l2.25 3.001c.16.212.448.337.744.337h2.032c.296 0 .584-.125.744-.337l2.25-3.001a1.012 1.012 0 011.63.49l4.368 7.01c.247.396.247.896 0 1.292l-4.368 7.01a1.012 1.012 0 01-1.63.49l-2.25-3.001a1.012 1.012 0 00-1.488 0l-2.25 3.001a1.012 1.012 0 01-1.63-.49l-4.368-7.01z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>

const NavButton: React.FC<{ onClick: () => void; children: React.ReactNode; icon: React.ReactNode }> = ({ onClick, children, icon }) => (
  <button
    onClick={onClick}
    className="bg-white/80 border border-slate-200/80 rounded-lg p-3 shadow-md hover:bg-indigo-50 transition-all duration-200 cursor-pointer w-full text-slate-700 flex items-center gap-4 hover:shadow-xl hover:scale-105"
  >
    <span className="text-indigo-500">{icon}</span>
    <span className="font-semibold">{children}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ setDisplayMode, isAudioEnabled, onToggleAudio }) => {
  return (
    <aside className="w-64 bg-white/60 backdrop-blur-lg rounded-xl shadow-xl p-4 flex flex-col border border-slate-300/70">
      <div className="flex flex-col gap-4">
        <NavButton onClick={() => setDisplayMode(DisplayMode.Image)} icon={<ImageIcon />}>Tải ảnh lên</NavButton>
        <NavButton onClick={() => setDisplayMode(DisplayMode.Video)} icon={<VideoIcon />}>Nhận diện video</NavButton>
        <NavButton onClick={() => setDisplayMode(DisplayMode.Webcam)} icon={<WebcamIcon />}>Xử lý từ webcam</NavButton>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-200">
        <button
            onClick={onToggleAudio}
            className="rounded-lg p-3 w-full text-slate-700 flex items-center justify-between hover:bg-slate-100 transition-colors"
        >
            <div className="flex items-center gap-4">
                <span className="text-indigo-500">
                    {isAudioEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
                </span>
                <span className="font-semibold">Phát âm thanh</span>
            </div>
            <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${isAudioEnabled ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${isAudioEnabled ? 'translate-x-5' : ''}`}></div>
            </div>
        </button>
      </div>


      <div className="mt-auto text-center text-slate-600">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
          <LogoIcon />
        </div>
        <p className="font-bold text-lg text-slate-800">Sign-AI</p>
        <p className="text-sm">Trợ lý giao thông</p>
      </div>
    </aside>
  );
};