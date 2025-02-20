import { useState, useRef, useEffect } from "react";
import { summarizeText, translateText, detectLanguage } from "../../hooks/useAPI"; 
import InputField from "../InputField/InputField.jsx";
import Button from "../Button/Button.jsx";
import design from "./TextProcessor.module.css";

const TextProcessor = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const textareaRef = useRef(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "es", name: "Spanish" },
    { code: "tr", name: "Turkish" },
    { code: "hi", name: "Hindi" },
    { code: "vi", name: "Vietnamese" },
    { code: "bn", name: "Bengali" },
    { code: "zh-Hant", name: "Mandarin (Traditional)" },
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
    resetTextareaSize();
  };

  const handleSummarize = async (messageId) => {
    const message = messages.find((msg) => msg.id === messageId);

    if (!message.text.trim()) {
      setErrorMessage("Please enter text before summarizing.");
      return;
    }

    if (message.text.split(" ").length < 150) {
      setErrorMessage("Text must be at least 150 words to summarize.");
      return;
    }

    try {
      let summaryResult = await summarizeText(message.text);
      summaryResult = summaryResult.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\n/g, " ").replace(/\s+/g, " ").trim();

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, summary: summaryResult } : msg
        )
      );
    } catch (error) {
      setErrorMessage("An error occurred while summarizing.");
    }
  };

  const handleTranslate = async (messageId, targetLang) => {
    const message = messages.find((msg) => msg.id === messageId);

    if (message.translations.some((t) => t.lang === targetLang)) {
      setIsDropdownOpen(null);
      return;
    }

    try {
      const translatedTextResult = await translateText(message.text, targetLang);
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

      setIsDropdownOpen(null);
    } catch (error) {
      setErrorMessage("An error occurred while translating.");
    }
  };

  const resetTextareaSize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className={design.contain}>
      <div className={design.chat}>
        {messages.map((msg) => (
          <div key={msg.id} className={design.messageContainer}>
            <div className={design.texting}>
              <p className={design.original}>{msg.text}</p>
              {msg.translations.length > 0 && (
                <div className={design.translations}>
                  {msg.translations.map((t, index) => (
                    <p key={index} className={design.translator}>
                      <strong>{t.name}:</strong> {t.text}
                    </p>
                  ))}
                </div>
              )}

              {msg.summary && (
                <p className={design.summarizer}><strong>Summary:</strong> {msg.summary}</p>
              )}
            </div>

            <div className={design.controls}>
              <p className={design.language}><strong>Detected Language:</strong> {msg.detectedLanguage}</p>

              <div className={design.butt}>
                {msg.text.split(" ").length >= 150 && (
                  <Button text="Summarize" onClick={() => handleSummarize(msg.id)} />
                )}

              <div className={design.translateDropdown}>
              <select
                  onChange={(e) => handleTranslate(msg.id, e.target.value)}
                value=""
              >
              <option value="" disabled>Translate</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
              </select>
              </div>
                
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={design.inputField}>
        <InputField
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text here..."
        />

        <Button text="Send" onClick={handleSend} />
      </div>

      {errorMessage && (
        <div className={design.overlay}>
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TextProcessor;