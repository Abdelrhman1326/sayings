import React from "react";
import QuoteCard from "./QuoteCard";

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
  handleSearchQueries: () => void;
  quotes: Quote[];
}

const Search: React.FC<SearchProps> = ({
  query,
  setQuery,
  handleKeyDown,
  handleSearchQueries,
  quotes,
}) => {
  return (
    <div className="flex flex-col">
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
            {query.trim() !== "" ? "" : <p className="text-gray-400 text-center">Search now</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;