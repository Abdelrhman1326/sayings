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
        if (data) {
          setQuote(data.quote_text || "No quote available");
          setAuthor(data.author || "Unknown");
          setQuoteId(data.id);
          if (data.id) {
            const reactionStatus = await getQuoteReactionStatus(data.id);
            if (reactionStatus.liked) setLastAction("like");
            else if (reactionStatus.disliked) setLastAction("dislike");
            else setLastAction(null);
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
      } else {
        response = await likeQuote(quote_id!);
        setLastAction("like");
      }
      setLikesCount(response.likes_count);
      setDislikesCount(response.dislikes_count);
    } catch (err: any) {
      if (err.message === "User already liked this quote") {
        const response = await undoReaction(quote_id!, "like");
        setLastAction(null);
        setLikesCount(response.likes_count);
        setDislikesCount(response.dislikes_count);
      }
    }
  };

  const handleDislike = async () => {
    try {
      let response;
      if (lastAction === "dislike") {
        response = await undoReaction(quote_id!, "dislike");
        setLastAction(null);
      } else {
        response = await dislikeQuote(quote_id!);
        setLastAction("dislike");
      }
      setLikesCount(response.likes_count);
      setDislikesCount(response.dislikes_count);
    } catch (err: any) {
      if (err.message === "User already disliked this quote") {
        const response = await undoReaction(quote_id!, "dislike");
        setLastAction(null);
        setLikesCount(response.likes_count);
        setDislikesCount(response.dislikes_count);
      }
    }
  };

  return (
    <div className="relative w-screen min-h-screen bg-[#141414] bg-opacity-95 flex flex-col items-center pt-6 px-4 sm:px-8 md:px-16 lg:px-32 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 sm:gap-6 w-full relative">
        <div className="flex flex-col">
          <Logo size={44} />
        </div>

        {/* Back button */}
        <div className="absolute top-0 right-0 mt-2">
          <div
            className="bg-black border border-white border-opacity-30 rounded-lg p-2 pt-2.5 pb-2.5 pr-4 flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft
              className="text-white group-hover:stroke-uiPrimary transition duration-200"
              size={20}
              strokeWidth={2.5}
            />
            <span className="text-white text-sm sm:text-xl group-hover:text-uiPrimary transition duration-200">
              Back
            </span>
          </div>
        </div>
      </div>

      {/* Neon Quote Card with full-page light */}
      <div className="flex-grow flex items-center justify-center w-full mb-8 sm:mb-16 md:mb-24 lg:mb-28 relative">
        {loading ? (
          <p className="text-white text-base sm:text-lg">Loading...</p>
        ) : (
          <>
            {/* Full-page Light Beam */}
            <div className="absolute top-10 left-0 w-full h-full bg-gradient-to-b from-cyan-400/30 via-cyan-300/20 to-transparent blur-3xl animate-[pulse_6s_infinite] pointer-events-none" />
            <NeonQuoteCard
              id={quote_id || 0}
              text={quote || ""}
              author={author || ""}
              likes_count={likes_count || 0}
              dislikes_count={dislikes_count || 0}
              lastAction={lastAction}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default LuckyQuote;
