import { useState } from "react";
import Header from "./Header";

import { searchQuotes } from "../apis/searchApi";
import Search from "./subComponents/Search";
import Community from "./subComponents/Community";
import Feed from "./subComponents/Feed";

const Browse = () => {
  const [activeTab, setActiveTab] = useState("Feed");
  const [query, setQuery] = useState("");

  const tabs = ["Feed", "Community", "Search"];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If we wanted global hotkey handling, we could put it here.
  };

  return (
    <div>
      {/* header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* navigation */}
      <div className="flex flex-col text-white w-full items-center mt-[120px] px-2">
        {/* Tabs */}
        <div className="flex flex-row md:gap-6 gap-0 md:text-[26px] sm:text-[22px]">
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
          />
        )}

        {activeTab === "Community" && <Community />}

        {activeTab === "Feed" && <Feed />}
      </div>
    </div>
  );
};

export default Browse;