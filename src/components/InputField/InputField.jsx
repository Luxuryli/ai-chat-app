import inputer from "../InputField/InputField.module.css"; 
import { useRef, useEffect } from "react";

const InputField = ({ value, onChange, placeholder }) => {
  const textareaRef = useRef(null);

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "41px"; 
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"; 
    }
  };

  const handleInput = (e) => {
    onChange(e);
    resizeTextarea();
  };

  useEffect(() => {
    resizeTextarea();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={inputer.inputBox}
      value={value}
      onChange={handleInput}
      placeholder={placeholder}
      rows={1}
    />
  );
};

export default InputField;