import Header from "./Header";
import SeachBody from "./subComponents/SeachBody";
import SeachBar from "./subComponents/SearchBar"

const Search = () => {
  return (
    <div>
      <Header />
      <SeachBar />
      <SeachBody />
    </div>
  )
}

export default Search;