interface LogoProps {
  color?: string;
  size?: number | string; // e.g. 24 or '24px'
}

const Logo = ({ color = 'white', size = '24px' }: LogoProps) => {
  return (
    <h1
      className="font-jsMath font-bold cursor-default"
      style={{ color, fontSize: typeof size === 'number' ? `${size}px` : size }}
    >
      sayings
    </h1>
  );
};

export default Logo;
