import { CircleUserRound } from "lucide-react";
import { getUsername } from "../../apis/getUsername";
import { useState, useLayoutEffect, useEffect } from "react";
import { getColor } from "../ui/ProfileIconColor";
import { publish } from "../../apis/publishQuote";
import { toast } from "react-toastify";
import MultiselectInput from "../subComponents/MultiselectInput";

type Option = {
  value: string;
  label: string;
};

const genres: Option[] = [
  { value: "inspiration", label: "Inspiration" },
  { value: "motivation", label: "Motivation" },
  { value: "life", label: "Life" },
  { value: "love", label: "Love" },
  { value: "wisdom", label: "Wisdom" },
];

const Community = () => {
  const [username, setUsername] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<Option | null>(null); // Changed from array to single option
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
          setUsername(cleanedUsername);
          localStorage.setItem("sayings_username", cleanedUsername);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchUsername();
  }, []);

  const cleanText = () => {
    let cleanedText = text.trim();
    while (
      cleanedText.startsWith('"') ||
      cleanedText.startsWith("'") ||
      cleanedText.endsWith('"') ||
      cleanedText.endsWith("'")
    ) {
      if (cleanedText.startsWith('"') || cleanedText.startsWith("'")) {
        cleanedText = cleanedText.slice(1);
      }
      if (cleanedText.endsWith('"') || cleanedText.endsWith("'")) {
        cleanedText = cleanedText.slice(0, -1);
      }
      cleanedText = cleanedText.trim();
    }
    setText(cleanedText);
  };

  useEffect(() => {
    cleanText();
  }, [text]);

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="mt-6 flex flex-col gap-2 bg-[#1D1D1D] px-4 py-4 rounded-2xl w-[800px]">
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
          className="flex bg-transparent outline-none
                     text-white placeholder-gray-400 text-lg
                     border-b border-gray-700 pb-2 pl-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Genres input */}
        <MultiselectInput
          options={genres}
          placeholder="Select a genre"
          onChange={(selected) => setSelectedGenre(selected)} // Fixed: now properly handles single option
        />

        {/* Publish button */}
        <button
          type="button"
          onClick={async () => {
            if (!text.trim()) {
              toast.error("Quote text cannot be empty");
              return;
            }
            if (!selectedGenre) { // Fixed: check for null instead of empty array
              toast.error("Please select a genre");
              return;
            }

            setLoading(true);
            const loadingToast = toast.loading("Publishing quote");
            try {
              // Send data with the parameter names that publish() expects
              const response = await publish({ 
                text: text.trim(),        // publish() expects 'text'
                genre: selectedGenre.value  // publish() expects 'genre'
              });
              console.log("Published:", response);

              // Reset state
              setText("");
              setSelectedGenre(null); // Fixed: reset to null instead of empty array
              toast.update(loadingToast, {
                render: "Quote published",
                type: "success",
                isLoading: false,
                autoClose: 3000,
              });
            } catch (error: any) {
              console.error("Publish failed:", error);
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
          className="mt-1 bg-[#9CA3AF] text-black
                     outline-none font-bold px-4 py-2 rounded-2xl text-[20px]
                     hover:shadow-md hover:shadow-purple-500/50 transition duration-300 ease-in"
        >
          Publish
        </button>
      </div>
    </div>
  );
};

export default Community;