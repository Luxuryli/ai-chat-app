import { useEffect, useState } from "react";
import style from "../Header/Header.module.css"; 

const Header = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <header className={style.header}>
      <h1 className={style.head}>LuxeAi</h1>
      <button onClick={toggleTheme} className={style.toggleButton}>
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </header>
  );
};

export default Header;