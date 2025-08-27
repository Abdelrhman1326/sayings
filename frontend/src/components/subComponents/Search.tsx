import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import QuoteCard from "./QuoteCard";
import { toast } from "react-toastify";
import { searchQuotes } from "../../apis/searchApi";

interface Quote {
  id: number;
  quote_text: string;
  quote_author: string;
  likes_count: number | null;
  dislikes_count: number | null;
  quote_source: string;
}

interface SearchProps {
  query: string;
  setQuery: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const CHUNK_SIZE = 50;

const Search: React.FC<SearchProps> = ({ query, setQuery, handleKeyDown }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [latestRemovedPage, setLatestRemovedPage] = useState<number | null>(null);

  const [resultsCount, setResultsCount] = useState<number | null>(null);

  // use effect to handle search message in the page:
  useLayoutEffect(() => {
    setResultsCount(null);
  }, [query]);

  // Anchor used to preserve viewport position when we prepend & trim bottom.
  const anchorRef = useRef<{ id: number | null; top: number }>({ id: null, top: 0 });

  const fetchQuotes = async (pageNumber: number, prepend = false) => {
    if (loading || (!hasMore && !prepend)) return;
    if (prepend && latestRemovedPage == 0) return; // no more pages to restore

    setLoading(true);
    console.log(`Loading quotes... (page ${pageNumber})`);
    const toastId = toast.loading("Loading quotes...", { autoClose: false });

    try {
      // Capture the current first item's DOM position as an anchor (only when prepending)
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

      const data = await searchQuotes({
        q: query,
        af: "",
        gf: [],
        limit: CHUNK_SIZE,
        page: pageNumber,
      });

      if (data.count === 0) {
        setResultsCount(0);
      } else {
        setResultsCount(data.count);
      }

      setQuotes((prev) => {
        let combined: Quote[];

        if (prepend) {
          combined = [...data.results, ...prev];
        } else {
          combined = [...prev, ...data.results];
        }

        // Remove oldest 50 at top if > 100 (append)
        if (!prepend && combined.length > 100) {
          setLatestRemovedPage(pageNumber - 2); // track latest removed page
          combined = combined.slice(50);
        }

        // Remove last 50 at bottom if > 100 (prepend)
        if (prepend && combined.length > 100) {
          combined = combined.slice(0, 100);
          setPage((prevPage) => prevPage - 1);
        }

        return combined;
      });

      if (prepend && latestRemovedPage !== null) {
        // We no longer use distance-from-bottom. We rely on the anchor delta in useLayoutEffect.
        setLatestRemovedPage(latestRemovedPage - 1);
      }

      // Update next page
      if (!data.next || data.results.length < CHUNK_SIZE) {
        if (!prepend) setHasMore(false);
      } else if (!prepend) {
        setPage((prevPage) => prevPage + 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  };

  // Restore scroll so the previously-first-visible item stays in place,
  // regardless of how much was inserted at top or removed from bottom.
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
      // clear anchor
      anchorRef.current = { id: null, top: 0 };
    }
  }, [quotes]);

  const handleSearch = () => {
    setResultsCount(null);
    setQuotes([]);
    setPage(1);
    setHasMore(true);
    setLatestRemovedPage(null);
    fetchQuotes(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
    handleKeyDown(e);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (loading) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 200;

      // Scroll down → fetch next page
      if (scrollPosition >= threshold && hasMore) {
        fetchQuotes(page);
      }

      // Scroll up → fetch latest removed page (prepend)
      if (window.scrollY < 200 && latestRemovedPage !== null) {
        fetchQuotes(latestRemovedPage, true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page, hasMore, latestRemovedPage]);

  return (
    <div className="flex flex-col items-center">
      {/* Search Box */}
      <div className="mt-6 flex items-center gap-2 bg-[#1D1D1D] px-4 py-2 rounded-2xl w-[800px] h-[60px]">
        <input
          type="text"
          placeholder="Search by words, author, or genre"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-lg"
        />
        <button
          onClick={handleSearch}
          className="bg-[#9CA3AF] text-black font-bold px-4 py-1 rounded-2xl text-[20px] hover:shadow-md hover:shadow-purple-500/50 transition duration-300 ease-in"
        >
          Search
        </button>
      </div>

      {/* Results */}
      <div className="mt-6 w-[800px]">
        {quotes.length > 0 ? (
          quotes.map((quote) => (
            <div id={`quote-${quote.id}`} key={quote.id} className="mb-4">
              <QuoteCard
                id={quote.id}
                text={quote.quote_text}
                author={quote.quote_author}
                likes_count={quote.likes_count}
                dislikes_count={quote.dislikes_count}
                source={quote.quote_source}
              />
            </div>
          ))
        ) : query.trim() === "" || resultsCount === null ? (
          <p className="text-gray-400 text-center mt-4">Search now</p>
        ) : resultsCount === 0 ? (
          <p className="text-gray-400 text-center mt-4">No results</p>
        ) : <></>
      }
      </div>
    </div>
  );
};

export default Search;