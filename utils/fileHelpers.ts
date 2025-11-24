import { OutputFormat } from "../types";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the Data-URI prefix (e.g. "data:audio/mp3;base64,")
        const base64Content = reader.result.split(',')[1];
        resolve(base64Content);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Helper to convert SRT string to VTT
export const convertSrtToVtt = (srtContent: string): string => {
  let vtt = "WEBVTT\n\n";
  // Replace comma decimal separator with dot
  let content = srtContent.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
  vtt += content;
  return vtt;
};

// Helper to convert SRT string to Plain Text (strip timestamps)
export const convertSrtToTxt = (srtContent: string): string => {
  return srtContent
    .replace(/\r\n|\r|\n/g, '\n') // Normalize newlines
    .replace(/^\d+$/gm, '') // Remove index numbers
    .replace(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/gm, '') // Remove timestamps
    .replace(/\n\n+/g, '\n') // Remove extra newlines
    .trim();
};