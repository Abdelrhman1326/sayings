import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Copy, Bookmark } from "lucide-react";
import { toast } from "react-toastify";

import { likeQuote } from "../../apis/likeQuote";
import { dislikeQuote } from "../../apis/dislikeQuote";
import { undoReaction } from "../../apis/undoReaction";

interface QuoteCardProps {
  id: number;
  text: string;
  author: string;
  likes_count: number | null;
  dislikes_count: number | null;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ id, text, author, likes_count, dislikes_count }) => {
  const [likes, setLikes] = useState(likes_count ?? 0);
  const [dislikes, setDislikes] = useState(dislikes_count ?? 0);
  const [lastAction, setLastAction] = useState<"like" | "dislike" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy: ", error);
      toast.error(`Failed to copy: ${error}`);
    }
  };

  const handleLike = async () => {
    try {
      let response;
      if (lastAction === "like") {
        response = await undoReaction(id, "like");
        setLastAction(null);
        console.log("Undo like!");
      } else {
        response = await likeQuote(id);
        setLastAction("like");
        console.log("Liked!");
      }
      setLikes(response.likes_count);
      setDislikes(response.dislikes_count);
      setError(null);
    } catch (err) {
      if (err.message === "User already liked this quote") {
        try {
          const response = await undoReaction(id, "like");
          setLastAction(null);
          setLikes(response.likes_count);
          setDislikes(response.dislikes_count);
          setError(null);
          console.log("Undo like because already liked!");
        } catch (undoError) {
          setError(undoError.message);
          toast.error("Error undoing like");
        }
      } else {
        setError(err.message);
        toast.error("Error liking quote");
      }
    }
  };

  const handleDislike = async () => {
    try {
      let response;
      if (lastAction === "dislike") {
        response = await undoReaction(id, "dislike");
        setLastAction(null);
        console.log("Undo dislike!");
      } else {
        response = await dislikeQuote(id);
        setLastAction("dislike");
        console.log("Disliked!");
      }
      setLikes(response.likes_count);
      setDislikes(response.dislikes_count);
      setError(null);
    } catch (err) {
      if (err.message === "User already disliked this quote") {
        try {
          const response = await undoReaction(id, "dislike");
          setLastAction(null);
          setLikes(response.likes_count);
          setDislikes(response.dislikes_count);
          setError(null);
          console.log("Undo dislike because already disliked!");
        } catch (undoError) {
          setError(undoError.message);
          toast.error("Error undoing dislike");
        }
      } else {
        setError(err.message);
        toast.error("Error disliking quote");
      }
    }
  };

  return (
    <div className="bg-[#1D1D1D] text-white rounded-lg p-4 flex flex-col gap-2 max-w-4xl border border-[#1D1D1D]">
      {/* Quote text */}
      <p className="text-lg italic">“{text}”</p>

      {/* Author */}
      <p className="text-right text-gray-400">— {author}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-400 mt-2">
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={handleLike}
        >
          <ThumbsUp size={16} fill={lastAction === "like" ? "currentColor" : "none"} /> <span>{likes}</span>
        </div>
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={handleDislike}
        >
          <ThumbsDown size={16} fill={lastAction === "dislike" ? "currentColor" : "none"} /> <span>{dislikes}</span>
        </div>
        <Copy
          size={16}
          className="cursor-pointer hover:text-white"
          onClick={() => copyToClipboard(text)}
        />
        <Bookmark size={16} className="cursor-pointer hover:text-white" />
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default QuoteCard;