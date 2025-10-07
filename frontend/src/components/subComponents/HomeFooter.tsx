import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const HomeFooter = () => {
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const [words, setWords] = useState<string[]>([]);

  const wordArrays: string[][] = [
    [
      "Explore", "Discover", "Reflect", "Wonder", "Question",
      "Observe", "Think", "Contemplate", "Notice", "Realize",
      "Consider", "Imagine", "Uncover"
    ],
    [
      "Inspire", "Believe", "Grow", "Learn", "Achieve",
      "Focus", "Evolve", "Transform", "Create", "Progress",
      "Discipline", "Rise", "Flourish"
    ],
    [
      "Read", "Study", "Understand", "Absorb", "Interpret",
      "Analyze", "Engage", "Rethink", "Expand", "Decode",
      "Enlighten", "Visualize", "Navigate"
    ],
    [
      "Hope", "Passion", "Courage", "Ambition", "Determination",
      "Clarity", "Peace", "Strength", "Conviction", "Mindset",
      "Purpose", "Vision", "Trust"
    ]
  ];

  // Choose random word set on mount
  useEffect(() => {
    const index = Math.floor(Math.random() * wordArrays.length);
    setWords(wordArrays[index]);
  }, []);

  // Animate only after words are rendered
  useEffect(() => {
    const el = marqueeInnerRef.current;
    if (!el || words.length === 0) return;

    const width = el.scrollWidth;

    gsap.killTweensOf(el); // Kill any existing animations

    gsap.fromTo(
      el,
      { x: 150 },
      {
        x: -width / 2,
        duration: 100,
        ease: "linear",
        repeat: -1,
      }
    );
  }, [words]);

  return (
    <div className="relative overflow-hidden text-white font-ibm font-bold h-[140px]">
      <div className="absolute w-[220px] h-[85px] bg-gradient-to-r from-bgColor via-bgColor to-transparent bottom-0 left-0 z-10" />
      <div className="absolute w-[220px] h-[85px] bg-gradient-to-l from-bgColor via-bgColor to-transparent bottom-0 right-0 z-10" />

      {words.length > 0 && (
        <div
          className="absolute bottom-0 left-0 flex gap-20 text-[40px] opacity-30 whitespace-nowrap pb-4"
          ref={marqueeInnerRef}
        >
          {words.map((word, i) => (
            <span key={i}>#{word}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeFooter;