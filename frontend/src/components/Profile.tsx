import Header from "./Header";
import { CircleUserRound, EditIcon } from "lucide-react";
import { getUsername } from "../apis/getUsername";
import { useState, useLayoutEffect, useEffect, useRef, useCallback } from "react";
import { getColor } from "./ui/ProfileIconColor";
import { getSavedQuotes } from "../apis/getSavedQuotes";
import { getLikedQuotes } from "../apis/getLikedQuotes.ts";
import { getDisliked_quotes } from "../apis/getDislikedQuotes.ts";
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
    is_liked?: boolean;
    is_disliked?: boolean;
};

const Profile = () => {
    const [username, setUsername] = useState<string>("");
    const [barColor, setBarColor] = useState<string>("#D2BCFF");
    const [textColor, setTextColor] = useState("black");
    const [followers, setFollowers] = useState<number>(0);
    const [following, setFollowing] = useState<number>(0);
    const [name, setName] = useState<string>("...");
    const [editIconHovered, setEditIconHovered] = useState<boolean>(false);

    // ---------------- Published Quotes State ----------------
    const [publishedQuotes, setPublishedQuotes] = useState<Quote[]>([]);
    const [publishedHasMore, setPublishedHasMore] = useState(true);
    const [publishedLatestRemoved, setPublishedLatestRemoved] = useState<number | null>(null);
    const [_publishedPage, _setPublishedPage] = useState(1);
    const publishedPageRef = useRef(1);
    const publishedAnchorRef = useRef<{ id: number | null; top: number }>({ id: null, top: 0 });

    // ---------------- Saved Quotes State ----------------
    const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
    const [savedHasMore, setSavedHasMore] = useState(true);
    const [savedLatestRemoved, setSavedLatestRemoved] = useState<number | null>(null);
    const [_savedPage, _setSavedPage] = useState(1);
    const savedPageRef = useRef(1);
    const savedAnchorRef = useRef<{ id: number | null; top: number }>({ id: null, top: 0 });

    // ---------------- Liked Quotes State ----------------
    const [likedQuotes, setLikedQuotes] = useState<Quote[]>([]);
    const [likedHasMore, setLikedHasMore] = useState(true);
    const [likedLatestRemoved, setLikedLatestRemoved] = useState<number | null>(null);
    const [_likedPage, _setLikedPage] = useState(1);
    const likedPageRef = useRef(1);
    const likedAnchorRef = useRef<{ id: number | null; top: number }>({ id: null, top: 0 });

    // ---------------- Disliked Quotes State ----------------
    const [dislikedQuotes, setDislikedQuotes] = useState<Quote[]>([]);
    const [dislikedHasMore, setDislikedHasMore] = useState(true);
    const [dislikedLatestRemoved, setDislikedLatestRemoved] = useState<number | null>(null);
    const [_dislikedPage, _setDislikedPage] = useState(1);
    const dislikedPageRef = useRef(1);
    const dislikedAnchorRef = useRef<{ id: number | null; top: number }>({ id: null, top: 0 });

    // ---------------- Loading / in-flight guards ----------------
    const [publishedLoading, setPublishedLoading] = useState(false);
    const [savedLoading, setSavedLoading] = useState(false);
    const [likedLoading, setLikedLoading] = useState(false);
    const [dislikedLoading, setDislikedLoading] = useState(false);
    const publishedLoadingRef = useRef(false);
    const savedLoadingRef = useRef(false);
    const likedLoadingRef = useRef(false);
    const dislikedLoadingRef = useRef(false);
    const inFlightRef = useRef(new Set<string>());

    // ---------------- StrictMode double-mount guard ----------------
    const didInitRef = useRef<{ published: boolean; saved: boolean; liked: boolean; disliked: boolean }>({
        published: false,
        saved: false,
        liked: false,
        disliked: false,
    });

    // ---------------- Tabs ----------------
    const tabs = ["Published Quotes", "Saved Quotes", "Liked", "Disliked"];
    const [activeTab, setActiveTab] = useState("Published Quotes");

    // --- Pagination Setters (Syncs state setter with ref) ---
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
    const setLikedPage = (updater: number | ((p: number) => number)) => {
        if (typeof updater === "function") {
            _setLikedPage((prev) => {
                const next = (updater as (p: number) => number)(prev);
                likedPageRef.current = next;
                return next;
            });
        } else {
            _setLikedPage(updater);
            likedPageRef.current = updater;
        }
    };
    const setDislikedPage = (updater: number | ((p: number) => number)) => {
        if (typeof updater === "function") {
            _setDislikedPage((prev) => {
                const next = (updater as (p: number) => number)(prev);
                dislikedPageRef.current = next;
                return next;
            });
        } else {
            _setDislikedPage(updater);
            dislikedPageRef.current = updater;
        }
    };
    // ---------------- End Pagination Setters ----------------

    // ---------------- Helpers ----------------
    const normalizeResponse = (resp: any): Quote[] => {
        const d = resp?.data ?? resp;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.results)) return d.results;
        return [];
    };
    const makeInFlightKey = (list: "published" | "saved" | "liked" | "disliked", page: number, prepend: boolean) =>
        `${list}:${page}:${prepend ? 1 : 0}`;

    // Generic list management function
    const manageListUpdate = (
        listType: "published" | "saved" | "liked" | "disliked",
        data: Quote[],
        page: number,
        prepend: boolean
    ) => {
        const setListQuotes =
            listType === "published"
                ? setPublishedQuotes
                : listType === "saved"
                    ? setSavedQuotes
                    : listType === "liked"
                        ? setLikedQuotes
                        : setDislikedQuotes;
        const setListHasMore =
            listType === "published"
                ? setPublishedHasMore
                : listType === "saved"
                    ? setSavedHasMore
                    : listType === "liked"
                        ? setLikedHasMore
                        : setDislikedHasMore;
        const setListPage =
            listType === "published"
                ? setPublishedPage
                : listType === "saved"
                    ? setSavedPage
                    : listType === "liked"
                        ? setLikedPage
                        : setDislikedPage;

        setListQuotes((prev) => {
            let updated = prepend ? [...data, ...prev] : [...prev, ...data];
            // Simplified chunking logic based on your previous implementation
            if (!prepend && updated.length > 2 * CHUNK_SIZE) updated = updated.slice(CHUNK_SIZE);
            if (prepend && updated.length > 100) updated = updated.slice(0, 100);
            return updated;
        });

        if (!prepend) {
            if (data.length < CHUNK_SIZE) setListHasMore(false);
            else setListPage((p) => p + 1);
        }
    };

    // Helper to set anchor before fetching
    const setAnchor = (listType: "published" | "saved" | "liked" | "disliked", prepend: boolean, quotes: Quote[]) => {
        const anchorRef =
            listType === "published"
                ? publishedAnchorRef
                : listType === "saved"
                    ? savedAnchorRef
                    : listType === "liked"
                        ? likedAnchorRef
                        : dislikedAnchorRef;
        const prefix = listType === "published" ? "published" : listType === "saved" ? "saved" : listType === "liked" ? "liked" : "disliked";

        if (quotes.length > 0) {
            const targetQuote = prepend ? quotes[0] : quotes[quotes.length - 1];
            const targetId = targetQuote?.id ?? null;
            const el = targetId !== null ? document.getElementById(`${prefix}-${targetId}`) : null;
            anchorRef.current = {
                id: targetId ?? null,
                top: el ? el.getBoundingClientRect().top : 0,
            };
        } else {
            anchorRef.current = { id: null, top: 0 };
        }
    };

    // ---------------- Fetch Quotes Generic ----------------
    const fetchQuotes = useCallback(
        async (
            listType: "published" | "saved" | "liked" | "disliked",
            fetchApi: (page: number, size: number) => Promise<any>,
            page: number,
            prepend = false
        ) => {
            if (page < 1) return;

            const key = makeInFlightKey(listType, page, prepend);
            const loadingRef =
                listType === "published" ? publishedLoadingRef : listType === "saved" ? savedLoadingRef : listType === "liked" ? likedLoadingRef : dislikedLoadingRef;
            const hasMore =
                listType === "published" ? publishedHasMore : listType === "saved" ? savedHasMore : listType === "liked" ? likedHasMore : dislikedHasMore;
            const setLoading =
                listType === "published" ? setPublishedLoading : listType === "saved" ? setSavedLoading : listType === "liked" ? setLikedLoading : setDislikedLoading;
            const quotes =
                listType === "published" ? publishedQuotes : listType === "saved" ? savedQuotes : listType === "liked" ? likedQuotes : dislikedQuotes;

            if (inFlightRef.current.has(key)) return;
            if (loadingRef.current && !prepend) return;
            if (!hasMore && !prepend) return;

            inFlightRef.current.add(key);
            loadingRef.current = true;
            setLoading(true);

            const toastId = toast.loading(`Loading ${listType} quotes...`, { autoClose: false });

            try {
                setAnchor(listType, prepend, quotes);

                const response = await fetchApi(page, CHUNK_SIZE);
                const data = normalizeResponse(response);

                await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced fake delay slightly

                if (!data || data.length === 0) {
                    const setListHasMore =
                        listType === "published" ? setPublishedHasMore : listType === "saved" ? setSavedHasMore : listType === "liked" ? setLikedHasMore : setDislikedHasMore;
                    if (!prepend) setListHasMore(false);
                    return;
                }

                manageListUpdate(listType, data, page, prepend);

            } catch (error: any) {
                console.error(`fetch${listType}Quotes error:`, error);
                toast.error(`Error fetching ${listType} quotes.`);
            } finally {
                inFlightRef.current.delete(key);
                loadingRef.current = false;
                setLoading(false);
                toast.dismiss(toastId);
            }
        },
        [publishedHasMore, savedHasMore, likedHasMore, dislikedHasMore, publishedQuotes, savedQuotes, likedQuotes, dislikedQuotes]
    );

    // Specific fetch functions using the generic one
    const fetchPublishedQuotes = useCallback((page: number, prepend = false) =>
        fetchQuotes("published", getPublishedQuotes, page, prepend), [fetchQuotes]);
    const fetchSavedQuotes = useCallback((page: number, prepend = false) =>
        fetchQuotes("saved", getSavedQuotes, page, prepend), [fetchQuotes]);
    const fetchLikedQuotes = useCallback((page: number, prepend = false) =>
        fetchQuotes("liked", getLikedQuotes, page, prepend), [fetchQuotes]);
    const fetchDislikedQuotes = useCallback((page: number, prepend = false) =>
        fetchQuotes("disliked", getDisliked_quotes, page, prepend), [fetchQuotes]);


    // ---------------- Restore scroll after insert/prepend ----------------
    useLayoutEffect(() => {
        const restoreScroll = (anchorRef: React.MutableRefObject<{ id: number | null; top: number }>, prefix: string) => {
            const { id, top } = anchorRef.current;
            if (id !== null) {
                const el = document.getElementById(`${prefix}-${id}`);
                if (el) {
                    const newTop = el.getBoundingClientRect().top;
                    const delta = newTop - top;
                    if (delta !== 0) window.scrollBy(0, delta);
                }
                anchorRef.current = { id: null, top: 0 };
            }
        };

        restoreScroll(publishedAnchorRef, "published");
        restoreScroll(savedAnchorRef, "saved");
        restoreScroll(likedAnchorRef, "liked");
        restoreScroll(dislikedAnchorRef, "disliked");
    }, [publishedQuotes, savedQuotes, likedQuotes, dislikedQuotes]);

    // ---------------- Scroll Handler (throttled with rAF) ----------------
    useEffect(() => {
        const tickingRef = { current: false };

        const onScroll = () => {
            if (tickingRef.current) return;
            tickingRef.current = true;

            requestAnimationFrame(() => {
                const nearBottom = window.scrollY + window.innerHeight >= document.body.offsetHeight - 200;
                const nearTop = window.scrollY < 200;

                const checkScroll = (
                    hasMore: boolean,
                    pageRef: React.MutableRefObject<number>,
                    latestRemoved: number | null,
                    loadingRef: React.MutableRefObject<boolean>,
                    fetchFunc: (page: number, prepend?: boolean) => void
                ) => {
                    if (nearBottom && hasMore) {
                        fetchFunc(pageRef.current);
                    }
                    if (nearTop && latestRemoved !== null && latestRemoved >= 1 && !loadingRef.current) {
                        fetchFunc(latestRemoved, true);
                    }
                };

                switch (activeTab) {
                    case "Published Quotes":
                        checkScroll(publishedHasMore, publishedPageRef, publishedLatestRemoved, publishedLoadingRef, fetchPublishedQuotes);
                        break;
                    case "Saved Quotes":
                        checkScroll(savedHasMore, savedPageRef, savedLatestRemoved, savedLoadingRef, fetchSavedQuotes);
                        break;
                    case "Liked":
                        checkScroll(likedHasMore, likedPageRef, likedLatestRemoved, likedLoadingRef, fetchLikedQuotes);
                        break;
                    case "Disliked":
                        checkScroll(dislikedHasMore, dislikedPageRef, dislikedLatestRemoved, dislikedLoadingRef, fetchDislikedQuotes);
                        break;
                }

                tickingRef.current = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [
        activeTab, publishedHasMore, savedHasMore, likedHasMore, dislikedHasMore,
        publishedLatestRemoved, savedLatestRemoved, likedLatestRemoved, dislikedLatestRemoved,
        fetchPublishedQuotes, fetchSavedQuotes, fetchLikedQuotes, fetchDislikedQuotes,
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

    // --- LOGIC TO FORCE REFETCH ON TAB CHANGE ---
    useEffect(() => {
        const resetAndFetch = (
            setData: React.Dispatch<React.SetStateAction<Quote[]>>,
            setHasMore: React.Dispatch<React.SetStateAction<boolean>>,
            setLatestRemoved: React.Dispatch<React.SetStateAction<number | null>>,
            setPageRef: React.MutableRefObject<number>,
            setPage: (updater: number) => void,
            fetchFunc: (page: number) => void,
            didInitRefKey: "published" | "saved" | "liked" | "disliked"
        ) => {
            // **CRITICAL: Reset data and pagination state to force a new load**
            setData([]); // Clear the current list
            setHasMore(true); // Reset hasMore flag
            setLatestRemoved(null); // Clear removed page tracker
            setPageRef.current = 1; // Reset page ref
            setPage(1); // Reset page state

            // Reset initialization guard to ensure fetch runs again immediately
            didInitRef.current[didInitRefKey] = false;

            // Trigger the initial fetch (which uses the reset state)
            fetchFunc(1);
        };

        // Use requestAnimationFrame to allow React to process the state change from setActiveTab first
        const timer = requestAnimationFrame(() => {
            switch (activeTab) {
                case "Published Quotes":
                    if (!didInitRef.current.published) {
                        didInitRef.current.published = true;
                        fetchPublishedQuotes(1);
                    }
                    break;
                case "Saved Quotes":
                    if (!didInitRef.current.saved) {
                        didInitRef.current.saved = true;
                        fetchSavedQuotes(1);
                    }
                    break;
                case "Liked":
                    // FORCE REFETCH
                    resetAndFetch(
                        setLikedQuotes, setLikedHasMore, setLikedLatestRemoved,
                        likedPageRef, setLikedPage, fetchLikedQuotes, "liked"
                    );
                    break;
                case "Disliked":
                    // FORCE REFETCH
                    resetAndFetch(
                        setDislikedQuotes, setDislikedHasMore, setDislikedLatestRemoved,
                        dislikedPageRef, setDislikedPage, fetchDislikedQuotes, "disliked"
                    );
                    break;
            }
        });

        return () => clearTimeout(timer);
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
                        className="flex flex-row items-center p-4 w-full h-40 rounded-full text-black bg-gradient-to-r from-uiPrimary via-violet-400 to-violet-500"
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

            {/* Quote List Views */}
            <div className="p-8 text-white flex justify-center">
                {activeTab === "Published Quotes" && (
                    publishedQuotes.length === 0 && publishedLoading === false ? (
                        <p className="text-lg opacity-70">No published quotes yet.</p>
                    ) : (
                        <div className="flex flex-col gap-4 w-[800px] mb-12">
                            {publishedQuotes.map((quote, idx) => {
                                const id = quote.id ?? `pub-${idx}`;
                                return (
                                    <div id={`published-${id}`} key={id}>
                                        <QuoteCard
                                            id={quote.id ?? idx}
                                            text={quote.quote_text ?? ""}
                                            author={username}
                                            likes_count={quote.likes_count ?? 0}
                                            dislikes_count={quote.dislikes_count ?? 0}
                                            source={quote.quote_source ?? ""}
                                            saved={false}
                                            liked_by_user={quote.is_liked ?? false}
                                            disliked_by_user={quote.is_disliked ?? false}
                                        />
                                    </div>
                                );
                            })}
                            {publishedLoading && <p className="text-center opacity-50">Loading more...</p>}
                        </div>
                    )
                )}

                {activeTab === "Saved Quotes" && (
                    savedQuotes.length === 0 && savedLoading === false ? (
                        <p className="text-lg opacity-70">No saved quotes yet.</p>
                    ) : (
                        <div className="flex flex-col gap-4 w-[800px] mb-12">
                            {savedQuotes.map((quote, idx) => {
                                const id = quote.id ?? `save-${idx}`;
                                return (
                                    <div id={`saved-${id}`} key={id}>
                                        <QuoteCard
                                            id={quote.id ?? idx}
                                            text={quote.quote_text ?? ""}
                                            author={quote.quote_author ?? "Unknown"}
                                            likes_count={quote.likes_count ?? 0}
                                            dislikes_count={quote.dislikes_count ?? 0}
                                            source={quote.quote_source ?? ""}
                                            saved={true}
                                            liked_by_user={quote.is_liked ?? false}
                                            disliked_by_user={quote.is_disliked ?? false}
                                        />
                                    </div>
                                );
                            })}
                            {savedLoading && <p className="text-center opacity-50">Loading more...</p>}
                        </div>
                    )
                )}

                {activeTab === "Liked" && (
                    likedQuotes.length === 0 && likedLoading === false ? (
                        <p className="text-lg opacity-70">No liked quotes yet.</p>
                    ) : (
                        <div className="flex flex-col gap-4 w-[800px] mb-12">
                            {likedQuotes.map((quote, idx) => {
                                const id = quote.id ?? `liked-${idx}`;
                                return (
                                    <div id={`liked-${id}`} key={id}>
                                        <QuoteCard
                                            id={quote.id ?? idx}
                                            text={quote.quote_text ?? ""}
                                            author={quote.quote_author ?? "Unknown"}
                                            likes_count={quote.likes_count ?? 0}
                                            dislikes_count={quote.dislikes_count ?? 0}
                                            source={quote.quote_source ?? ""}
                                            saved={false}
                                            liked_by_user={true}
                                            disliked_by_user={false}
                                        />
                                    </div>
                                );
                            })}
                            {likedLoading && <p className="text-center opacity-50">Loading more...</p>}
                        </div>
                    )
                )}

                {activeTab === "Disliked" && (
                    dislikedQuotes.length === 0 && dislikedLoading === false ? (
                        <p className="text-lg opacity-70">No disliked quotes yet.</p>
                    ) : (
                        <div className="flex flex-col gap-4 w-[800px] mb-12">
                            {dislikedQuotes.map((quote, idx) => {
                                const id = quote.id ?? `disliked-${idx}`;
                                return (
                                    <div id={`disliked-${id}`} key={id}>
                                        <QuoteCard
                                            id={quote.id ?? idx}
                                            text={quote.quote_text ?? ""}
                                            author={quote.quote_author ?? "Unknown"}
                                            likes_count={quote.likes_count ?? 0}
                                            dislikes_count={quote.dislikes_count ?? 0}
                                            source={quote.quote_source ?? ""}
                                            saved={false}
                                            liked_by_user={false}
                                            disliked_by_user={true}
                                        />
                                    </div>
                                );
                            })}
                            {dislikedLoading && <p className="text-center opacity-50">Loading more...</p>}
                        </div>
                    )
                )}
            </div>
        </>
    );
};

export default Profile;