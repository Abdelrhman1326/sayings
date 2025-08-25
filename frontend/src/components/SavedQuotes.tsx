import { useState, useEffect } from "react";
import Header from "./Header";
import { getSavedQuotes } from "../apis/getSavedQuotes";
import { toast } from "react-toastify";
import QuoteCard from "./subComponents/QuoteCard";

const SavedQuotes = () => {
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

  return (
    <div>
      <Header />
      <h1 className="text-white font-ibm font-bold text-[30px] text-center pt-8">
        Saved Quotes
      </h1>

      <div className="p-8 text-white flex justify-center">
        {savedQuotes.length === 0 ? (
          <p>No saved quotes found.</p>
        ) : (
          // Results
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
    </div>
  );
};

export default SavedQuotes;