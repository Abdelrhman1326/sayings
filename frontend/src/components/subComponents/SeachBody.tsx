import { CircleX, Search } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "../ui/Logo";
import QuoteCard from "./QuoteCard";
import useDebounce from "../../hooks/useDebounce";
import { searchQuotes } from "../../apis/searchApi";

const SearchBody = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [authorFilter, setAuthorFilter] = useState("");
    const [genreFilter, setGenreFilter] = useState("");

    // Debounced inputs
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const debouncedAuthorFilter = useDebounce(authorFilter, 500);
    const debouncedGenreFilter = useDebounce(genreFilter, 500);
    const [fetchedQuotes, setFetchedQuotes] = useState([]);

    useEffect(() => {
        const fetchQuotes = async () => {
            if (debouncedSearchQuery || debouncedAuthorFilter || debouncedGenreFilter) {
                try {
                    const genresList = debouncedGenreFilter.split(",").map((genre) => genre.trim()).filter(Boolean);
                    const data = await searchQuotes({
                        q: debouncedSearchQuery,
                        af: debouncedAuthorFilter,
                        gf: genresList,
                    });
                    setFetchedQuotes(data.results);
                } catch (error) {
                    console.error("Error fetching quotes:", error);
                    setFetchedQuotes([]); // Clear quotes on error
                }
            } else {
                setFetchedQuotes([]); // Clear quotes if no search query
            }
        };
        fetchQuotes();
    }, [debouncedSearchQuery, debouncedAuthorFilter, debouncedGenreFilter]);

    const year: number = new Date().getFullYear();

    return (
        <div className="flex mt-[180px] gap-8">
            {/* LEFT — Quotes */}
            <div className="flex-1 flex flex-col gap-4 ml-32 mb-20 mr-[400px]">
                {fetchedQuotes.map((q, idx) => (
                    <QuoteCard
                        key={idx}
                        id={q.id}
                        text={q.quote_text}
                        author={q.quote_author}
                        genre={q.genre}
                        likes_count={q.likes_count}
                        dislikes_count={q.dislikes_count}
                    />
                ))}
            </div>

            {/* RIGHT — Search + Filters */}
            <div className="fixed right-[120px] top-[180px] flex flex-col items-start gap-4 z-10">
                {/* Search */}
                <div className="relative">
                    <input
                        placeholder="Search by quote, author, or genre"
                        style={{
                            width: 400,
                            height: 45,
                            backgroundColor: "#18181B",
                            color: "white",
                            padding: "10px",
                            paddingLeft: "40px",
                            border: "3px solid #27272A",
                            borderRadius: "15px",
                        }}
                        className="focus-visible:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <CircleX
                        className="text-[#9CA3AF] hover:text-white cursor-pointer absolute right-4 top-1/2 -translate-y-1/2"
                        size={20}
                        onClick={() => setSearchQuery("")}
                    />
                    <Search
                        className="text-[#9CA3AF] cursor-default absolute left-4 top-1/2 -translate-y-1/2"
                        size={20}
                    />
                </div>

                {/* Author filter */}
                <input
                    placeholder="Filter by author"
                    style={{
                        width: 400,
                        height: 40,
                        backgroundColor: "#18181B",
                        color: "white",
                        padding: "8px",
                        paddingLeft: "15px",
                        border: "2px solid #27272A",
                        borderRadius: "10px",
                    }}
                    className="focus-visible:outline-none"
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                />

                {/* Genre filter */}
                <input
                    placeholder="Filter by genres (e.g. genre1, genre2)"
                    style={{
                        width: 400,
                        height: 40,
                        backgroundColor: "#18181B",
                        color: "white",
                        padding: "8px",
                        paddingLeft: "15px",
                        border: "2px solid #27272A",
                        borderRadius: "10px",
                    }}
                    className="focus-visible:outline-none"
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                />

                {/* Footer */}
                <div className="flex flex-col ml-[75px]">
                    <p className="text-white flex items-center mt-2">
                        <span className="mb-1 mr-2">
                            <Logo />
                        </span>
                        Corporation © {year}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SearchBody;