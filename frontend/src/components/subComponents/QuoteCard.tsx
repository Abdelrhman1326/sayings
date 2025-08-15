import React from "react";
import { ThumbsUp, ThumbsDown, Copy, Bookmark } from "lucide-react";

interface QuoteCardProps {
  text: string;
  author: string;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ text, author }) => {
  return (
    <div className="bg-[#18181B] text-white rounded-lg p-4 flex flex-col gap-2 max-w-3xl border border-gray-700">
      {/* Quote text */}
      <p className="text-lg italic">“{text}”</p>

      {/* Author */}
      <p className="text-right text-gray-400">— {author}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-400 mt-2">
        <div className="flex items-center gap-1 cursor-pointer hover:text-white">
          <ThumbsUp size={16} /> <span>100</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-white">
          <ThumbsDown size={16} /> <span>0</span>
        </div>
        <Copy size={16} className="cursor-pointer hover:text-white" />
        <Bookmark size={16} className="cursor-pointer hover:text-white" />
      </div>
    </div>
  );
};

export default QuoteCard;