import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Copy, Bookmark } from "lucide-react";
import { toast } from "react-toastify";

interface QuoteCardProps {
  id: number;
  text: string;
  author: string;
  likes_count: number | null;
  dislikes_count: number | null;
  lastAction: "like" | "dislike" | null;
  onLike: () => Promise<void>;
  onDislike: () => Promise<void>;
  onUndoReaction: (type: "like" | "dislike") => Promise<void>;
}

const NeonQuoteCard: React.FC<QuoteCardProps> = ({
  id,
  text,
  author,
  likes_count,
  dislikes_count,
  lastAction,
  onLike,
  onDislike,
  onUndoReaction,
}) => {

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard")
    } catch (err) {
      console.log(`Failed to copy`);
      toast.error(`Failed to copy: ${err}`);
    }
  };

  return (
    <div className="relative w-full max-w-xl p-6 flex flex-col gap-4 text-white
      bg-[#18181B] rounded-2xl border-2 border-transparent
      hover:border-pink-500 hover:shadow-[0_0_20px_rgba(255,0,170,0.7),0_0_40px_rgba(0,255,241,0.5)]
      transition-all duration-300">
      
      {/* Quote */}
      <p className="text-xl italic">“{text}”</p>
      
      {/* Author */}
      <p className="text-right text-gray-400">— {author}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-400 mt-2">
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={onLike}
        >
          <ThumbsUp size={16} fill={lastAction === "like" ? "currentColor" : "none"} /> 
          <span>{likes_count}</span>
        </div>
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={onDislike}
        >
          <ThumbsDown size={16} fill={lastAction === "dislike" ? "currentColor" : "none"} /> 
          <span>{dislikes_count}</span>
        </div>
        <Copy size={16} className="cursor-pointer hover:text-white" onClick={() => {
            copyToClipboard(text)
          }
        } />
        <Bookmark size={16} className="cursor-pointer hover:text-white" />
      </div>
    </div>
  );
};

export default NeonQuoteCard;