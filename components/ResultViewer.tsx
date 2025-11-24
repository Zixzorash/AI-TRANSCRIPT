import React, { useState, useEffect } from 'react';
import { OutputFormat } from '../types';
import { Copy, Check, Download, FileText } from 'lucide-react';
import { convertSrtToVtt, convertSrtToTxt, downloadFile } from '../utils/fileHelpers';

interface Props {
  srtContent: string;
  originalFileName: string;
}

export const ResultViewer: React.FC<Props> = ({ srtContent, originalFileName }) => {
  const [activeFormat, setActiveFormat] = useState<OutputFormat>(OutputFormat.SRT);
  const [displayContent, setDisplayContent] = useState<string>(srtContent);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    switch (activeFormat) {
      case OutputFormat.SRT:
        setDisplayContent(srtContent);
        break;
      case OutputFormat.VTT:
        setDisplayContent(convertSrtToVtt(srtContent));
        break;
      case OutputFormat.TXT:
        setDisplayContent(convertSrtToTxt(srtContent));
        break;
    }
  }, [activeFormat, srtContent]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
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
            className="flex-1 sm:flex-none items-center justify-center flex gap-2 px-4 py-2 bg-surface hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-200 transition-colors"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-none items-center justify-center flex gap-2 px-4 py-2 bg-primary hover:bg-secondary rounded-lg text-white font-medium shadow-lg shadow-primary/20 transition-all"
          >
            <Download size={18} />
            Download
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-primary rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative w-full h-96 bg-gray-950 rounded-xl border border-gray-800 p-4 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-800 pb-2">
            <FileText size={14} />
            Preview: {activeFormat.toUpperCase()}
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