import { useState } from "react";
import Header from "./Header";

import { searchQuotes } from "../apis/searchApi";
import Search from "./subComponents/Search";
import Community from "./subComponents/Community";
import Feed from "./subComponents/Feed";

interface Quote {
  id: number;
  quote_text: string;
  quote_author: string;
  likes_count: number | null;
  dislikes_count: number | null;
  quote_source: string;
}

const Browse = () => {
  const [activeTab, setActiveTab] = useState("Feed");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [query, setQuery] = useState("");

  const tabs = ["Feed", "Community", "Search"];

  const handleSearchQueries = async () => {
    if (!query.trim()) return; // prevent empty searches
    try {
      const response = await searchQuotes({ q: query, af: "", gf: [] });
      setQuotes(response.results || []); // grab results array
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

        {/* Content */}
        {activeTab === "Search" && (
          <Search
            query={query}
            setQuery={setQuery}
            handleKeyDown={handleKeyDown}
            handleSearchQueries={handleSearchQueries}
            quotes={quotes}
          />
        )}

        {activeTab === "Community" && <Community />}

        {activeTab === "Feed" && <Feed />}
      </div>
    </div>
  );
};

export default Browse;
