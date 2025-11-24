export enum SupportedLanguage {
  JAPANESE = 'Japanese',
  ENGLISH = 'English',
  CHINESE = 'Chinese',
  THAI = 'Thai',
  KOREAN = 'Korean'
}

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
  // Thai
  "หิว", "จู๋", "เงี่ยน", "น้ำเงี่ยน", "เสียวเสียว", "เสียว", "น้ำแตก", "โม๊ก", "โม๊กควย", "เลียหี", 
  "ประจัน", "เม็ดแตด", "แตด", "ควย", "เย็ด", "เอา", "เสร็จ", "ร่อง", "น้ำเดิน", "เลีย", "อม",
  
  // English
  "pussy", "cock", "horny", "pussy juice", "pussy pleasure", "pleasure", "squirt", "suck", 
  "suck cock", "lick pussy", "fuck", "clitoris", "clit", "cum", "orgasm", "moan", "wet", "hard", "dick",
  "blowjob", "deepthroat", "creampie",
  
  // Japanese
  "オマンコ", "チンポ", "興奮", "マン汁", "オマンコの快感", "快感", "潮吹き", "吸う", 
  "チンポを吸う", "オマンコを舐める", "ファックする", "クリトリス", "イク", "中出し", "ヤり", "巨乳",
  "あえぎ声", "気持ちいい", "すごい"
];