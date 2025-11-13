import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import QuoteCard from "./QuoteCard";
import { searchQuotes } from "../../apis/searchApi";

interface Quote {
    id: number;
    quote_text: string;
    quote_author: string;
    likes_count: number | null;
    dislikes_count: number | null;
    quote_source: string;
    liked_by_user: boolean;
    disliked_by_user: boolean;
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

    // Reset count when query changes
    useLayoutEffect(() => {
        setResultsCount(null);
    }, [query]);

    const anchorRef = useRef<{ id: number | null; top: number }>({ id: null, top: 0 });

    const fetchQuotes = async (pageNumber: number, prepend = false) => {
        if (loading || (!hasMore && !prepend)) return;
        if (prepend && latestRemovedPage == 0) return;

        setLoading(true);
        console.log(`Loading quotes... (page ${pageNumber})`);

        try {
            // Capture viewport anchor for smooth scroll when prepending
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

            // Remove all references to data.count since backend no longer returns it
            // We'll just check if we got any results
            if (!data.results || data.results.length === 0) {
                setResultsCount(0);
            } else {
                setResultsCount((prev) => (prev === null ? data.results.length : prev + data.results.length));
            }

            setQuotes((prev) => {
                let combined: Quote[];

                if (prepend) {
                    combined = [...data.results, ...prev];
                } else {
                    combined = [...prev, ...data.results];
                }

                // Trim old results
                if (!prepend && combined.length > 100) {
                    setLatestRemovedPage(pageNumber - 2);
                    combined = combined.slice(50);
                }

                if (prepend && combined.length > 100) {
                    combined = combined.slice(0, 100);
                    setPage((prevPage) => prevPage - 1);
                }

                return combined;
            });

            if (prepend && latestRemovedPage !== null) {
                setLatestRemovedPage(latestRemovedPage - 1);
            }

            if (!data.next_page || data.results.length < CHUNK_SIZE) {
                if (!prepend) setHasMore(false);
            } else if (!prepend) {
                setPage(data.next_page);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Smooth scroll restore after prepend
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

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (loading) return;

            const scrollPosition = window.innerHeight + window.scrollY;
            const threshold = document.body.offsetHeight - 200;

            // Scroll down → fetch next page
            if (scrollPosition >= threshold && hasMore) {
                fetchQuotes(page);
            }

            // Scroll up → fetch previous (restore trimmed)
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
                                liked_by_user={quote.liked_by_user}
                                disliked_by_user={quote.disliked_by_user}
                            />
                        </div>
                    ))
                ) : query.trim() === "" || resultsCount === null ? (
                    <p className="flex text-lg opacity-70 justify-center">Search now</p>
                ) : resultsCount === 0 ? (
                    <p className="flex text-lg opacity-70 justify-center">No results</p>
                ) : null}
            </div>
        </div>
    );
};

export default Search;
