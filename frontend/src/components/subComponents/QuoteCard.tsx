import React, { useState, useEffect, useRef } from "react";
import { ThumbsUp, ThumbsDown, Copy, Bookmark, BookmarkCheck, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { likeQuote } from "../../apis/likeQuote";
import { dislikeQuote } from "../../apis/dislikeQuote";
import { undoReaction } from "../../apis/undoReaction";
import { saveQuote } from "../../apis/saveQuote";
import { copyQuote } from "../../apis/copyQuote";
import { deletePublishedQuote } from "../../apis/deletePublishedQuote";

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
    isOwner?: boolean;
    onDelete?: (id: number | string) => void;
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
                                                 isCommunity: isCommunityProp = false,
                                                 isOwner = false,
                                                 onDelete,
                                             }) => {
    const initialAction: "like" | "dislike" | null = liked_by_user
        ? "like"
        : disliked_by_user
            ? "dislike"
            : null;

    const [likes, setLikes] = useState(likes_count ?? 0);
    const [dislikes, setDislikes] = useState(dislikes_count ?? 0);
    const [lastAction, setLastAction] = useState<"like" | "dislike" | null>(initialAction);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState<boolean>(savedProp);
    const [isCommunity, setIsCommunity] = useState<boolean>(isCommunityProp);
    const [isDeleting, setIsDeleting] = useState(false);
    const isDeletingRef = useRef(false);

    // Keep saved and isCommunity in sync if parent props change
    useEffect(() => {
        setSaved(savedProp);
    }, [savedProp]);

    useEffect(() => {
        setIsCommunity(isCommunityProp);
    }, [isCommunityProp]);

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
            // toast.success("Copied to clipboard");
            await processCopyInBackend();
        } catch {
            // toast.error("Failed to copy");
            console.log("Failed to copy");
        }
    };

    const handleLike = async () => {
        const originalAction = lastAction;
        const originalLikes = likes;
        const originalDislikes = dislikes;

        try {
            // optimistic update
            if (lastAction === "like") {
                setLastAction(null);
                setLikes(prev => Math.max(prev - 1, 0));
            }
            else if (lastAction === "dislike") {
                setLastAction("like");
                setLikes(prev => prev + 1);
                setDislikes(prev => Math.max(prev - 1, 0));
            }
            else {
                setLastAction("like");
                setLikes(prev => prev + 1);
            }

            if (originalAction === "like") {
                await undoReaction(Number(id), "like", isCommunity);
            } else {
                await likeQuote(Number(id), isCommunity);
            }

        } catch (err: any) {
            // rollback
            setLastAction(originalAction);
            setLikes(originalLikes);
            setDislikes(originalDislikes);
            setError(err.message);
        }
    };

    const handleDislike = async () => {
        const originalAction = lastAction;
        const originalLikes = likes;
        const originalDislikes = dislikes;

        try {
            // optimistic update
            if (lastAction === "dislike") {
                setLastAction(null);
                setDislikes(prev => Math.max(prev - 1, 0));
            }
            else if (lastAction === "like") {
                setLastAction("dislike");
                setLikes(prev => Math.max(prev - 1, 0));
                setDislikes(prev => prev + 1);
            }
            else {
                setLastAction("dislike");
                setDislikes(prev => prev + 1);
            }

            if (originalAction === "dislike") {
                await undoReaction(Number(id), "dislike", isCommunity);
            } else {
                await dislikeQuote(Number(id), isCommunity);
            }

        } catch (err: any) {
            // rollback optimistic update
            setLastAction(originalAction);
            setLikes(originalLikes);
            setDislikes(originalDislikes);

            setError(err.message);
            // toast.error("Error disliking quote");
        }
    };

    const handleSave = async () => {
        const originalState = saved;

        try {
            // optimistic update
            setSaved(!saved);

            const response: any = await saveQuote(Number(id), isCommunity);
            const message = response.message;

            if (message === "Quote saved" || message === "Community quote saved") {
                setSaved(true);
                // toast.success("Saved");
            }
            else if (message === "Quote unsaved" || message === "Community quote unsaved") {
                setSaved(false);
                // toast.success("Unsaved");
                onUnsave?.(id);
            }

        } catch (err: any) {
            // rollback
            setSaved(originalState);
            // toast.error(`Error: ${err?.message}`);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this quote?")) {
            return;
        }
        if (isDeletingRef.current) return; // Prevent duplicate requests using ref (synchronous)

        isDeletingRef.current = true;
        setIsDeleting(true);
        try {
            await deletePublishedQuote(Number(id));
            onDelete?.(id); // Notify parent first to remove the quote
            toast.success("Quote deleted successfully");
        } catch (err: any) {
            toast.error(`Error: ${err?.message}`);
        } finally {
            isDeletingRef.current = false;
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-[#1D1D1D] text-white rounded-lg p-4 sm:p-5 flex flex-col gap-2 w-full max-w-4xl mx-auto border border-[#1D1D1D]">
            <p className="text-base sm:text-lg italic">"{text}"</p>
            <p className="text-right text-gray-400 text-sm sm:text-base">— {author}</p>
            {source && <p className="text-right text-gray-400 text-sm sm:text-base">{source}</p>}

            <div className="flex items-center gap-3 sm:gap-4 text-gray-400 mt-2 flex-wrap">
                <div
                    className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors duration-200"
                    onClick={handleLike}
                >
                    <ThumbsUp
                        size={16}
                        stroke={lastAction === "like" ? "currentColor" : "gray"}
                        fill={lastAction === "like" ? "currentColor" : "none"}
                    />
                    <span className="text-sm">{likes}</span>
                </div>

                <div
                    className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors duration-200"
                    onClick={handleDislike}
                >
                    <ThumbsDown
                        size={16}
                        stroke={lastAction === "dislike" ? "currentColor" : "gray"}
                        fill={lastAction === "dislike" ? "currentColor" : "none"}
                    />
                    <span className="text-sm">{dislikes}</span>
                </div>

                <Copy
                    size={16}
                    className="cursor-pointer hover:text-white transition-colors duration-200"
                    onClick={() => copyToClipboard(text)}
                />

                {saved ? (
                    <BookmarkCheck
                        size={18}
                        className="cursor-pointer hover:text-white transition-colors duration-200"
                        onClick={handleSave}
                    />
                ) : (
                    <Bookmark
                        size={18}
                        className="cursor-pointer hover:text-white transition-colors duration-200"
                        onClick={handleSave}
                    />
                )}

                {isOwner && !isDeleting && (
                    <Trash2
                        size={18}
                        className="cursor-pointer transition-colors duration-200 ml-auto hover:text-red-500"
                        onClick={handleDelete}
                    />
                )}
            </div>

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
    );
};

export default QuoteCard;