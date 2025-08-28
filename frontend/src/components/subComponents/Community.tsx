import { CircleUserRound } from "lucide-react";
import { getUsername } from "../../apis/getUsername";
import { useState, useLayoutEffect } from "react";
import LabelInput from "../subComponents/LabelInput"
import { getColor } from "../ui/ProfileIconColor";

const Community = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const fetchUsername = async () => {
      try {
        const cachedUsername = localStorage.getItem("sayings_username");
        if (cachedUsername) { // check if previously cashed
          setUsername(cachedUsername);
          return; // Skip api call, data found locally
        }
        const response = await getUsername();

        if (response.error) {
          setError(response.error);
          setUsername("");
          return;
        }

        if (response.username) {
          const cleanedUsername = response.username.trim();
          setUsername(cleanedUsername);
          setError(null);
          localStorage.setItem("sayings_username", cleanedUsername)
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Unexpected error while fetching username");
      }
    };

    fetchUsername();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="mt-6 flex flex-col gap-2 bg-[#1D1D1D] px-4 py-4 rounded-2xl w-[800px]">
        {/* Username row */}
        <div className="flex flex-row gap-2 items-center mb-2 opacity-90">
          {username.trim() !== '' ? <div style={{backgroundColor: `${getColor(username[0].toUpperCase())}`}} className="flex w-8 h-8 text-center text-white font-imb justify-center items-center rounded-full"><p>{username[0].toUpperCase()}</p></div> : <CircleUserRound size={30} style={{ marginBottom: "2px" }} />}
          <p className="font-ibm text-md text-white text-[17px]">
            {username}
          </p>
        </div>

        {/* Post input */}
        <input
          type="text"
          placeholder="Impress the world with your words"
          className="flex bg-transparent outline-none
           text-white placeholder-gray-400 text-lg
            border-b border-gray-600 pb-2"
        />

        {/* Genres input (LabelInput component) */}
        <LabelInput />

        {/* Publish button */}
        <button type="button"
         className="mt-4 bg-[#9CA3AF] text-black
          outline-none font-bold px-4 py-2 rounded-2xl text-[20px]
           hover:shadow-md hover:shadow-purple-500/50 transition duration-300 ease-in">
          Publish
        </button>
      </div>
    </div>
  );
};

export default Community;