interface ButtonProps {
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  text: string
}

const Button = ({
  className = '',
  onClick,
  type = 'button',
  text = 'Button',
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`font-ibm text-black text-center bg-uiPrimary px-4 py-2 rounded-lg hover:bg-uiPrimary/90 transition ${className}`}    >
      { text }
    </button>
  );
};

export default Button;