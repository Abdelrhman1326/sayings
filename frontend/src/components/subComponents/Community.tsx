const Community = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Search Box */}
      <div className="mt-6 flex flex-col gap-2 bg-[#1D1D1D] px-4 py-4 rounded-2xl w-[800px]">
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