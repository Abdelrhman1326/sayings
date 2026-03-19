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
      await copyQuote(Number(id));
    } catch (err: any) {
      console.error("Error processing copy action:", err?.message || err);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      await processCopyInBackend();
    } catch {
      console.log("Failed to copy");
    }
  };

  const handleLike = async () => {
    if (onLike) {
      onLike();
      return;
    }

    const originalAction = lastAction;
    const originalLikes = likes;
    const originalDislikes = dislikes;

    try {
      // Optimistic update
      if (lastAction === "like") {
        setLastAction(null);
        setLikes(prev => Math.max(prev - 1, 0));
      } else if (lastAction === "dislike") {
        setLastAction("like");
        setLikes(prev => prev + 1);
        setDislikes(prev => Math.max(prev - 1, 0));
      } else {
        setLastAction("like");
        setLikes(prev => prev + 1);
      }

      if (originalAction === "like") {
        await undoReaction(Number(id), "like");
      } else {
        await likeQuote(Number(id));
      }
    } catch (err: any) {
      // Rollback
      setLastAction(originalAction);
      setLikes(originalLikes);
      setDislikes(originalDislikes);
      setError(err.message);
      toast.error("Error liking quote");
    }
  };

  const handleDislike = async () => {
    if (onDislike) {
      onDislike();
      return;
    }

    const originalAction = lastAction;
    const originalLikes = likes;
    const originalDislikes = dislikes;

    try {
      // Optimistic update
      if (lastAction === "dislike") {
        setLastAction(null);
        setDislikes(prev => Math.max(prev - 1, 0));
      } else if (lastAction === "like") {
        setLastAction("dislike");
        setLikes(prev => Math.max(prev - 1, 0));
        setDislikes(prev => prev + 1);
      } else {
        setLastAction("dislike");
        setDislikes(prev => prev + 1);
      }

      if (originalAction === "dislike") {
        await undoReaction(Number(id), "dislike");
      } else {
        await dislikeQuote(Number(id));
      }
    } catch (err: any) {
      // Rollback
      setLastAction(originalAction);
      setLikes(originalLikes);
      setDislikes(originalDislikes);
      setError(err.message);
      toast.error("Error disliking quote");
    }
  };

  const handleSave = async () => {
    const originalState = saved;

    try {
      // Optimistic update
      setSaved(!saved);

      const response: any = await saveQuote(Number(id));
      const message = response.message;

      if (message === "Quote saved" || message === "Community quote saved") {
        setSaved(true);
        toast.success("Saved");
      } else if (message === "Quote unsaved" || message === "Community quote unsaved") {
        setSaved(false);
        toast.success("Unsaved");
        onUnsave?.(id);
      }
    } catch (err: any) {
      // Rollback
      setSaved(originalState);
      toast.error(`Error: ${err?.message}`);
    }
  };

  return (
    <div className="relative w-full max-w-xs sm:max-w-md md:max-w-xl p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4 text-white
      bg-[#18181B] rounded-2xl border-2 border-transparent
      hover:border-pink-500 hover:shadow-[0_0_20px_rgba(255,0,170,0.7),0_0_40px_rgba(0,255,241,0.5)]
      transition-all duration-300">

      {/* Quote */}
      <p className="text-lg sm:text-xl md:text-2xl italic">"{text}"</p>

      {/* Author */}
      <p className="text-right text-gray-400 text-sm sm:text-base md:text-lg">— {author}</p>
      {source && <p className="text-right text-gray-400 text-sm sm:text-base md:text-lg">{source}</p>}


      {/* Actions */}
      <div className="flex items-center gap-3 sm:gap-4 text-gray-400 mt-2">
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={handleLike}
        >
          <ThumbsUp size={16} fill={lastAction === "like" ? "currentColor" : "none"} />
          <span className="text-sm sm:text-base">{likes}</span>
        </div>
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={handleDislike}
        >
          <ThumbsDown size={16} fill={lastAction === "dislike" ? "currentColor" : "none"} />
          <span className="text-sm sm:text-base">{dislikes}</span>
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