import { GoogleGenAI } from "@google/genai";
import { MapStyle } from "../types";

// Step 1: Get a visual description of the real geography
const getGeographyDescription = async (ai: GoogleGenAI, location: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Describe the visual geography of ${location} for a top-down black and white map poster. 
      Focus strictly on:
      1. The shape and direction of major rivers or coastlines.
      2. The orientation of the main street grid (e.g., radial, grid, chaotic).
      3. Major recognizable parks or landmarks as shapes.
      Keep it under 40 words. Visual descriptions only.`,
    });
    return response.text || location;
  } catch (e) {
    console.warn("Could not fetch geography, using location name only.", e);
    return location;
  }
};

// Step 2: Generate the image based on the specific geography
const generateMapPrompt = (location: string, geographyDesc: string, style: MapStyle): string => {
  const styleDesc = style === MapStyle.BLACK_LINES 
    ? "Use strictly BLACK lines on a WHITE background." 
    : "Use strictly WHITE lines on a BLACK background.";
    
  return `Generate a minimalist map art poster of ${location}.
  
  Geographic features: ${geographyDesc}
  
  Art Style Rules:
  1. ${styleDesc}
  2. TWO COLORS ONLY. No greys. No shading.
  3. NO TEXT. NO LABELS. NO STREET NAMES.
  4. Abstract, clean vector lines representing the road network.
  5. High contrast, decorative wall art style.`;
};

// Helper to extract base64 from response
const extractImageFromResponse = (response: any): string => {
    const candidate = response.candidates?.[0];

    // Check if the model returned text instead of an image (e.g. refusal or misunderstanding)
    const textPart = candidate?.content?.parts?.find((p: any) => p.text);
    // If there is text but NO inlineData, it failed to generate an image.
    if (textPart && !candidate?.content?.parts?.some((p: any) => p.inlineData)) {
        console.warn("Model returned text:", textPart.text);
        throw new Error("The AI returned a description instead of an image. Please try again.");
    }

    if (!candidate?.content?.parts) {
      throw new Error("No image generated");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Image data not found in response");
}

export const generateMapTexture = async (location: string, style: MapStyle): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // 1. Get the real geography description first (Grounding the request)
    const geographyDesc = await getGeographyDescription(ai, location);
    
    // 2. Generate the image using the specific description
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: generateMapPrompt(location, geographyDesc, style),
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1", 
          numberOfImages: 1,
        }
      },
    });

    return extractImageFromResponse(response);

  } catch (error) {
    console.error("Map Generation Error:", error);
    throw error;
  }
};

export const generateMapFromImage = async (imageBase64: string, style: MapStyle): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing.");

    const ai = new GoogleGenAI({ apiKey });

    // Robustly handle MIME types and Base64 stripping
    // 1. Detect MIME type from header or default to png
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+.-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

    // 2. Strip the header to get raw base64
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');

    const styleInstruction = style === MapStyle.BLACK_LINES 
      ? "Convert this into BLACK lines on a pure WHITE background." 
      : "Convert this into WHITE lines on a pure BLACK background.";

    // Strongly enforce image generation
    const prompt = `Redraw this map image as a minimalist abstract line art poster.
    
    STRICT REQUIREMENTS:
    1. Output must be an IMAGE.
    2. ${styleInstruction}
    3. REMOVE ALL TEXT, LABELS, MARKERS, and ICONS.
    4. HIGH CONTRAST: Only two colors allowed (Black/White).
    5. Trace the road network cleanly.
    
    Do not provide a textual description. Return the generated image only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          numberOfImages: 1,
        }
      },
    });

    return extractImageFromResponse(response);

  } catch (error) {
    console.error("Image-to-Map Error:", error);
    throw error;
  }
};