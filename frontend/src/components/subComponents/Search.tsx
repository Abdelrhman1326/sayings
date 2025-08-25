import React, { useState, useEffect } from "react";
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
  const [removedPages, setRemovedPages] = useState<number[]>([]);

  const fetchQuotes = async (pageNumber: number, prepend = false) => {
    if (loading || (!hasMore && !prepend)) return;

    setLoading(true);
    const toastId = toast.info(`Loading quotes... (page ${pageNumber})`, { autoClose: false });

    try {
      const data = await searchQuotes({
        q: query,
        af: "",
        gf: [],
        limit: CHUNK_SIZE,
        page: pageNumber,
      });

      setQuotes(prev => {
        let combined: Quote[];

        if (prepend) {
          // Prepend removed page at the top
          combined = [...data.results, ...prev];
        } else {
          // Append new page at the bottom
          combined = [...prev, ...data.results];
        }

        // Remove oldest 50 at top if > 100 and this is an append
        if (!prepend && combined.length > 100) {
          const removedPageNumber = pageNumber - 2; // oldest page being removed
          setRemovedPages(prevPages => [...prevPages, removedPageNumber]);
          combined = combined.slice(50); // keep last 50
        }

        // Remove last 50 at bottom if > 100 and this is a prepend
        if (prepend && combined.length > 100) {
          combined = combined.slice(0, 100); // keep first 100, drop bottom 50
        }

        return combined;
      });

      // Remove this page from removedPages if it was previously removed
      if (prepend) {
        setRemovedPages(prevPages => prevPages.filter(p => p !== pageNumber));
      }

      // If returned results < CHUNK_SIZE → no more pages
      if (!data.next || data.results.length < CHUNK_SIZE) {
        if (!prepend) setHasMore(false);
      } else {
        if (!prepend) setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  };

  const handleSearch = () => {
    setQuotes([]);
    setPage(1);
    setHasMore(true);
    setRemovedPages([]);
    fetchQuotes(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
    handleKeyDown(e);
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loading) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 200; // 200px from bottom

      // Scroll down → fetch next page
      if (scrollPosition >= threshold && hasMore) {
        fetchQuotes(page);
      }

      // Scroll up → fetch removed pages at top
      if (window.scrollY < 200 && removedPages.length > 0) {
        const firstRemovedPage = removedPages[0];
        fetchQuotes(firstRemovedPage, true); // prepend removed page
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page, hasMore, removedPages]);

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
            <div key={quote.id} className="mb-4">
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
        ) : query.trim() === "" ? (
          <p className="text-gray-400 text-center mt-4">Search now</p>
        ) : (
          <p className="text-gray-400 text-center mt-4">No results</p>
        )}
      </div>
    </div>
  );
};

export default Search;