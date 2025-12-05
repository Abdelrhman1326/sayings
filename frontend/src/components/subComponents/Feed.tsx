import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import QuoteCard from "./QuoteCard";
import { toast } from "react-toastify";
import { getFeed } from "../../apis/getFeed";

interface Quote {
  id: number;
  quote_text: string;
  quote_author: string;
  likes_count: number | null;
  dislikes_count: number | null;
  quote_source: string;
}

const CHUNK_SIZE = 20;

const Feed: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [cursor, setCursor] = useState({ limit: CHUNK_SIZE });
  const anchorRef = useRef<{ id: number | null; top: number }>({
    id: null,
    top: 0,
  });

  const fetchFeed = async (prepend = false) => {
    if (loading || (!hasMore && !prepend)) return;

    setLoading(true);
    // const toastId = toast.loading("Loading feed...", { autoClose: false });

    try {
      if (prepend && quotes.length > 0) {
        const prevFirstId = quotes[0]?.id;
        const el = document.getElementById(`quote-${prevFirstId}`);
        anchorRef.current = {
          id: prevFirstId ?? null,
          top: el ? el.getBoundingClientRect().top : 0,
        };
      } else {
        anchorRef.current = { id: null, top: 0 };
      }

      const data = await getFeed(cursor);

      if (data.results.length === 0) {
        setHasMore(false);
        return;
      }

      setQuotes((prev) => {
        let combined: Quote[];
        if (prepend) {
          combined = [...data.results, ...prev];
        } else {
          combined = [...prev, ...data.results];
        }

        if (combined.length > 100) {
          combined = combined.slice(combined.length - 100);
        }

        return combined;
      });

      if (data.next_cursor) {
        setCursor({ ...data.next_cursor, limit: CHUNK_SIZE });
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      // toast.error("Failed to load feed");
    } finally {
      setLoading(false);
      // toast.dismiss(toastId);
    }
  };

  useLayoutEffect(() => {
    const { id, top } = anchorRef.current;
    if (id !== null) {
      const el = document.getElementById(`quote-${id}`);
      if (el) {
        const newTop = el.getBoundingClientRect().top;
        const delta = newTop - top;
        if (delta !== 0) {
          window.scrollBy(0, delta);
        }
      }
      anchorRef.current = { id: null, top: 0 };
    }
  }, [quotes]);

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (loading) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 200;

      if (scrollPosition >= threshold && hasMore) {
        fetchFeed();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="flex flex-col items-center mt-6 w-full">
      {quotes.length > 0 ? (
        quotes.map((quote) => (
          <div
            id={`quote-${quote.id}`}
            key={quote.id}
            className="mb-4 w-[800px] max-w-full"
          >
            <QuoteCard
              id={quote.id}
              text={quote.quote_text}
              author={quote.quote_author}
              likes_count={quote.likes_count}
              dislikes_count={quote.dislikes_count}
              source={quote.quote_source}
              liked_by_user={quote.liked_by_user}
              disliked_by_user={quote.disliked_by_user}
            />
          </div>
        ))
      ) : (
        <p className="flex text-lg opacity-70 justify-center text-center mt-4">
          {loading ? "Loading feed..." : "No quotes yet"}
        </p>
      )}
    </div>
  );
};

export default Feed;
