import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { CircleUserRound } from "lucide-react";
import { getUsername } from "../../apis/getUsername";
import { getColor } from "../ui/ProfileIconColor";
import { publish } from "../../apis/publishQuote";
import { toast } from "react-toastify";
import QuoteCard from "./QuoteCard";
import { getCommunityQuotes } from "../../apis/getCommunityQuotes";

interface Quote {
  id: number;
  quote_text: string;
  quote_genre: string | null;
  quote_author?: string;
  isDraft?: boolean;
}

const CHUNK_SIZE = 20;
const MAX_QUOTES = 100;

const Community: React.FC = () => {
  const [username, setUsername] = useState("");
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Fetch username
  useLayoutEffect(() => {
    const fetchUsername = async () => {
      try {
        const cachedUsername = localStorage.getItem("sayings_username");
        if (cachedUsername) {
          setUsername(cachedUsername);
          return;
        }
        const response = await getUsername();
        if (response.username) {
          const cleanedUsername = response.username.trim();
          localStorage.setItem("sayings_username", cleanedUsername);
          setUsername(cleanedUsername);
        }
      } catch (err) {
        console.error("Error fetching username:", err);
      }
    };
    fetchUsername();
  }, []);

  const fetchQuotes = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await getCommunityQuotes({ limit: CHUNK_SIZE, page });
      if (!data || !Array.isArray(data.results)) {
        toast.error("Failed to fetch quotes: invalid response");
        return;
      }

      if (data.results.length === 0) {
        setHasMore(false);
        return;
      }

      setQuotes((prev) => {
        const newQuotes = [...prev, ...data.results];
        // Keep only the latest MAX_QUOTES
        return newQuotes.slice(-MAX_QUOTES);
      });

      setPage(data.next_page || page + 1);
    } catch (err: any) {
      toast.error("Failed to fetch quotes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (loading) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 200;
      if (scrollPosition >= threshold && hasMore) fetchQuotes();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
      <div className="flex flex-col items-center w-full px-4 py-6">
        {[{ id: 0, quote_text: text, quote_genre: null, isDraft: true }, ...quotes].map(
            (quote, index) => (
                <div key={quote.id || index} className="mb-4 w-full max-w-[800px]">
                  {quote.isDraft ? (
                      <div className="flex flex-col gap-2 bg-[#1D1D1D] px-4 py-4 rounded-2xl w-full">
                        {/* Username row */}
                        <div className="flex flex-row gap-2 items-center mb-2 opacity-90">
                          {username ? (
                              <div
                                  style={{ backgroundColor: getColor(username[0].toUpperCase()) }}
                                  className="flex w-8 h-8 text-center text-white font-imb justify-center items-center rounded-full"
                              >
                                <p>{username[0].toUpperCase()}</p>
                              </div>
                          ) : (
                              <CircleUserRound size={30} style={{ marginBottom: "2px" }} />
                          )}
                          <p className="font-ibm text-md text-white text-[17px]">{username}</p>
                        </div>

                        {/* Post input */}
                        <input
                            type="text"
                            placeholder="Impress the world with your words"
                            className="flex bg-transparent outline-none text-white placeholder-gray-400 text-lg border-gray-700 pb-[4px] pl-2"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        {/* Publish button */}
                        <button
                            type="button"
                            onClick={async () => {
                              if (!text.trim()) {
                                toast.error("Quote text cannot be empty");
                                return;
                              }
                              setLoading(true);
                              const loadingToast = toast.loading("Publishing quote");
                              try {
                                const response = await publish({ genre: "", text: text.trim() });
                                setText("");
                                toast.update(loadingToast, {
                                  render: "Quote published",
                                  type: "success",
                                  isLoading: false,
                                  autoClose: 3000,
                                });
                                setQuotes((prev) => {
                                  const newQuotes = [response, ...prev];
                                  return newQuotes.slice(0, MAX_QUOTES);
                                });
                              } catch (error: any) {
                                toast.update(loadingToast, {
                                  render: error?.message || "Error while publishing quote",
                                  type: "error",
                                  isLoading: false,
                                  autoClose: 3000,
                                });
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="mt-1 bg-[#9CA3AF] text-black outline-none font-bold px-4 py-2 rounded-2xl text-[20px] hover:shadow-md hover:shadow-purple-500/50 transition duration-300 ease-in"
                        >
                          Publish
                        </button>
                      </div>
                  ) : (
                      <QuoteCard
                          id={quote.id}
                          text={quote.quote_text}
                          author={quote.quote_author}
                          likes_count={null}
                          dislikes_count={null}
                          source={""}
                      />
                  )}
                </div>
            )
        )}
        {quotes.length === 0 && !loading && (
            <p className="flex text-lg opacity-70 justify-center text-center mt-4">
              No quotes yet
            </p>
        )}
      </div>
  );
};

export default Community;
