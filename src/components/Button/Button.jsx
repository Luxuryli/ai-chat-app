import main from"../Button/Button.module.css"; // Import the CSS file

const Button = ({ onClick, disabled, text }) => {
  return (
    <button onClick={onClick} disabled={disabled} className={main.custom}>
      {text}
    </button>
  );
};

export default Button;