import Header from "./Header";
import SeachBody from "./subComponents/SeachBody";
import SeachBar from "./subComponents/SearchBar"

const Search = () => {
  return (
    <div>
      <div className="fixed top-0">
        <Header />
      </div>
      <SeachBar />
      <SeachBody />
    </div>
  )
}

export default Search;