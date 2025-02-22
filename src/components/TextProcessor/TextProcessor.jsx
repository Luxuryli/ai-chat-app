import { useState, useRef, useEffect } from "react";
import { summarizeText, translateText, detectLanguage } from "../../hooks/useAPI"; 
import InputField from "../InputField/InputField.jsx";
import Button from "../Button/Button.jsx";
import design from "./TextProcessor.module.css";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";

const TextProcessor = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingSummaryId, setLoadingSummaryId] = useState(null);
  const [loadingTranslationId, setLoadingTranslationId] = useState(null);
  const chatContainerRef = useRef(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "es", name: "Spanish" },
    { code: "tr", name: "Turkish" },
  ];

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const detectedLang = await detectLanguage(inputText);

    const newMessage = {
      id: Date.now(),
      text: inputText,
      detectedLanguage: detectedLang,
      translations: [],
      summary: null,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
    setShowIntro(true);
  };

  const handleSummarize = async (messageId) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (!message) return;

    if (message.text.split(" ").length < 150) {
      setErrorMessage("Text must be at least 150 words to summarize.");
      return;
    }

    try {
      setLoadingSummaryId(messageId);
      let summaryResult = await summarizeText(message.text);
      summaryResult = summaryResult.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\n/g, " ").trim();

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, summary: summaryResult } : msg
        )
      );
    } catch (error) {
      setErrorMessage("An error occurred while summarizing.");
    } finally {
      setLoadingSummaryId(null);
    }
  };

  const handleTranslate = async (messageId, targetLang) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (!message) return;

    try {
      setLoadingTranslationId(messageId);
      setErrorMessage("");

      const translatedTextResult = await translateText(message.text, targetLang);

      if (!translatedTextResult || translatedTextResult.toLowerCase().includes("translation failed")) {
        throw new Error(`Translation to ${targetLang} failed.`);
      }

      const targetLangName = languages.find((lang) => lang.code === targetLang)?.name || "Unknown Language";

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                translations: [...msg.translations, { lang: targetLang, name: targetLangName, text: translatedTextResult }],
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Translation error:", error.message);
      setErrorMessage(error.message);
    } finally {
      setLoadingTranslationId(null);
    }
  };

  return (
    <div className={design.contain}>
      {showIntro && messages.length === 0 && (
        <div className={design.introMessage}>
          <h2>Welcome to LuxeAi-Powered Text Processing</h2>
          <p>Type or paste text to get started. You can summarize, translate, or detect the language.</p>
          <p>To summarize, you must input at least 150 words.</p>
        </div>
      )}

      <div className={design.chat} ref={chatContainerRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={design.messageContainer}>
            <div className={design.texting}>
              <p className={design.original}>{msg.text}</p>
              <div className={design.controls}>
                <p className={design.language}>
                  <strong>Detected Language:</strong>{" "}
                  {languages.find((lang) => lang.code.toLowerCase() === msg.detectedLanguage.toLowerCase())?.name || "Unknown"}
                </p>
                <div className={design.butt}>
                  {msg.detectedLanguage.toLowerCase() === "en" && msg.text.split(" ").length >= 150 && (
                    <Button text="Summarize" onClick={() => handleSummarize(msg.id)} disabled={loadingSummaryId === msg.id} />
                  )}
                  <div className={design.translateDropdown}>
                    <select 
                      onChange={(e) => handleTranslate(msg.id, e.target.value)} 
                      value="" 
                      className={design.theme} 
                      disabled={loadingTranslationId === msg.id}
                    >
                      <option value="" disabled>Translate</option>
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {loadingTranslationId === msg.id && (
              <div className={design.loadingIndicator}>
                <FaSpinner className={design.spinner} />
                <span className={design.fun}>Wait ooo, I dey come...</span>
              </div>
            )}

            {(msg.translations.length > 0 || msg.summary) && (
              <div className={design.additionalInfo}>
                {msg.translations.length > 0 && msg.translations.map((t, index) => (
                  <p key={index} className={design.translator}><strong>{t.name}:</strong> {t.text}</p>
                ))}
              </div>
            )}

            {loadingSummaryId === msg.id && (
              <div className={design.loadingIndicator}>
                <FaSpinner className={design.spinner} />
                <span className={design.fun}>Wait ooo, I dey come...</span>
              </div>
            )}

            {msg.summary && (
              <div className={design.additionalInfo}>
                <p className={design.summarizer}><strong>Summary:</strong> {msg.summary}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={design.inputField}>
        <InputField 
          value={inputText} 
          onChange={(e) => {
            setInputText(e.target.value);
            if (showIntro) setShowIntro(false);
          }} 
          placeholder="Enter text here..."
        />
        <button className={design.sendButton} onClick={handleSend}>
          <FaPaperPlane />
        </button>
        {messages.length > 0 && <Button text="Clear" onClick={handleClear} />}
      </div>

      {errorMessage && <div className={design.overlay}><p>{errorMessage}</p></div>}
    </div>
  );
};

export default TextProcessor;