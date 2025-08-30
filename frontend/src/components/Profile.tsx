import Header from "./Header";
import { CircleUserRound, EditIcon } from "lucide-react";
import { getUsername } from "../apis/getUsername";
import { useState, useLayoutEffect, useEffect } from "react";
import { getColor } from "./ui/ProfileIconColor";
import { getSavedQuotes } from "../apis/getSavedQuotes";
import { toast } from "react-toastify";
import QuoteCard from "./subComponents/QuoteCard";

const Profile = () => {
  const [username, setUsername] = useState<string>("");
  const [barColor, setBarColor] = useState<string>("#D2BCFF");
  const [textColor, setTextColor] = useState("white");
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [name, setName] = useState<string>("...");
  const [favQuote, setFavQuote] = useState<string>(
    "Be a good person, but don’t waste your time trying to prove it."
  );
  const [editIconHovered, setEditIconHovered] = useState<boolean>(false);

  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);

  const handleSetSavedQuotes = async () => {
    try {
      const response = await getSavedQuotes();
      const data = response.data;
      setSavedQuotes(data.results || data);
    } catch (error: any) {
      setSavedQuotes([]);
      toast.error(
        `Error while getting saved quotes: ${
          error?.response?.data?.error || error.message || "Unknown error"
        }`
      );
    }
  };

  const handleUnsaveQuote = (id: number | string) => {
    console.log("Unsave pressed for:", id);

    const newSavedQuotes = savedQuotes.filter(
      (quote) => String(quote.id) !== String(id)
    );

    setSavedQuotes(newSavedQuotes);
  };

  useEffect(() => {
    handleSetSavedQuotes();
  }, []);

  const tabs = ["Published Quotes", "Saved Quotes"];
  const [activeTab, setActiveTab] = useState("Published Quotes");

  useLayoutEffect(() => {
    const fetchUsername = async () => {
      try {
        const cachedUsername = localStorage.getItem("sayings_username");
        if (cachedUsername) {
          setUsername(cachedUsername);
          return;
        }
        const response = await getUsername();

        if (response.error) {
          setUsername("");
          return;
        }

        if (response.username) {
          const cleanedUsername = response.username.trim();
          setUsername(cleanedUsername);
          localStorage.setItem("sayings_username", cleanedUsername);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchUsername();
  }, []);

  return (
    <>
      <div className="overflow-hidden w-screen">
        <Header />
        <div className="flex pl-32 pr-32 mt-12">
          {/* exposure bar */}
          <div
            style={{ backgroundColor: `${barColor}`, color: `${textColor}` }}
            className="flex flex-row items-center p-4 w-full h-40 rounded-full"
          >
            {/* profile picture */}
            <div
              style={{ backgroundColor: `${textColor}` }}
              className="flex items-center justify-center w-32 h-32 rounded-full text-[46px]"
            >
              {username.trim() !== "" ? (
                <p
                  style={{
                    backgroundColor: `${getColor(username[0].toUpperCase())}`,
                  }}
                  className="bg-black w-28 h-28 flex items-center justify-center rounded-full font-ibm font-bold text-[50px]"
                >
                  {username[0].toUpperCase()}
                </p>
              ) : (
                <CircleUserRound size={30} style={{ marginBottom: "2px" }} />
              )}
            </div>
            {/* username */}
            <div className="flex flex-col ml-6 font-ibm font-bold">
              <h1 className="text-[28px]">{username}</h1>
              <h2>{name}</h2>
              <h3>{`${followers} followers`}</h3>
              <h3>{`${following} following`}</h3>
            </div>
            {/* fav quote */}
            <div className="font-ibm font-bold bg-transparent h-[160px] w-[55%] absolute right-32 rounded-full">
              <EditIcon
                className="absolute right-16 top-8 opacity-50 hover:opacity-100 cursor-pointer"
                onMouseEnter={() => {
                  setEditIconHovered(true);
                }}
                onMouseLeave={() => {
                  setEditIconHovered(false);
                }}
              />
              {editIconHovered ? (
                <p className="absolute top-8 right-24 underline">
                  Customize your exposure bar
                </p>
              ) : null}
              <p className="absolute right-16 bottom-10 text-[24px]">
                {`“${favQuote}”`}
              </p>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex flex-row justify-center mt-8 gap-4 text-[26px]">
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
      </div>

      {/* Published Quotes Tab */}
      {activeTab === "Published Quotes" && (
        <div className="p-8 text-white flex justify-center">
          <p className="text-lg opacity-70">No published quotes yet.</p>
        </div>
      )}

      {/* Saved Quotes Tab */}
      {activeTab === "Saved Quotes" && (
        <div className="p-8 text-white flex justify-center">
          {savedQuotes.length === 0 ? (
            <p className="text-lg opacity-70">No saved quotes yet.</p>
          ) : (
            <div className="flex flex-col gap-4 w-[800px] mb-12">
              {savedQuotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  id={quote.id}
                  text={quote.quote_text}
                  author={quote.quote_author}
                  likes_count={quote.likes_count}
                  dislikes_count={quote.dislikes_count}
                  source={quote.quote_source}
                  saved={true}
                  onUnsave={handleUnsaveQuote}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Profile;