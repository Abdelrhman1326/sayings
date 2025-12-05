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
    author?: string;
    likes_count: number | null;
    dislikes_count: number | null;
    source?: string;
    saved?: boolean;
    onUnsave?: (id: number | string) => void;
    liked_by_user?: boolean;
    disliked_by_user?: boolean;
    isCommunity?: boolean;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
                                                 id,
                                                 text,
                                                 author,
                                                 likes_count,
                                                 dislikes_count,
                                                 source = "",
                                                 saved: savedProp = false,
                                                 onUnsave,
                                                 liked_by_user = false,
                                                 disliked_by_user = false,
                                                 isCommunity = false,
                                             }) => {
    const initialAction: "like" | "dislike" | null = liked_by_user ? "like" : disliked_by_user ? "dislike" : null;

    const [likes, setLikes] = useState(likes_count ?? 0);
    const [dislikes, setDislikes] = useState(dislikes_count ?? 0);
    const [lastAction, setLastAction] = useState<"like" | "dislike" | null>(initialAction);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState<boolean>(savedProp);

    useEffect(() => {
        if (liked_by_user) setLastAction("like");
        else if (disliked_by_user) setLastAction("dislike");
        else setLastAction(null);
    }, [liked_by_user, disliked_by_user]);

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
            toast.success("Copied to clipboard");
            await processCopyInBackend();
        } catch {
            toast.error("Failed to copy");
        }
    };

    const handleLike = async () => {
        try {
            let response;
            if (lastAction === "like") {
                response = await undoReaction(id, "like");
                setLastAction(null);
            } else {
                response = await likeQuote(id);
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
        try {
            let response;
            if (lastAction === "dislike") {
                response = await undoReaction(id, "dislike");
                setLastAction(null);
            } else {
                response = await dislikeQuote(id);
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
            const response: any = await saveQuote(id);
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
        <div className="bg-[#1D1D1D] text-white rounded-lg p-4 flex flex-col gap-2 max-w-4xl border border-[#1D1D1D]">
            <p className="text-lg italic">“{text}”</p>
            <p className="text-right text-gray-400">— {author}</p>
            {source && <p className="text-right text-gray-400">{source}</p>}

            <div className="flex items-center gap-4 text-gray-400 mt-2">
                <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors duration-200" onClick={handleLike}>
                    <ThumbsUp size={16} stroke={lastAction === "like" ? "currentColor" : "gray"} fill={lastAction === "like" ? "currentColor" : "none"} />
                    <span>{likes}</span>
                </div>

                <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors duration-200" onClick={handleDislike}>
                    <ThumbsDown size={16} stroke={lastAction === "dislike" ? "currentColor" : "gray"} fill={lastAction === "dislike" ? "currentColor" : "none"} />
                    <span>{dislikes}</span>
                </div>

                <Copy size={16} className="cursor-pointer hover:text-white transition-colors duration-200" onClick={() => copyToClipboard(text)} />

                {saved ? (
                    <BookmarkCheck size={18} className="cursor-pointer hover:text-white transition-colors duration-200" onClick={handleSave} />
                ) : (
                    <Bookmark size={18} className="cursor-pointer hover:text-white transition-colors duration-200" onClick={handleSave} />
                )}
            </div>

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
    );
};

export default QuoteCard;
