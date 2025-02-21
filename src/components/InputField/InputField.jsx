import inputer from "../InputField/InputField.module.css"; 

import { useRef, useEffect } from "react";

const InputField = ({ value, onChange, placeholder, onSend }) => {
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
      <div className={inputer.inputContainer}>
      <textarea
        ref={textareaRef}
        className={inputer.inputBox}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={1}
      />
    </div>
  );
};

export default InputField;