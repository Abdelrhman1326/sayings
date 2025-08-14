import { CircleX, Search } from "lucide-react";
import { useState } from "react";
import Logo from "../ui/Logo";
import QuoteCard from "./QuoteCard";

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [authorFilter, setAuthorFilter] = useState("");
    const [genreFilter, setGenreFilter] = useState("");

    const year: number = new Date().getFullYear();

    const quotes = [
        {
            text: "Pain and suffering are always inevitable for a large intelligence and a deep heart. The really great men must, I think, have great sadness on earth.",
            author: "Dostoevsky",
            genre: "Philosophy",
        },
        {
            text: "Code is like humor. When you have to explain it, it's bad.",
            author: "Cory House",
            genre: "Programming",
        },
        {
            text: "The best way to predict the future is to invent it.",
            author: "Alan Kay",
            genre: "Innovation",
        },
        {
            text: "My thoughts are stars I cannot fathom into constellations.",
            author: "John Green",
            genre: "Fiction",
        },
        {
            text: "Some infinities are bigger than other infinities.",
            author: "John Green",
            genre: "Fiction",
        },
        {
            text: "In the debate about the atomic bomb, I carry no weight. My concern has been with the work itself, with the science.",
            author: "J. Robert Oppenheimer",
            genre: "History",
        },
        {
            text: "Now I am become Death, the destroyer of worlds.",
            author: "J. Robert Oppenheimer",
            genre: "History",
        },
        {
            text: "Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world.",
            author: "Albert Einstein",
            genre: "Science",
        },
        {
            text: "Life is like riding a bicycle. To keep your balance, you must keep moving.",
            author: "Albert Einstein",
            genre: "Science",
        },
    ];

    const filteredQuotes = quotes.filter(
        (q) =>
            q.text.toLowerCase().includes(searchQuery.toLowerCase()) &&
            q.author.toLowerCase().includes(authorFilter.toLowerCase()) &&
            q.genre.toLowerCase().includes(genreFilter.toLowerCase())
    );

    return (
        <div className="flex mt-[180px] gap-8">
            {/* LEFT — Quotes */}
            <div className="flex-1 flex flex-col gap-4 ml-32 mb-20 mr-[400px]">
                {filteredQuotes.map((q, idx) => (
                    <QuoteCard
                        key={idx}
                        text={q.text}
                        author={q.author}
                        genre={q.genre}
                    />
                ))}
            </div>

            {/* RIGHT — Search + Filters (fixed position) */}
            <div className="fixed right-20 top-[180px] flex flex-col items-start gap-4 z-10">
                {/* Search */}
                <div className="relative">
                    <input
                        placeholder="Search by quote, author, or genre"
                        style={{
                            width: 380,
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
                        width: 380,
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
                        width: 380,
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

export default SearchBar;