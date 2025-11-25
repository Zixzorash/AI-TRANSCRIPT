import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { SupportedLanguage, EXPLICIT_KEYWORDS, ModelSettings } from "../types";

// Helper to safely get env var without crashing in browsers where 'process' is undefined
const getApiKey = (): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError
  }
  return undefined;
};

export const generateSubtitles = async (
  base64Audio: string,
  mimeType: string,
  language: SupportedLanguage,
  modelId: string,
  onProgress: (text: string) => void,
  modelSettings?: ModelSettings
): Promise<string> => {
  const apiKey = getApiKey();

  // Enhanced check for missing API Key
  if (!apiKey) {
    throw new Error(
      "API Key is missing. Please ensure you have configured your Google Gemini API Key in the environment variables (process.env.API_KEY)."
    );
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const keywordString = EXPLICIT_KEYWORDS.join(", ");

  const systemInstruction = `
    You are an expert subtitle generator specialized in Adult/Erotic content.

    TARGET LANGUAGE: ${language}

    STRICT REQUIREMENTS:
    1. **EXPLICIT VOCABULARY**: 
       - You MUST prioritize the use of these specific keywords when context matches: [${keywordString}]
       - **NEVER** use polite, medical, or clinical language (e.g., do NOT use "vagina", "intercourse", "penis"). 
       - **ALWAYS** use raw, explicit slang. 
       - For **Thai**: Use words like "หี", "ควย", "เย็ด", "แตก", "เสียว", "น้ำเดิน" naturally.
       - For **English**: Use "fuck", "cum", "pussy", "dick", "cock" liberally.
       - For **Japanese**: Translate nuances of "Iku" (cumming), "Kimochii" (feels good) into the explicit target language equivalent.

    2. **NATURAL & LIVELY DIALOGUE**:
       - The text must feel "hot", "alive", and "arousing".
       - Capture the rhythm of the sex scene. Short, breathless phrases are better than long sentences.
       - **Thai Specifics**: Use emotive particles (e.g., "ซี๊ดดด", "อูยยย", "อ่าาา") to convey physical sensation and "pleasure hissing" common in Thai erotic context.

    3. **SOUNDS & MOANS (NO META-DESCRIPTIONS)**:
       - **FORBIDDEN**: Do not use brackets or descriptions like [moan], (heavy breathing), *screaming*.
       - **REQUIRED**: Transcribe the sound PHONETICALLY.
       - *Example*: "Ahhh... Ohhh... Mmmm... Fuck... Yes..."
       - *Thai Example*: "อ๊างงง... โอ๊ย... ซี๊ดดด... เสียวโว้ย..."

    4. **OUTPUT FORMAT**:
       - Standard SRT format.
       - Do not wrap in Markdown.
       - Timestamps must be precise (HH:MM:SS,mmm).
       - Ensure sequence numbers are correct.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: `Transcribe and translate this audio into ${language} subtitles (SRT format). Focus on erotic nuances and explicit terminology.`
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: modelSettings?.temperature ?? 0.6,
        topP: modelSettings?.topP ?? 0.95,
        topK: modelSettings?.topK ?? 40,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      }
    });

    let fullText = "";

    for await (const chunk of response) {
      // Safely access chunk text. If a specific chunk is blocked or invalid, skip it rather than crashing.
      try {
        const text = chunk.text;
        if (text) {
          fullText += text;
          onProgress(text);
        }
      } catch (chunkError) {
        console.warn("Skipping invalid chunk:", chunkError);
      }
    }

    if (!fullText) {
      throw new Error("No candidates returned from Gemini API or generation was blocked.");
    }

    // Clean up potential Markdown formatting if the model adds it despite instructions
    const cleanText = fullText.replace(/```srt/g, '').replace(/```/g, '').trim();

    return cleanText;

  } catch (error: any) {
    console.error("Gemini Service Error:", error);

    // Identify common API Key errors to provide better user feedback
    const errorMessage = (error.message || error.toString()).toUpperCase();
    
    // Handle API Key issues
    if (errorMessage.includes("API KEY") || errorMessage.includes("403") || errorMessage.includes("PERMISSION_DENIED")) {
       throw new Error("Invalid or expired API Key. Please verify your Google Gemini API Key configuration.");
    }

    // Handle Bad Requests
    if (errorMessage.includes("400") || errorMessage.includes("INVALID_ARGUMENT")) {
       throw new Error("Invalid Request. The file might be corrupted or the format is not supported by the model.");
    }

    // Handle Rate Limits / Quota
    if (
      errorMessage.includes("429") || 
      errorMessage.includes("RESOURCE_EXHAUSTED") || 
      errorMessage.includes("QUOTA") ||
      errorMessage.includes("TOO MANY REQUESTS")
    ) {
       throw new Error("API Rate Limit or Quota Exceeded. You may have reached the limit for the free tier or the service is currently busy. Please wait a minute and try again.");
    }

    // Handle Server Overload
    if (errorMessage.includes("503") || errorMessage.includes("OVERLOADED")) {
       throw new Error("The AI service is currently overloaded. Please try again in a few minutes.");
    }

    // Propagate the error to be handled by the UI
    throw error;
  }
};