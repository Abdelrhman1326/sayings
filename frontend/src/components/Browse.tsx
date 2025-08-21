import { useState } from "react";
import Header from "./Header";

import { searchQuotes } from "../apis/searchApi";
import QuoteCard from "./subComponents/QuoteCard";

interface Quote {
  id: number;
  quote_text: string;
  quote_author: string;
  likes_count: number | null;
  dislikes_count: number | null;
  quote_source: string;
}

const Feed = () => {
  const [activeTab, setActiveTab] = useState("Feed");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [query, setQuery] = useState("");

  const tabs = ["Feed", "Community", "Search"];

  const handleSearchQueries = async () => {
    if (!query.trim()) return; // prevent empty searches
    try {
      const response = await searchQuotes({ q: query, af: "", gf: [] });
      setQuotes(response.results || []); // ✅ grab results array
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchQueries();
    }
  };

  return (
    <div>
      {/* header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>
      {/* navigation */}
      <div className="flex flex-col text-white w-full items-center mt-[120px]">
        {/* Tabs */}
        <div className="flex flex-row gap-4 text-[26px]">
          {tabs.map((tab) => (
            <p
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1 px-5 rounded-full font-ibm font-bold cursor-pointer transition-colors duration-300 
                ${
                  activeTab === tab
                    ? "bg-uiPrimary text-black"
                    : "bg-transparent text-white"
                }`}
            >
              {tab}
            </p>
          ))}
        </div>

        {/* Show search bar only if active tab is Search */}
        {activeTab === "Search" && (
          <>
            <div className="mt-6 flex items-center gap-2 bg-[#1D1D1D] px-4 py-2 rounded-2xl w-[800px] h-[60px]">
              <input
                type="text"
                placeholder="Search by words, author, or genre"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-lg"
              />
              <button
                onClick={handleSearchQueries}
                className="bg-[#9CA3AF] text-black font-bold px-4 py-1 rounded-2xl text-[20px]"
              >
                Search
              </button>
            </div>

            {/* Results */}
            <div className="mt-6 flex flex-col gap-4 w-[800px] mb-12">
              {quotes.length > 0 ? (
                quotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    id={quote.id}
                    text={quote.quote_text}
                    author={quote.quote_author}
                    likes_count={quote.likes_count}
                    dislikes_count={quote.dislikes_count}
                    source={quote.quote_source}
                  />
                ))
              ) : (
                <div>
                  {query.trim() !== "" ? ""
                  : <p className="text-gray-400 text-center">Search now</p>}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Feed;