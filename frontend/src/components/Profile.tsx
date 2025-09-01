import Header from "./Header";
import { CircleUserRound, EditIcon } from "lucide-react";
import { getUsername } from "../apis/getUsername";
import { useState, useLayoutEffect, useEffect, useRef, useCallback } from "react";
import { getColor } from "./ui/ProfileIconColor";
import { getSavedQuotes } from "../apis/getSavedQuotes";
import { getPublishedQuotes } from "../apis/listPublishedQuotes";
import { toast } from "react-toastify";
import QuoteCard from "./subComponents/QuoteCard";

const CHUNK_SIZE = 50;

type Quote = {
  id?: number;
  quote_text?: string;
  quote_author?: string;
  likes_count?: number | null;
  dislikes_count?: number | null;
  quote_source?: string | null;
};

const Profile = () => {
  const [username, setUsername] = useState<string>("");
  const [barColor, setBarColor] = useState<string>("#D2BCFF");
  const [textColor, setTextColor] = useState("black");
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [name, setName] = useState<string>("...");
  const [favQuote, setFavQuote] = useState<string>(
    "Be a good person, but don't waste your time trying to prove it."
  );
  const [editIconHovered, setEditIconHovered] = useState<boolean>(false);

  // ---------------- Published Quotes State ----------------
  const [publishedQuotes, setPublishedQuotes] = useState<Quote[]>([]);
  const [publishedHasMore, setPublishedHasMore] = useState(true);
  const [publishedLatestRemoved, setPublishedLatestRemoved] = useState<number | null>(null);
  const [publishedPage, _setPublishedPage] = useState(1);
  const publishedPageRef = useRef(1);
  const publishedAnchorRef = useRef<{ id: number | null; top: number }>({ id: null, top: 0 });

  // ---------------- Saved Quotes State ----------------
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [savedHasMore, setSavedHasMore] = useState(true);
  const [savedLatestRemoved, setSavedLatestRemoved] = useState<number | null>(null);
  const [savedPage, _setSavedPage] = useState(1);
  const savedPageRef = useRef(1);
  const savedAnchorRef = useRef<{ id: number | null; top: number }>({ id: null, top: 0 });

  // ---------------- Loading / in-flight guards ----------------
  const [publishedLoading, setPublishedLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const publishedLoadingRef = useRef(false);
  const savedLoadingRef = useRef(false);
  const inFlightRef = useRef(new Set<string>());

  // ---------------- StrictMode double-mount guard ----------------
  const didInitRef = useRef<{ published: boolean; saved: boolean }>({
    published: false,
    saved: false,
  });

  // ---------------- Tabs ----------------
  const tabs = ["Published Quotes", "Saved Quotes"];
  const [activeTab, setActiveTab] = useState("Published Quotes");

  // keep state + refs in sync
  const setPublishedPage = (updater: number | ((p: number) => number)) => {
    if (typeof updater === "function") {
      _setPublishedPage((prev) => {
        const next = (updater as (p: number) => number)(prev);
        publishedPageRef.current = next;
        return next;
      });
    } else {
      _setPublishedPage(updater);
      publishedPageRef.current = updater;
    }
  };
  const setSavedPage = (updater: number | ((p: number) => number)) => {
    if (typeof updater === "function") {
      _setSavedPage((prev) => {
        const next = (updater as (p: number) => number)(prev);
        savedPageRef.current = next;
        return next;
      });
    } else {
      _setSavedPage(updater);
      savedPageRef.current = updater;
    }
  };

  // ---------------- Helpers ----------------
  const normalizeResponse = (resp: any): Quote[] => {
    const d = resp?.data ?? resp;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.results)) return d.results;
    return [];
  };
  const makeInFlightKey = (list: "published" | "saved", page: number, prepend: boolean) =>
    `${list}:${page}:${prepend ? 1 : 0}`;

  // ---------------- Fetch Published Quotes ----------------
  const fetchPublishedQuotes = useCallback(
    async (page: number, prepend = false) => {
      if (page < 1) return; // hard guard

      const key = makeInFlightKey("published", page, prepend);
      if (inFlightRef.current.has(key)) return;
      if (publishedLoadingRef.current && !prepend) return;
      if (!publishedHasMore && !prepend) return;

      inFlightRef.current.add(key);
      publishedLoadingRef.current = true;
      setPublishedLoading(true);

      // Start loading toast
      const toastId = toast.loading("Loading quotes...", { autoClose: false });

      try {
        // Capture anchor position for both prepend and append operations
        if (prepend && publishedQuotes.length > 0) {
          const prevFirstId = publishedQuotes[0]?.id ?? null;
          const el = prevFirstId !== null ? document.getElementById(`published-${prevFirstId}`) : null;
          publishedAnchorRef.current = {
            id: prevFirstId ?? null,
            top: el ? el.getBoundingClientRect().top : 0,
          };
        } else if (!prepend && publishedQuotes.length > 0) {
          // For append, capture the last visible item to maintain scroll position
          const lastId = publishedQuotes[publishedQuotes.length - 1]?.id ?? null;
          const el = lastId !== null ? document.getElementById(`published-${lastId}`) : null;
          publishedAnchorRef.current = {
            id: lastId ?? null,
            top: el ? el.getBoundingClientRect().top : 0,
          };
        } else {
          publishedAnchorRef.current = { id: null, top: 0 };
        }

        const response = await getPublishedQuotes(page, CHUNK_SIZE);
        const data = normalizeResponse(response);

        // Wait 2 seconds for fake loading
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (!data || data.length === 0) {
          if (!prepend) setPublishedHasMore(false);
          return;
        }

        setPublishedQuotes((prev) => {
          let updated = prepend ? [...data, ...prev] : [...prev, ...data];

          if (!prepend && updated.length > 2 * CHUNK_SIZE) {
            setPublishedLatestRemoved(page - 2);
            updated = updated.slice(CHUNK_SIZE); // drop from top
          }

          if (prepend && updated.length > 100) {
            updated = updated.slice(0, 100); // keep first 100, drop from bottom
            // When we drop quotes from bottom, decrement page counter and reset hasMore
            setPublishedPage((p) => Math.max(1, p - 1));
            setPublishedHasMore(true);
          }

          return updated;
        });

        if (!prepend) {
          if (data.length < CHUNK_SIZE) setPublishedHasMore(false);
          else setPublishedPage((p) => p + 1);
        } else {
          // We restored the removed page; don't decrement below 1
          setPublishedLatestRemoved((p) => (p && p > 1 ? p - 1 : null));
        }
      } catch (error: any) {
        console.error("fetchPublishedQuotes error:", error);
        toast.error(
          `Error while fetching published quotes: ${
            error?.response?.data?.error || error.message || "Unknown error"
          }`
        );
      } finally {
        inFlightRef.current.delete(key);
        publishedLoadingRef.current = false;
        setPublishedLoading(false);
        toast.dismiss(toastId);
      }
    },
    [publishedHasMore, publishedQuotes]
  );

  // ---------------- Fetch Saved Quotes ----------------
  const fetchSavedQuotes = useCallback(
    async (page: number, prepend = false) => {
      if (page < 1) return; // hard guard

      const key = makeInFlightKey("saved", page, prepend);
      if (inFlightRef.current.has(key)) return;
      if (savedLoadingRef.current && !prepend) return;
      if (!savedHasMore && !prepend) return;

      inFlightRef.current.add(key);
      savedLoadingRef.current = true;
      setSavedLoading(true);

      // Start loading toast
      const toastId = toast.loading("Loading quotes...", { autoClose: false });

      try {
        // Capture anchor position for both prepend and append operations
        if (prepend && savedQuotes.length > 0) {
          const prevFirstId = savedQuotes[0]?.id ?? null;
          const el = prevFirstId !== null ? document.getElementById(`saved-${prevFirstId}`) : null;
          savedAnchorRef.current = {
            id: prevFirstId ?? null,
            top: el ? el.getBoundingClientRect().top : 0,
          };
        } else if (!prepend && savedQuotes.length > 0) {
          // For append, capture the last visible item to maintain scroll position
          const lastId = savedQuotes[savedQuotes.length - 1]?.id ?? null;
          const el = lastId !== null ? document.getElementById(`saved-${lastId}`) : null;
          savedAnchorRef.current = {
            id: lastId ?? null,
            top: el ? el.getBoundingClientRect().top : 0,
          };
        } else {
          savedAnchorRef.current = { id: null, top: 0 };
        }

        const response = await getSavedQuotes(page, CHUNK_SIZE);
        const data = normalizeResponse(response);

        // Wait 2 seconds for fake loading
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (!data || data.length === 0) {
          if (!prepend) setSavedHasMore(false);
          return;
        }

        setSavedQuotes((prev) => {
          let updated = prepend ? [...data, ...prev] : [...prev, ...data];

          if (!prepend && updated.length > 2 * CHUNK_SIZE) {
            // too many from scrolling down → drop from the top
            setSavedLatestRemoved(page - 2);
            updated = updated.slice(CHUNK_SIZE);
          }

          if (prepend && updated.length > 100) {
            updated = updated.slice(0, 100); // keep first 100, drop from bottom
            // When we drop quotes from bottom, decrement page counter and reset hasMore
            setSavedPage((p) => Math.max(1, p - 1));
            setSavedHasMore(true);
          }

          return updated;
        });

        if (!prepend) {
          if (data.length < CHUNK_SIZE) setSavedHasMore(false);
          else setSavedPage((p) => p + 1);
        } else {
          // We restored the removed page; don't keep counting down to 0
          setSavedLatestRemoved((p) => (p && p > 1 ? p - 1 : null));
        }
      } catch (error: any) {
        console.error("fetchSavedQuotes error:", error);
        toast.error(
          `Error while fetching saved quotes: ${
            error?.response?.data?.error || error.message || "Unknown error"
          }`
        );
      } finally {
        inFlightRef.current.delete(key);
        savedLoadingRef.current = false;
        setSavedLoading(false);
        toast.dismiss(toastId);
      }
    },
    [savedHasMore, savedQuotes]
  );

  // ---------------- Restore scroll after insert/prepend ----------------
  useLayoutEffect(() => {
    const { id, top } = publishedAnchorRef.current;
    if (id !== null) {
      const el = document.getElementById(`published-${id}`);
      if (el) {
        const newTop = el.getBoundingClientRect().top;
        const delta = newTop - top;
        if (delta !== 0) window.scrollBy(0, delta);
      }
      publishedAnchorRef.current = { id: null, top: 0 };
    }
  }, [publishedQuotes]);

  useLayoutEffect(() => {
    const { id, top } = savedAnchorRef.current;
    if (id !== null) {
      const el = document.getElementById(`saved-${id}`);
      if (el) {
        const newTop = el.getBoundingClientRect().top;
        const delta = newTop - top;
        if (delta !== 0) window.scrollBy(0, delta);
      }
      savedAnchorRef.current = { id: null, top: 0 };
    }
  }, [savedQuotes]);

  // ---------------- Scroll Handler (throttled with rAF) ----------------
  useEffect(() => {
    const tickingRef = { current: false };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const nearBottom =
          window.scrollY + window.innerHeight >= document.body.offsetHeight - 200;
        const nearTop = window.scrollY < 200;

        if (activeTab === "Published Quotes") {
          if (nearBottom && publishedHasMore) {
            fetchPublishedQuotes(publishedPageRef.current);
          }
          if (
            nearTop &&
            publishedLatestRemoved !== null &&
            publishedLatestRemoved >= 1 &&
            !publishedLoadingRef.current
          ) {
            fetchPublishedQuotes(publishedLatestRemoved, true);
          }
        } else {
          if (nearBottom && savedHasMore) {
            fetchSavedQuotes(savedPageRef.current);
          }
          if (
            nearTop &&
            savedLatestRemoved !== null &&
            savedLatestRemoved >= 1 &&
            !savedLoadingRef.current
          ) {
            fetchSavedQuotes(savedLatestRemoved, true);
          }
        }

        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [
    activeTab,
    publishedHasMore,
    savedHasMore,
    publishedLatestRemoved,
    savedLatestRemoved,
    fetchPublishedQuotes,
    fetchSavedQuotes,
  ]);

  // ---------------- Username ----------------
  useLayoutEffect(() => {
    const fetchUsername = async () => {
      try {
        const cachedUsername = localStorage.getItem("sayings_username");
        if (cachedUsername) {
          setUsername(cachedUsername);
          return;
        }
        const response = await getUsername();

        if (response?.error) {
          setUsername("");
          return;
        }

        const usernameFromResp = response?.username ?? response?.data?.username;
        if (usernameFromResp) {
          const cleanedUsername = usernameFromResp.trim();
          setUsername(cleanedUsername);
          localStorage.setItem("sayings_username", cleanedUsername);
        }
      } catch (err) {
        console.error("Error fetching username:", err);
      }
    };

    fetchUsername();
  }, []);

  // ---------------- Initial Fetch (StrictMode safe) ----------------
  useEffect(() => {
    if (activeTab === "Published Quotes" && !didInitRef.current.published) {
      didInitRef.current.published = true;
      fetchPublishedQuotes(1);
    }
    if (activeTab === "Saved Quotes" && !didInitRef.current.saved) {
      didInitRef.current.saved = true;
      fetchSavedQuotes(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------------- Render ----------------
  return (
    <>
      <div className="overflow-hidden w-screen">
        <div className="fixed top-0 left-0 w-full z-50">
          <Header />
        </div>

        {/* Exposure Bar */}
        <div className="flex pl-32 pr-32 mt-[140px]">
          <div
            style={{ backgroundColor: barColor, color: textColor }}
            className="flex flex-row items-center p-4 w-full h-40 rounded-full"
          >
            {/* profile picture */}
            <div
              style={{ backgroundColor: textColor }}
              className="flex items-center justify-center w-32 h-32 rounded-full text-[46px]"
            >
              {username.trim() !== "" ? (
                <p
                  id="profile-initial"
                  style={{
                    backgroundColor: getColor(username[0]?.toUpperCase() ?? "G"),
                  }}
                  className="w-28 h-28 flex items-center justify-center rounded-full font-ibm font-bold text-[50px]"
                >
                  {username[0]?.toUpperCase() ?? "U"}
                </p>
              ) : (
                <CircleUserRound size={30} style={{ marginBottom: "2px" }} />
              )}
            </div>

            {/* username + info */}
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
                onMouseEnter={() => setEditIconHovered(true)}
                onMouseLeave={() => setEditIconHovered(false)}
              />
              {editIconHovered && (
                <p className="absolute top-8 right-24 underline">Customize your exposure bar</p>
              )}
              <p className="absolute right-16 bottom-10 text-[24px]">{`"${favQuote}"`}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-row justify-center mt-8 gap-4 text-[26px]">
          {tabs.map((tab) => (
            <p
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1 px-5 rounded-full font-ibm font-bold cursor-pointer transition-colors duration-300 ${
                activeTab === tab ? "bg-uiPrimary text-black" : "bg-transparent text-white"
              }`}
            >
              {tab}
            </p>
          ))}
        </div>
      </div>

      {/* Published Quotes */}
      {activeTab === "Published Quotes" && (
        <div className="p-8 text-white flex justify-center">
          {publishedQuotes.length === 0 ? (
            <p className="text-lg opacity-70">No published quotes yet.</p>
          ) : (
            <div className="flex flex-col gap-4 w-[800px] mb-12">
              {publishedQuotes.map((quote, idx) => {
                const id = quote.id ?? idx;
                return (
                  <div id={`published-${id}`} key={id}>
                    <QuoteCard
                      id={id}
                      text={quote.quote_text ?? ""}
                      author={username}
                      likes_count={quote.likes_count ?? 0}
                      dislikes_count={quote.dislikes_count ?? 0}
                      source={quote.quote_source ?? ""}
                      saved={false}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Saved Quotes */}
      {activeTab === "Saved Quotes" && (
        <div className="p-8 text-white flex justify-center">
          {savedQuotes.length === 0 ? (
            <p className="text-lg opacity-70">No saved quotes yet.</p>
          ) : (
            <div className="flex flex-col gap-4 w-[800px] mb-12">
              {savedQuotes.map((quote, idx) => {
                const id = quote.id ?? idx;
                return (
                  <div id={`saved-${id}`} key={id}>
                    <QuoteCard
                      id={id}
                      text={quote.quote_text ?? ""}
                      author={quote.quote_author ?? "Unknown"}
                      likes_count={quote.likes_count ?? 0}
                      dislikes_count={quote.dislikes_count ?? 0}
                      source={quote.quote_source ?? ""}
                      saved={true}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </>
  );
};

export default Profile;