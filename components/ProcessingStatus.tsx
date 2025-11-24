import React from 'react';
import { ProcessingStatus as Status } from '../types';
import { Loader2, CheckCircle2, AlertCircle, FileAudio, UploadCloud, Sparkles } from 'lucide-react';

interface Props {
  status: Status;
  error?: string;
}

export const ProcessingStatus: React.FC<Props> = ({ status, error }) => {
  if (status === Status.IDLE) return null;

  const getStatusContent = () => {
    switch (status) {
      case Status.READING_FILE:
        return {
          icon: <FileAudio className="animate-bounce text-blue-400" size={32} />,
          title: "Processing Audio File",
          desc: "Converting media for analysis..."
        };
      case Status.UPLOADING_TO_AI:
        return {
          icon: <UploadCloud className="animate-pulse text-purple-400" size={32} />,
          title: "Sending to Gemini",
          desc: "Uploading data to secure AI endpoint..."
        };
      case Status.GENERATING:
        return {
          icon: <Sparkles className="animate-spin text-primary" size={32} />,
          title: "AI Analyzing Scene",
          desc: "Detecting emotions, explicit context, and timestamps..."
        };
      case Status.COMPLETED:
        return {
          icon: <CheckCircle2 className="text-green-500" size={32} />,
          title: "Transcription Complete",
          desc: "Your subtitles are ready."
        };
      case Status.ERROR:
        return {
          icon: <AlertCircle className="text-red-500" size={32} />,
          title: "Process Failed",
          desc: error || "An unexpected error occurred."
        };
      default:
        return null;
    }
  };

  const content = getStatusContent();
  if (!content) return null;

  return (
    <div className="w-full mt-6 p-6 bg-slate-900/50 border border-slate-700 rounded-xl backdrop-blur-sm flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-3 bg-slate-800 rounded-full shadow-inner">
        {content.icon}
      </div>
      <div className="flex-1">
        <h4 className={`text-lg font-semibold ${status === Status.ERROR ? 'text-red-400' : 'text-gray-100'}`}>
          {content.title}
        </h4>
        <p className="text-gray-400 text-sm">{content.desc}</p>
      </div>
      {status === Status.GENERATING && (
        <div className="flex gap-1">
           <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
           <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
           <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
        </div>
      )}
    </div>
  );
};