import { CircleX, Search } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "../ui/Logo";

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [authorFilter, setAuthorFilter] = useState<string>("");
    const [genreFilter, setGenreFilter] = useState<string>("");

    const year: number = new Date().getFullYear();

  return (
    <div className="flex flex-col items-end mt-16 mr-28 gap-4">
      {/* Main Search */}
      <div className="relative">
        <input
          placeholder="Search by quote, author, or genre"
          style={{
            width: 350,
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

        {/* Clear button */}
        <CircleX
          className="text-[#9CA3AF] hover:text-white cursor-pointer absolute right-4 top-1/2 -translate-y-1/2"
          size={20}
          onClick={() => setSearchQuery("")}
        />
        {/* Search icon */}
        <Search
          className="text-[#9CA3AF] cursor-default absolute left-4 top-1/2 -translate-y-1/2"
          size={20}
        />
      </div>

      {/* Author Filter */}
      <input
        placeholder="Filter by author"
        style={{
          width: 350,
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

      {/* Genre Filter */}
      <input
        placeholder="Filter by genres (e.g. genre1, genre2)"
        style={{
          width: 350,
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
        <div className="mr-[60px] mt-1">
            <p className="text-white flex items-center">
                <span className="mb-1 mr-2">
                    <Logo />
                </span> 
                Corporation © {year}
            </p>
        </div>
    </div>
  );
};

export default SearchBar;
