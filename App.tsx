import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ResultViewer } from './components/ResultViewer';
import { SupportedLanguage, ProcessingStatus as Status, EXPLICIT_KEYWORDS } from './types';
import { generateSubtitles } from './services/geminiService';
import { fileToBase64 } from './utils/fileHelpers';
import { Flame, Languages, ShieldAlert, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>(SupportedLanguage.JAPANESE);
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<string | null>(null);
  
  const getErrorMessage = (err: any): string => {
    if (!err) return "An unknown error occurred.";
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    
    // Handle objects that look like errors but aren't instances of Error
    if (typeof err === 'object') {
      // Check for specific Gemini/Google API error structures
      if (err.message) return String(err.message);
      if (err.error && err.error.message) return String(err.error.message);
      
      // If it has a custom toString that isn't the default Object one
      if (err.toString && err.toString() !== '[object Object]') return err.toString();
      
      // Last resort: try to stringify the object to see details
      try {
        const json = JSON.stringify(err);
        if (json !== '{}') return `Error details: ${json}`;
      } catch {
        return "An unknown error occurred (non-serializable object).";
      }
    }
    
    return "An unknown error occurred.";
  };

  const handleProcess = async () => {
    if (!file) return;

    try {
      setResult(null);
      setError(undefined);
      setStatus(Status.READING_FILE);

      // 1. Convert file
      const base64Data = await fileToBase64(file);
      
      setStatus(Status.UPLOADING_TO_AI);
      // Artificial delay for UX perception of "Uploading"
      await new Promise(r => setTimeout(r, 800)); 

      setStatus(Status.GENERATING);
      
      // 2. Call Gemini (uses default settings in service)
      const generatedSubtitle = await generateSubtitles(base64Data, file.type, language);
      
      setResult(generatedSubtitle);
      setStatus(Status.COMPLETED);

    } catch (err: any) {
      console.error("Full Error Object:", err);
      setStatus(Status.ERROR);
      
      const message = getErrorMessage(err);
      
      if (message.includes('SAFETY') || message.includes('blocked')) {
        setError("Content was flagged by AI Safety filters. The scene might be too explicit for the current model configuration, or the file contains prohibited content types.");
      } else {
        setError(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-2 rounded-lg shadow-lg shadow-red-500/20">
              <Flame className="text-white" size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                SensualSubs AI
              </h1>
              <span className="text-xs text-primary font-medium tracking-wide">ADULT CAPTION GENERATOR</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
             <span className="flex items-center gap-1 hover:text-white transition-colors"><Zap size={16} className="text-yellow-500"/> Fast Processing</span>
             <span className="flex items-center gap-1 hover:text-white transition-colors"><ShieldAlert size={16} className="text-green-500"/> Private & Secure</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Intro */}
        <div className="mb-10 text-center space-y-4">
          <h2 className="text-4xl font-bold text-white mb-2">
            Bring your scenes to <span className="text-primary italic">life</span>.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Upload your audio or video. We'll capture every whisper, moan, and dialogue with emotional accuracy and proper timestamps.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4 opacity-70">
            {EXPLICIT_KEYWORDS.slice(0, 8).map((kw, i) => (
                <span key={i} className="text-[10px] uppercase px-2 py-1 bg-gray-800 rounded border border-gray-700 text-gray-500">
                    {kw}
                </span>
            ))}
            <span className="text-[10px] uppercase px-2 py-1 bg-gray-800 rounded border border-gray-700 text-gray-500">+ more</span>
          </div>
        </div>

        <div className="bg-[#1e293b]/50 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                Upload Media 
              </label>
              <FileUploader 
                onFileSelect={setFile} 
                selectedFile={file} 
                onClear={() => { setFile(null); setResult(null); setStatus(Status.IDLE); }}
                disabled={status === Status.GENERATING || status === Status.UPLOADING_TO_AI || status === Status.READING_FILE}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Languages size={16} /> Target Language
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    disabled={status !== Status.IDLE && status !== Status.COMPLETED && status !== Status.ERROR}
                    className="w-full appearance-none bg-surface border border-gray-600 text-white py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {Object.values(SupportedLanguage).map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleProcess}
                disabled={!file || (status !== Status.IDLE && status !== Status.COMPLETED && status !== Status.ERROR)}
                className={`mt-auto w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 ${
                  !file || (status !== Status.IDLE && status !== Status.COMPLETED && status !== Status.ERROR)
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary to-rose-600 hover:from-rose-500 hover:to-pink-600 text-white shadow-primary/30 hover:shadow-primary/50'
                }`}
              >
                {status === Status.IDLE || status === Status.COMPLETED || status === Status.ERROR ? (
                   <>
                     <Flame size={20} className={file ? "text-yellow-300 fill-yellow-300 animate-pulse" : ""} />
                     Generate Captions
                   </>
                ) : 'Processing...'}
              </button>
            </div>
          </div>

          {/* Status Display */}
          <ProcessingStatus status={status} error={error} />

          {/* Result Area */}
          {result && file && (
            <ResultViewer srtContent={result} originalFileName={file.name} />
          )}

        </div>
        
        <p className="text-center text-gray-600 text-xs mt-8">
           Powered by Gemini 3 Pro. Results depend on audio quality. <br/>
           By using this tool, you agree to generate content responsibly. 
        </p>
      </main>
    </div>
  );
};

export default App;