import React, { useState, useEffect } from 'react';
import { OutputFormat } from '../types';
import { Copy, Check, Download, FileText, Loader2 } from 'lucide-react';
import { convertSrtToVtt, convertSrtToTxt, downloadFile } from '../utils/fileHelpers';

interface Props {
  srtContent: string;
  originalFileName: string;
  isGenerating?: boolean;
}

export const ResultViewer: React.FC<Props> = ({ srtContent, originalFileName, isGenerating = false }) => {
  const [activeFormat, setActiveFormat] = useState<OutputFormat>(OutputFormat.SRT);
  const [displayContent, setDisplayContent] = useState<string>(srtContent || "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If generating, force raw view or best effort, usually SRT is the raw output
    // We avoid complex regex conversions on partial streams if possible, 
    // but try-catch makes it robust.
    const safeContent = srtContent || "";
    try {
        switch (activeFormat) {
          case OutputFormat.SRT:
            setDisplayContent(safeContent);
            break;
          case OutputFormat.VTT:
            setDisplayContent(convertSrtToVtt(safeContent));
            break;
          case OutputFormat.TXT:
            setDisplayContent(convertSrtToTxt(safeContent));
            break;
        }
    } catch (e) {
        // Fallback to raw content if conversion fails during streaming
        setDisplayContent(safeContent);
    }
  }, [activeFormat, srtContent]);

  const handleCopy = async () => {
    if (isGenerating) return;
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (isGenerating) return;
    const fileName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || 'subtitle';
    const mimeType = activeFormat === OutputFormat.TXT ? 'text/plain' : 'text/vtt'; // SRT usually treated as text
    downloadFile(displayContent, `${fileName}.${activeFormat}`, mimeType);
  };

  return (
    <div className="w-full mt-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <div className="flex bg-surface p-1 rounded-lg border border-gray-700">
          {Object.values(OutputFormat).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setActiveFormat(fmt)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeFormat === fmt 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              .{fmt.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopy}
            disabled={isGenerating}
            className={`flex-1 sm:flex-none items-center justify-center flex gap-2 px-4 py-2 bg-surface border border-gray-600 rounded-lg text-gray-200 transition-colors ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
            }`}
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`flex-1 sm:flex-none items-center justify-center flex gap-2 px-4 py-2 bg-primary rounded-lg text-white font-medium shadow-lg shadow-primary/20 transition-all ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'
            }`}
          >
            <Download size={18} />
            Download
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-primary rounded-xl blur opacity-30 transition duration-1000 ${isGenerating ? 'animate-pulse opacity-60' : 'group-hover:opacity-50'}`}></div>
        <div className="relative w-full h-96 bg-gray-950 rounded-xl border border-gray-800 p-4 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-2 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2">
                <FileText size={14} />
                Preview: {activeFormat.toUpperCase()}
            </div>
            {isGenerating && (
                <div className="flex items-center gap-2 text-primary animate-pulse">
                    <Loader2 size={12} className="animate-spin" />
                    Generating...
                </div>
            )}
          </div>
          <textarea
            readOnly
            value={displayContent}
            className="w-full h-full bg-transparent resize-none focus:outline-none text-gray-300 font-mono text-sm leading-relaxed p-2 custom-scrollbar"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
};