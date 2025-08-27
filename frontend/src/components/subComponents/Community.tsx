import { CircleUserRound } from 'lucide-react';
import { getUsername } from '../../apis/getUsername';
import { useState, useLayoutEffect } from 'react';

const Community = () => {

    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);

    useLayoutEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await getUsername();
                
                if (response.error) {
                    setError(response.error);
                    setUsername('');
                    return;
                }

                if (response.username) {
                    setUsername(response.username.trim());
                    setError(null);
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
                <div className='flex flex-row gap-2 items-center mb-2 opacity-90'>
                    <CircleUserRound size={30} style={{marginBottom: "2px"}} />
                    <p className='font-ibm text-md text-white text-[17px]'>{username}</p>
                </div>
                <input
                    type="text"
                    placeholder="Impress the world with your words"
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-lg border-b border-gray-600 pb-2"
                />
                <input
                type="text"
                    placeholder="Specify your words' genres. Write a genre name, then hit Enter."
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-lg"
                />

                <button
                    className="mt-4 bg-[#9CA3AF] text-black font-bold px-4 py-2 rounded-2xl text-[20px] hover:shadow-md hover:shadow-purple-500/50 transition duration-300 ease-in"
                >
                    Publish
                </button>
            </div>
        </div>
  )
}

export default Community;