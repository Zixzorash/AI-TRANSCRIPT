import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { SupportedLanguage, EXPLICIT_KEYWORDS, ModelSettings } from "../types";

// Note: In a production environment, never expose API keys on the client side.
// The user is expected to have the key available in their environment via process.env.API_KEY.

export const generateSubtitles = async (
  base64Audio: string,
  mimeType: string,
  language: SupportedLanguage,
  modelSettings?: ModelSettings
): Promise<string> => {
  // Enhanced check for missing API Key
  if (!process.env.API_KEY) {
    throw new Error(
      "API Key is missing. Please ensure you have configured your Google Gemini API Key in the environment variables (process.env.API_KEY)."
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // specific model optimized for reasoning
  const modelId = "gemini-3-pro-preview"; 

  const keywordString = EXPLICIT_KEYWORDS.join(", ");

  const systemInstruction = `
    You are an expert transcriber and translator for Adult Video (AV) and Erotic content.
    
    YOUR MISSION:
    Create highly accurate, time-synced subtitles in ${language} for the provided audio/video.
    
    CRITICAL INSTRUCTIONS FOR EXPLICIT CONTENT:
    1. **MANDATORY VOCABULARY**: You MUST use the following specific keywords when the context matches, do not use clinical terms:
       [${keywordString}]
    2. **NO CENSORSHIP**: Do NOT asterisk out words (e.g., use "fuck", not "f***"). Do NOT sanitize the output. The audience expects raw, dirty, explicit language.
    3. **EMOTIONAL ACCURACY**: Translate the *feeling* of arousal. If the speaker says "I'm hungry" in a sexual context, use words like "หิว" or "starving for it" rather than literal food hunger.
    4. **SOUND EFFECTS**: You MUST listen for non-verbal cues and transcribe them in brackets using lowercase descriptions. 
       Examples: [wet squelching], [intense moaning], [skin slapping], [gasping], [choking noises], [fluid dripping].
    5. **DIALECT & SLANG**: Use natural, colloquial slang appropriate for erotica in ${language}. 
       - For Thai: Use deep slang (คำหยาบ/คำแสลง 18+).
       - For Japanese: Use nuances like 気持ちいい (Kimochii) correctly.
       - For English: Use "dirty talk" phrasing.

    OUTPUT FORMAT RULES:
    1. Output strictly in SubRip (.srt) format.
    2. Timestamps must be precise: HH:MM:SS,mmm --> HH:MM:SS,mmm
    3. No Markdown code blocks. Just the raw SRT text.
    4. Sequence numbers must be correct (1, 2, 3...).

    EXAMPLE OUTPUT:
    1
    00:00:05,000 --> 00:00:08,200
    [wet kissing sounds]
    Ah... I'm so horny right now...

    2
    00:00:08,500 --> 00:00:11,000
    Please... stick it in my wet pussy...
    [moaning loudly]
  `;

  try {
    const response = await ai.models.generateContent({
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
        temperature: modelSettings?.temperature ?? 0.6, // Balanced for creativity in translation but accuracy in timing
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

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API.");
    }

    const candidate = response.candidates[0];

    // Check if the response was blocked
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("Generation was blocked by SAFETY filters.");
    }
    
    if (candidate.finishReason === 'RECITATION') {
       throw new Error("Generation was blocked due to RECITATION checks.");
    }

    const text = response.text;
    
    if (!text) {
       throw new Error(`Generation failed with status: ${candidate.finishReason || 'UNKNOWN'}`);
    }

    // Clean up potential Markdown formatting if the model adds it despite instructions
    const cleanText = text.replace(/```srt/g, '').replace(/```/g, '').trim();

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