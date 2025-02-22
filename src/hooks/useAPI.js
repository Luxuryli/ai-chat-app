export async function summarizeText(text) {
  if (!window.ai) {
    console.error("AI API is NOT available.");
    return "AI is tired, Cannot summarize";
  }

  try {
    const summarizer = await window.ai.summarizer.create();
    return await summarizer.summarize(text);
  } catch (error) {
    console.error("Summarization error:", error);
    return "Summarization failed";
  }
}

export async function translateText(text, targetLang = "fr") {
  if (!window.ai) {
    console.error("AI API is NOT available.");
    return "AI is tired, cannot translate";
  }

  try {
    const detectedLang = await detectLanguage(text);
    console.log(`🔍 Detected Language: ${detectedLang}`);

    if (detectedLang === targetLang) {
      console.log("No translation needed (same language)");
      return text;
    }

    const translator = await window.ai.translator.create({
      sourceLanguage: detectedLang.toLowerCase(),
      targetLanguage: targetLang.toLowerCase(),
    });

    return await translator.translate(text);
  } catch (error) {
    console.error("Translation error:", error);
    return "Translation failed";
  }
}

export async function detectLanguage(text) {
  if (!window.ai) {
    console.error("AI API is NOT available.");
    return "AI is tired, cannot detect Language";
  }

  if (!text.trim()) {
    console.warn("No text provided for detection.");
    return "Unknown";
  }

  try {
    const detector = await window.ai.languageDetector.create();
    const results = await detector.detect(text);

    if (Array.isArray(results) && results.length > 0) {
      const topResult = results.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      );

      return topResult.detectedLanguage ? topResult.detectedLanguage.toUpperCase() : "Unknown";
    }

    return "Unknown";
  } catch (error) {
    console.error("Language detection error:", error);
    return "Unknown";
  }
}