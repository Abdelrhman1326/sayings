import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Copy, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "react-toastify";

import { likeQuote } from "../../apis/likeQuote";
import { dislikeQuote } from "../../apis/dislikeQuote";
import { undoReaction } from "../../apis/undoReaction";
import { saveQuote } from "../../apis/saveQuote";
import { copyQuote } from "../../apis/copyQuote";

interface QuoteCardProps {
  id: number | string;
  text: string;
  author: string;
  likes_count: number | null;
  dislikes_count: number | null;
  source?: string;
  saved?: boolean;
  onUnsave?: (id: number | string) => void;
  lastAction?: "like" | "dislike" | null;
  onLike?: () => void;
  onDislike?: () => void;
}

const NeonQuoteCard: React.FC<QuoteCardProps> = ({
  id,
  text,
  author,
  likes_count,
  dislikes_count,
  source = "",
  saved: savedProp = false,
  onUnsave,
  lastAction: lastActionProp,
  onLike,
  onDislike,
}) => {
  const [likes, setLikes] = useState(likes_count ?? 0);
  const [dislikes, setDislikes] = useState(dislikes_count ?? 0);
  const [lastAction, setLastAction] = useState<"like" | "dislike" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<boolean>(savedProp);

  // Sync state with props if provided
  useEffect(() => {
    setLikes(likes_count ?? 0);
  }, [likes_count]);

  useEffect(() => {
    setDislikes(dislikes_count ?? 0);
  }, [dislikes_count]);

  useEffect(() => {
    if (lastActionProp !== undefined) {
      setLastAction(lastActionProp);
    }
  }, [lastActionProp]);

    const processCopyInBackend = async () => {
      try {
        const response = await copyQuote(Number(id));
        console.log("Copy action processed in the backend:", response);
      } catch (err: any) {
        console.error("Error while processing copy action in the backend:", err?.message || err);
      }
    };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // toast.success("Copied to clipboard");
      await processCopyInBackend();
    } catch {
      // toast.error("Failed to copy");
      console.log("Failed to copy")
    }
  };

  const handleLike = async () => {
    if (onLike) {
        onLike();
        return;
    }
    try {
      let response;
      if (lastAction === "like") {
        response = await undoReaction(Number(id), "like");
        setLastAction(null);
      } else {
        response = await likeQuote(Number(id));
        setLastAction("like");
      }
      setLikes(response.likes_count);
      setDislikes(response.dislikes_count);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error("Error liking quote");
    }
  };

  const handleDislike = async () => {
    if (onDislike) {
        onDislike();
        return;
    }
    try {
      let response;
      if (lastAction === "dislike") {
        response = await undoReaction(Number(id), "dislike");
        setLastAction(null);
      } else {
        response = await dislikeQuote(Number(id));
        setLastAction("dislike");
      }
      setLikes(response.likes_count);
      setDislikes(response.dislikes_count);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error("Error disliking quote");
    }
  };

  const handleSave = async () => {
    try {
      const response: any = await saveQuote(Number(id));
      const message = response.data.message;

      if (message === "Quote saved") {
        setSaved(true);
        toast.success("Saved");
      } else if (message === "Quote unsaved") {
        setSaved(false);
        toast.success("Unsaved");
        onUnsave?.(id);
      }
    } catch (err: any) {
      toast.error(`Error: ${err?.message}`);
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
      {source && <p className="text-right text-gray-400">{source}</p>}


      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-400 mt-2">
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={handleLike}
        >
          <ThumbsUp size={16} fill={lastAction === "like" ? "currentColor" : "none"} /> 
          <span>{likes}</span>
        </div>
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={handleDislike}
        >
          <ThumbsDown size={16} fill={lastAction === "dislike" ? "currentColor" : "none"} /> 
          <span>{dislikes}</span>
        </div>
        <Copy size={16} className="cursor-pointer hover:text-white" onClick={() => {
            copyToClipboard(text)
          }
        } />
        {saved ? (
          <BookmarkCheck size={18} className="cursor-pointer hover:text-white" onClick={handleSave} />
        ) : (
          <Bookmark size={18} className="cursor-pointer hover:text-white" onClick={handleSave} />
        )}
      </div>
      
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default NeonQuoteCard;