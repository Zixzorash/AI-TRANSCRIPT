import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, AlertCircle, StopCircle } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
  disabled: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks();
    };
  }, []);

  const stopTracks = () => {
     if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
     }
  };

  const startRecording = async () => {
    if (disabled) return;
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // Create a file with a timestamp name
        const file = new File([blob], `recording-${new Date().getTime()}.webm`, { type: 'audio/webm' });
        onRecordingComplete(file);
        stopTracks();
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[300px] ${
        disabled 
          ? 'border-gray-700 bg-gray-900/50 cursor-not-allowed opacity-60' 
          : isRecording 
            ? 'border-red-500/50 bg-red-950/10'
            : 'border-gray-600 bg-surface hover:border-primary hover:bg-surface/80'
      }`}>
      
      {error ? (
        <div className="text-red-400 flex flex-col items-center gap-2">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button 
             onClick={() => setError(null)}
             className="mt-2 text-sm underline hover:text-red-300"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className={`relative p-6 rounded-full mb-6 transition-all duration-500 ${
            isRecording ? 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-gray-800'
          }`}>
            {isRecording ? (
               <div className="relative">
                 <span className="absolute -inset-4 rounded-full border border-red-500 opacity-50 animate-ping"></span>
                 <Mic size={40} className="text-red-500 relative z-10" />
               </div>
            ) : (
               <Mic size={40} className="text-gray-400" />
            )}
          </div>

          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            {isRecording ? 'Recording Audio...' : 'Record Audio'}
          </h3>
          
          <div className="font-mono text-2xl text-gray-400 mb-8 font-medium tracking-wider">
             {formatTime(duration)}
          </div>

          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={disabled}
              className="px-8 py-3 bg-primary text-white font-medium rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Mic size={18} />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-8 py-3 bg-red-600 text-white font-medium rounded-full shadow-lg shadow-red-600/20 hover:bg-red-700 hover:scale-105 transition-all flex items-center gap-2"
            >
              <StopCircle size={18} />
              Stop Recording
            </button>
          )}
          
          <p className="text-sm text-gray-500 mt-6">
            {isRecording ? 'Speak clearly into your microphone' : 'Click start to begin recording'}
          </p>
        </>
      )}
    </div>
  );
};
