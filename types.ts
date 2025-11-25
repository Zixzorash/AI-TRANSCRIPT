export enum SupportedLanguage {
  JAPANESE = 'Japanese',
  ENGLISH = 'English',
  CHINESE = 'Chinese',
  THAI = 'Thai',
  KOREAN = 'Korean'
}

export enum GeminiModel {
  GEMINI_3_PRO = 'gemini-3-pro-preview',
  GEMINI_2_5_FLASH = 'gemini-2.5-flash'
}

export const MODEL_LABELS: Record<GeminiModel, string> = {
  [GeminiModel.GEMINI_3_PRO]: 'Gemini 3 Pro (Best Quality)',
  [GeminiModel.GEMINI_2_5_FLASH]: 'Gemini 2.5 Flash (Fastest)',
};

export enum OutputFormat {
  SRT = 'srt',
  VTT = 'vtt',
  TXT = 'txt'
}

export enum ProcessingStatus {
  IDLE = 'idle',
  READING_FILE = 'reading_file',
  UPLOADING_TO_AI = 'uploading_to_ai',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface GenerationResult {
  content: string;
  format: OutputFormat;
}

export interface ModelSettings {
  temperature: number;
  topP: number;
  topK: number;
}

export const EXPLICIT_KEYWORDS = [
  // Thai (Updated per user request)
  "หี", "ควย", "เงี่ยน", "น้ำเงี่ยน", "เสียวหี", "เสียว", "น้ำแตก", "โม๊ก", "โม๊กควย", "เลียหี", 
  "เย็ด", "เม็ดแตด", "แตด", "ตูด", "ควยแข็ง", "เย็ดหี", "น้ำหีแตก", "น้ำควยเยิ้ม", "ควยยัดหี", 
  "น้ำหีเยิ้ม", "หีกระแทกควย",
  
  // English
  "pussy", "cock", "horny", "pussy juice", "pussy pleasure", "pleasure", "squirt", "suck", 
  "suck cock", "lick pussy", "fuck", "clitoris", "clit", "cum", "orgasm", "moan", "wet", "hard", "dick",
  "blowjob", "deepthroat", "creampie",
  
  // Japanese
  "オマンコ", "チンポ", "興奮", "マン汁", "オマンコの快感", "快感", "潮吹き", "吸う", 
  "チンポを吸う", "オマンコを舐める", "ファックする", "クリトリス", "イク", "中出し", "ヤり", "巨乳",
  "あえぎ声", "気持ちいい", "すごい"
];