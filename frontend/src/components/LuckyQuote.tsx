import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Logo from "./ui/Logo";
import { useNavigate } from "react-router-dom";
import NeonQuoteCard from "./subComponents/NeonQuoteCard";
import { getRandomQuote } from "../apis/randomQuoteApi";
import { getQuoteReactionStatus } from "../apis/getQuoteReactionStatus";
import { likeQuote } from "../apis/likeQuote";
import { dislikeQuote } from "../apis/dislikeQuote";
import { undoReaction } from "../apis/undoReaction";

const LuckyQuote = () => {
  const navigate = useNavigate();

  const [quote, setQuote] = useState<string | null>(null);
  const [author, setAuthor] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [likes_count, setLikesCount] = useState<number>(0);
  const [dislikes_count, setDislikesCount] = useState<number>(0);
  const [quote_id, setQuoteId] = useState<number | undefined>(undefined);
  const [lastAction, setLastAction] = useState<"like" | "dislike" | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const data = await getRandomQuote();

        // if API returns { quote: "...", author: "..." }
        if (data) {
          setQuote(data.quote_text || "No quote available");
          setAuthor(data.quote_author || "Unknown");
          setQuoteId(data.id);
          if (data.id) {
            const reactionStatus = await getQuoteReactionStatus(data.id);
            if (reactionStatus.liked) {
              setLastAction("like");
            } else if (reactionStatus.disliked) {
              setLastAction("dislike");
            } else {
              setLastAction(null);
            }
          }
        } else {
          setQuote("No quote available");
          setAuthor("Unknown");
        }
      } catch (err) {
        console.error(err);
        setQuote("Failed to fetch quote");
        setAuthor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  const handleLike = async () => {
    try {
      let response;
      if (lastAction === "like") {
        response = await undoReaction(quote_id!, "like");
        setLastAction(null);
        console.log("Like undone!");
      } else {
        response = await likeQuote(quote_id!);
        setLastAction("like");
        console.log("Quote liked!");
      }
      setLikesCount(response.likes_count);
      setDislikesCount(response.dislikes_count);
    } catch (err: any) {
      if (err.message === "User already liked this quote") {
        try {
          const response = await undoReaction(quote_id!, "like");
          setLastAction(null);
          setLikesCount(response.likes_count);
          setDislikesCount(response.dislikes_count);
          console.log("Like undone because already liked!");
        } catch (undoError: any) {
          console.log(`Error undoing like: ${undoError.message}`);
        }
      } else {
        console.log(`Error liking quote: ${err.message}`);
      }
    }
  };

  const handleDislike = async () => {
    try {
      let response;
      if (lastAction === "dislike") {
        response = await undoReaction(quote_id!, "dislike");
        setLastAction(null);
        console.log("Dislike undone!");
      } else {
        response = await dislikeQuote(quote_id!);
        setLastAction("dislike");
        console.log("Quote disliked!");
      }
      setLikesCount(response.likes_count);
      setDislikesCount(response.dislikes_count);
    } catch (err: any) {
      if (err.message === "User already disliked this quote") {
        try {
          const response = await undoReaction(quote_id!, "dislike");
          setLastAction(null);
          setLikesCount(response.likes_count);
          setDislikesCount(response.dislikes_count);
          console.log("Dislike undone because already disliked!");
        } catch (undoError: any) {
          console.log(`Error undoing dislike: ${undoError.message}`);
        }
      } else {
        console.log(`Error disliking quote: ${err.message}`);
      }
    }
  };

  const handleUndoReaction = async (type: "like" | "dislike") => {
    try {
      const response = await undoReaction(quote_id!, type);
      setLastAction(null);
      setLikesCount(response.likes_count);
      setDislikesCount(response.dislikes_count);
      console.log(`Reaction undone!`);
    } catch (err: any) {
      console.log(`Error undoing reaction: ${err.message}`);
    }
  };

  return (
    <div className="relative w-screen min-h-screen bg-[#141414] bg-opacity-95 flex flex-col items-center pt-8 px-32">
      {/* Header */}
      <div className="flex items-center gap-6 w-full relative">
        <Logo size={44} />
        <p className="text-uiPrimary font-bold font-ibm mt-2 text-[16px]">Lucky Quote</p>

        {/* Back button */}
        <div className="absolute top-0 right-0 mt-2">
          <div
            className="bg-black border border-white border-opacity-30 rounded-lg p-2 pt-2.5 pb-2.5 pr-4 flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft
              className="text-white group-hover:stroke-uiPrimary transition duration-200"
              size={28}
            />
            <span className="text-white text-xl group-hover:text-uiPrimary transition duration-200">
              Back
            </span>
          </div>
        </div>
      </div>

      {/* Neon Quote Card centered vertically */}
      <div className="flex-grow flex items-center justify-center w-full mb-28">
        {loading ? (
          <p className="text-white text-lg">Loading...</p>
        ) : (
          <NeonQuoteCard
            id={quote_id || 0}
            text={quote || ""}
            author={author || ""}
            likes_count={likes_count || 0}
            dislikes_count={dislikes_count || 0}
            lastAction={lastAction}
            onLike={handleLike}
            onDislike={handleDislike}
            onUndoReaction={handleUndoReaction}
          />
        )}
      </div>
    </div>
  );
};

export default LuckyQuote;