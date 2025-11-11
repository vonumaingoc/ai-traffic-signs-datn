import React, { useState, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { InfoPanel } from './components/InfoPanel';
import { identifyTrafficSigns, getSignDetails } from './services/geminiService';
import { DisplayMode, TrafficSign, DetailedSignInfo } from './types';
import { SignDetailPopup } from './components/SignDetailPopup';

const App: React.FC = () => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.Idle);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [detectedSigns, setDetectedSigns] = useState<TrafficSign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  
  const [selectedSign, setSelectedSign] = useState<TrafficSign | null>(null);
  const [detailedSignInfo, setDetailedSignInfo] = useState<DetailedSignInfo | null>(null);
  const [isPopupLoading, setIsPopupLoading] = useState<boolean>(false);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const speak = useCallback((signs: TrafficSign[]) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-Speech not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();

    const textToSpeak = signs
      .map(sign => `Phát hiện biển báo: ${sign.name}. Ý nghĩa là: ${sign.meaning}`)
      .join('. ');
    
    if (textToSpeak) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);


  const resetState = () => {
    setSourceUrl(null);
    setDetectedSigns([]);
    setError(null);
    if (sourceUrl && sourceUrl.startsWith('blob:')) {
      URL.revokeObjectURL(sourceUrl);
    }
    window.speechSynthesis.cancel();
  };
  
  const handleToggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev);
    if (isAudioEnabled) { // If it was on and is being turned off
        window.speechSynthesis.cancel();
    }
  }, [isAudioEnabled]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      resetState();
      setDisplayMode(DisplayMode.Image);
      const url = URL.createObjectURL(file);
      setSourceUrl(url);

      try {
        setIsLoading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          const signs = await identifyTrafficSigns(base64data, file.type);
          setDetectedSigns(signs);
          if (isAudioEnabled) {
            speak(signs);
          }
          setError(null);
        };
        reader.onerror = () => {
          setError('Failed to read file.');
          setIsLoading(false);
        }
      } catch (err) {
        setError('An error occurred while identifying the sign.');
        setDetectedSigns([]);
      } finally {
        setIsLoading(false);
      }
    } else {
       setError("Please select a valid image file.");
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      resetState();
      setDisplayMode(DisplayMode.Video);
      const url = URL.createObjectURL(file);
      setSourceUrl(url);
    } else {
       setError("Please select a valid video file.");
    }
  };
  
  const handleSetDisplayMode = useCallback((mode: DisplayMode) => {
    resetState();
    setDisplayMode(mode);
    if (mode === DisplayMode.Image && fileInputRef.current) {
        fileInputRef.current.click();
    }
    if (mode === DisplayMode.Video && videoInputRef.current) {
        videoInputRef.current.click();
    }
  }, []);
  
  const handleSelectSign = useCallback(async (sign: TrafficSign) => {
    setSelectedSign(sign);
    setDetailedSignInfo(null);
    setIsPopupLoading(true);
    try {
      const details = await getSignDetails(sign.name);
      setDetailedSignInfo(details);
    } catch (error) {
      console.error("Failed to fetch sign details:", error);
      setDetailedSignInfo(null); // Ensure details are null on error
    } finally {
      setIsPopupLoading(false);
    }
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedSign(null);
    setDetailedSignInfo(null);
  }, []);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 to-slate-200 flex p-4 gap-4 font-sans text-slate-800">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleVideoUpload}
        accept="video/*"
        className="hidden"
      />

      <Sidebar 
        setDisplayMode={handleSetDisplayMode}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
       />
      <MainContent displayMode={displayMode} sourceUrl={sourceUrl} />
      <InfoPanel 
        detectedSigns={detectedSigns} 
        isLoading={isLoading} 
        error={error} 
        onSignSelect={handleSelectSign}
      />
      
      {selectedSign && (
        <SignDetailPopup 
          sign={selectedSign} 
          details={detailedSignInfo}
          isLoading={isPopupLoading}
          onClose={handleClosePopup} 
        />
      )}
    </div>
  );
};

export default App;