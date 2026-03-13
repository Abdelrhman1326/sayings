import { useState, type KeyboardEvent } from "react";

interface LabelInputProps {
  className?: string;
  labels: string[];
  setLabels: (labels: string[]) => void;
}

const LabelInput = ({ className = "", labels, setLabels }: LabelInputProps) => {
  const [value, setValue] = useState<string>("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() !== "") {
      e.preventDefault();
      if (!labels.includes(value.trim())) {
        setLabels([...labels, value.trim()]);
      }
      setValue("");
    }
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Input */}
      <input
        type="text"
        placeholder="Type a genre and hit enter"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="py-2 outline-none bg-[#1D1D1D] text-white placeholder-gray-400 text-lg border-b border-gray-700"
      />

      {/* Labels list */}
      <div className="flex flex-wrap gap-2">
        {labels.map((label) => (
          <span
            key={label}
            className="bg-uiPrimary text-purple-950 font-semibold px-3 py-1 rounded-full flex items-center gap-2"
          >
            {label}
            <button
              onClick={() => removeLabel(label)}
              className="text-purple-950 font-extrabold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default LabelInput;