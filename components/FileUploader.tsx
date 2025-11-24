import React, { useCallback } from 'react';
import { Upload, FileAudio, FileVideo, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, selectedFile, onClear, disabled }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        validateAndSetFile(file);
      }
    },
    [disabled]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Basic validation, but we allow large files as requested (browser memory permitting)
    onFileSelect(file);
  };

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (selectedFile) {
    return (
      <div className="w-full p-6 border-2 border-primary/50 bg-surface rounded-xl flex items-center justify-between shadow-lg shadow-primary/10 transition-all">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-lg text-primary">
            {selectedFile.type.startsWith('video') ? <FileVideo size={24} /> : <FileAudio size={24} />}
          </div>
          <div>
            <p className="font-medium text-gray-200 truncate max-w-[200px] sm:max-w-md">{selectedFile.name}</p>
            <p className="text-sm text-gray-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        </div>
        {!disabled && (
          <button 
            onClick={onClear}
            className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragEnter={preventDefaults}
      onDragOver={preventDefaults}
      onDragLeave={preventDefaults}
      onDrop={handleDrop}
      className={`relative w-full border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
        disabled 
          ? 'border-gray-700 bg-gray-900/50 cursor-not-allowed opacity-60' 
          : 'border-gray-600 bg-surface hover:border-primary hover:bg-surface/80 cursor-pointer group'
      }`}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        onChange={handleFileInput}
        accept=".mp3,.mp4,.m4a,.wav,.flac,.aac"
        disabled={disabled}
      />
      <label htmlFor="fileInput" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
        <div className="p-4 bg-gray-800 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/20">
          <Upload size={32} className="text-gray-400 group-hover:text-primary transition-colors" />
        </div>
        <h3 className="text-lg font-semibold text-gray-200 mb-1">Drag & Drop or Click to Upload</h3>
        <p className="text-sm text-gray-500 mb-4">Supported: MP4, MP3, M4A, WAV, ACC, FLAC</p>
        <span className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          Select File
        </span>
      </label>
    </div>
  );
};