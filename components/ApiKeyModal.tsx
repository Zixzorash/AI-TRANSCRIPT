import React, { useState, useEffect } from 'react';
import { X, Key, Save, Trash2, Eye, EyeOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('GEMINI_API_KEY');
      if (storedKey) {
        setApiKey(storedKey);
        setIsSaved(true);
      } else {
        setApiKey('');
        setIsSaved(false);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    setIsSaved(true);
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKey('');
    setIsSaved(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-gray-700 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/20 rounded-lg text-primary">
            <Key size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">API Settings</h2>
            <p className="text-sm text-gray-400">Manage your Gemini API Key</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2.5 pl-4 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your key is saved locally in your browser and never sent to our servers.
              Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            {isSaved && (
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 text-red-400 hover:bg-red-950/30 hover:border-red-500/50 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Clear
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg font-medium shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};