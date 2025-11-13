import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
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

    // Rebuild quotes with anchor preservation
    const rebuildQuotes = useCallback((direction?: "up" | "down") => {
        const ordered = pageOrderRef.current.slice().sort((a, b) => a - b);
        let all: Quote[] = [];
        for (const p of ordered) {
            const arr = pagesRef.current.get(p);
            if (arr && arr.length) all = all.concat(arr);
        }

        // Preserve scroll anchor if prepending
        let anchorDelta = 0;
        if (direction === "up" && anchorRef.current.id !== null) {
            const el = document.getElementById(`quote-${anchorRef.current.id}`);
            if (el) {
                anchorDelta = el.getBoundingClientRect().top - anchorRef.current.top;
            }
        }

        // Maintain MAX_QUOTES sliding window
        while (all.length > MAX_QUOTES) {
            if (direction === "up") {
                // Remove from bottom
                const bottomPage = ordered[ordered.length - 1];
                removedBottomPages.current.push(bottomPage);
                const removed = pagesRef.current.get(bottomPage) ?? [];
                all = all.slice(0, all.length - removed.length);
                ordered.pop();
            } else {
                // Remove from top
                const topPage = ordered[0];
                removedTopPages.current.push(topPage);
                const removed = pagesRef.current.get(topPage) ?? [];
                all = all.slice(removed.length);
                ordered.shift();
            }
        }

        pageOrderRef.current = ordered;
        setQuotes(all);

        // Restore scroll position if prepending
        if (direction === "up" && anchorDelta !== 0) {
            window.scrollBy(0, anchorDelta);
            anchorRef.current = { id: null, top: 0 };
        }
    }, []);

    const fetchPage = useCallback(
        async (pageNumber: number, direction: "up" | "down") => {
            if (fetchingPages.current.has(pageNumber)) return;

            // Restore removed page if it exists
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
                // Anchor before prepending
                if (direction === "up" && quotes.length > 0) {
                    const prevFirstId = quotes[0]?.id;
                    const el = document.getElementById(`quote-${prevFirstId}`);
                    anchorRef.current = {
                        id: prevFirstId ?? null,
                        top: el ? el.getBoundingClientRect().top : 0,
                    };
                }

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
            } catch (err) {
                console.error(err);
            } finally {
                fetchingPages.current.delete(pageNumber);
                setLoadingCount(c => Math.max(0, c - 1));
            }
        },
        [query, quotes.length, rebuildQuotes]
    );

    const handleSearch = () => {
        pagesRef.current.clear();
        pageOrderRef.current = [];
        removedTopPages.current = [];
        removedBottomPages.current = [];
        fetchingPages.current.clear();
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
        const onScroll = () => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const threshold = document.body.offsetHeight - 200;

            // Scroll down
            if (scrollPosition >= threshold && hasMoreDown) {
                const next = endPage !== null ? endPage + 1 : 1;
                fetchPage(next, "down");

                if (quotes.length + CHUNK_SIZE > MAX_QUOTES && startPage !== null) {
                    const topPage = pageOrderRef.current[0];
                    removedTopPages.current.push(topPage);
                    pageOrderRef.current.shift();
                    rebuildQuotes();
                }
            }

            // Scroll up
            if (window.scrollY < 200 && hasMoreUp) {
                const prev = startPage !== null ? startPage - 1 : null;
                if (prev && prev >= 1) {
                    fetchPage(prev, "up");

                    if (quotes.length + CHUNK_SIZE > MAX_QUOTES && endPage !== null) {
                        const bottomPage = pageOrderRef.current[pageOrderRef.current.length - 1];
                        removedBottomPages.current.push(bottomPage);
                        pageOrderRef.current.pop();
                        rebuildQuotes("up");
                    }
                }
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [fetchPage, hasMoreDown, hasMoreUp, quotes.length, startPage, endPage, rebuildQuotes]);

    return (
        <div className="flex flex-col items-center">
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
