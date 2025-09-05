import { useState } from "react"

type Option = {
  value: string
  label: string
}

type MultiselectInputProps = {
  options: Option[]
  placeholder?: string
  onChange?: (selected: Option | null) => void
}

export default function MultiselectInput({
  options,
  placeholder = "Select a genre",
  onChange,
}: MultiselectInputProps) {
  const [selected, setSelected] = useState<Option | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  const toggleOption = (option: Option) => {
    let updated: Option | null
    if (selected?.value === option.value) {
      updated = null // unselect if clicked again
    } else {
      updated = option // only one allowed
    }
    setSelected(updated)
    onChange?.(updated)
    setIsOpen(false) // close dropdown after choosing
  }

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  // Sample data for demonstration
  const sampleOptions: Option[] = [
    { value: "motivation", label: "Motivational" },
    { value: "love", label: "Love & Relationships" },
    { value: "wisdom", label: "Wisdom" },
    { value: "humor", label: "Humor" },
    { value: "inspiration", label: "Inspiration" },
    { value: "life", label: "Life Lessons" },
    { value: "success", label: "Success" },
    { value: "friendship", label: "Friendship" },
    { value: "dreams", label: "Dreams & Goals" },
    { value: "happiness", label: "Happiness" },
  ]

  const displayOptions = options.length > 0 ? options : sampleOptions

  return (
    <div className="relative w-full max-w-md">
      {/* Input box */}
      <div
        className="relative rounded-lg w-[770px] bg-[#1D1D1D] backdrop-blur-sm border border-gray-700/50 text-gray-300 cursor-pointer transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="px-4 py-3 flex items-center justify-between min-h-[48px]">
          {selected ? (
            <span className="text-gray-200 text-sm font-medium">
              {selected.label}
            </span>
          ) : (
            <span className="text-gray-400 text-md">{placeholder}</span>
          )}
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown content */}
          <div className="absolute z-50 mt-2 w-[770px] rounded-lg bg-[#1D1D1D] backdrop-blur-sm border border-gray-700/50 shadow-2xl shadow-black/20">
            {/* Search input */}
            <div className="p-3 border-b border-gray-700/50">
              <input
                type="text"
                className="w-full px-3 py-2 bg-[#1D1D1D] text-gray-200 text-sm rounded-md border border-gray-600/50 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder-gray-400 transition-all duration-200"
                placeholder="Search genres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* Options list */}
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={`px-4 py-3 font-ibm cursor-pointer text-sm transition-all duration-150 ${
                      selected?.value === option.value
                        ? "bg-uiPrimary text-black font-bold"
                        : "text-gray-300 hover:bg-black hover:bg-opacity-50 hover:text-gray-100"
                    } ${index === filteredOptions.length - 1 ? '' : 'border-b border-gray-700/30'}`}
                    onClick={() => toggleOption(option)}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-gray-500 text-sm text-center">
                  No genres found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}