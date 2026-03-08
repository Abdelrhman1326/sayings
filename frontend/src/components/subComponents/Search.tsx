import React, { useState, useEffect, useRef, useCallback } from "react";
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
    saved_by_user: boolean;
}

interface SearchProps {
    query: string;
    setQuery: (value: string) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const CHUNK_SIZE = 50;
const MAX_QUOTES = 150;

const Search: React.FC<SearchProps> = ({ query, setQuery, handleKeyDown }) => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [resultsCount, setResultsCount] = useState<number | null>(null);
    const [loadingCount, setLoadingCount] = useState(0);
    const [hasMoreDown, setHasMoreDown] = useState(true);
    const [hasMoreUp, setHasMoreUp] = useState(true);

    const pagesRef = useRef<Map<number, Quote[]>>(new Map());
    const pageOrderRef = useRef<number[]>([]);
    const removedTopPages = useRef<number[]>([]);
    const removedBottomPages = useRef<number[]>([]);
    const fetchingPages = useRef<Set<number>>(new Set());
    const anchorRef = useRef<{ id: number | null; top: number }>({ id: null, top: 0 });

    const startPage = pageOrderRef.current[0] ?? null;
    const endPage = pageOrderRef.current[pageOrderRef.current.length - 1] ?? null;

    const rebuildQuotes = useCallback((direction?: "up" | "down") => {
        const ordered = pageOrderRef.current.slice().sort((a, b) => a - b);
        let all: Quote[] = [];
        for (const p of ordered) {
            const arr = pagesRef.current.get(p);
            if (arr && arr.length) all = all.concat(arr);
        }

        while (all.length > MAX_QUOTES) {
            if (direction === "up") {
                const bottomPage = ordered.pop();
                if (!bottomPage) break;
                removedBottomPages.current.push(bottomPage);
                const removed = pagesRef.current.get(bottomPage) ?? [];
                all = all.slice(0, all.length - removed.length);
                pagesRef.current.delete(bottomPage);
            } else {
                const topPage = ordered.shift();
                if (!topPage) break;
                removedTopPages.current.push(topPage);
                const removed = pagesRef.current.get(topPage) ?? [];
                all = all.slice(removed.length);
                pagesRef.current.delete(topPage);
            }
        }

        pageOrderRef.current = ordered;
        setQuotes(all);

        if (direction === "up") {
            setTimeout(() => {
                const estimatedHeight = CHUNK_SIZE * 150; // Increased estimate for card height
                window.scrollBy(0, estimatedHeight);
            }, 0);
        }
    }, []);

    const fetchPage = useCallback(
        async (pageNumber: number, direction: "up" | "down") => {
            if (fetchingPages.current.has(pageNumber)) return;

            if (pagesRef.current.has(pageNumber)) {
                if (direction === "up" && removedTopPages.current.includes(pageNumber)) {
                    removedTopPages.current = removedTopPages.current.filter(p => p !== pageNumber);
                    pageOrderRef.current.unshift(pageNumber);
                    rebuildQuotes("up");
                } else if (direction === "down" && removedBottomPages.current.includes(pageNumber)) {
                    removedBottomPages.current = removedBottomPages.current.filter(p => p !== pageNumber);
                    pageOrderRef.current.push(pageNumber);
                    rebuildQuotes("down");
                }
                return;
            }

            fetchingPages.current.add(pageNumber);
            setLoadingCount(c => c + 1);

            try {
                const data = await searchQuotes({
                    q: query,
                    af: "",
                    gf: [],
                    limit: CHUNK_SIZE,
                    page: pageNumber,
                });

                if (!data.results || data.results.length === 0) {
                    if (direction === "down") setHasMoreDown(false);
                    if (direction === "up") setHasMoreUp(false);
                    return;
                }

                pagesRef.current.set(pageNumber, data.results);
                if (direction === "up") pageOrderRef.current.unshift(pageNumber);
                else pageOrderRef.current.push(pageNumber);

                rebuildQuotes(direction);
                if (data.total_count !== undefined) setResultsCount(data.total_count);

            } catch (err) {
                console.error(err);
            } finally {
                fetchingPages.current.delete(pageNumber);
                setLoadingCount(c => Math.max(0, c - 1));
            }
        },
        [query, rebuildQuotes]
    );

    const handleSearch = () => {
        pagesRef.current.clear();
        pageOrderRef.current = [];
        removedTopPages.current = [];
        removedBottomPages.current = [];
        fetchingPages.current.clear();
        anchorRef.current = { id: null, top: 0 };

        setQuotes([]);
        setResultsCount(null);
        setHasMoreDown(true);
        setHasMoreUp(true);

        fetchPage(1, "down");
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
        handleKeyDown(e);
    };

    useEffect(() => {
        const tickingRef = { current: false };

        const onScroll = () => {
            if (tickingRef.current) return;
            tickingRef.current = true;

            requestAnimationFrame(() => {
                const scrollPosition = window.innerHeight + window.scrollY;
                const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
                const nearBottom = scrollPosition >= scrollHeight - 300;
                const nearTop = window.scrollY < 300;

                if (nearBottom && hasMoreDown) {
                    const next = endPage !== null ? endPage + 1 : 1;
                    fetchPage(next, "down");
                }

                if (nearTop && hasMoreUp) {
                    const prev = startPage !== null ? startPage - 1 : null;
                    if (prev && prev >= 1) {
                        fetchPage(prev, "up");
                    }
                }

                tickingRef.current = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [fetchPage, hasMoreDown, hasMoreUp, startPage, endPage]);

    return (
        <div className="flex flex-col items-center w-full px-2 md:px-0">
            {/* Search Input Container - Responsive Width */}
            <div className="mt-6 flex items-center gap-2 bg-[#1D1D1D] pr-2 pl-4 py-2 rounded-2xl w-full max-w-3xl h-[60px] shadow-md border border-white/5">
                <input
                    type="text"
                    placeholder="Search by words, author, or genre"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base md:text-lg min-w-0"
                />
                <button
                    onClick={handleSearch}
                    className="bg-[#9CA3AF] text-black font-bold px-4 py-1.5 rounded-xl text-sm md:text-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 ease-in whitespace-nowrap active:scale-95"
                >
                    Search
                </button>
            </div>

            {/* Results Container - Responsive Width */}
            <div className="mt-6 w-full max-w-3xl">
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
                                saved={quote.saved_by_user}
                            />
                        </div>
                    ))
                ) : (
                    <div className="mt-20 text-center">
                        {query.trim() === "" || resultsCount === null ? (
                            <p className="text-lg text-white/50">Search for your favorite quotes</p>
                        ) : resultsCount === 0 ? (
                            <p className="text-lg text-white/50">No quotes found for "{query}"</p>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Loading Indicator */}
            {loadingCount > 0 && (
                <div className="py-8 w-full flex justify-center">
                    <div className="animate-pulse text-white/40 font-medium">
                        Fetching more quotes...
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;