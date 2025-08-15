import Header from "./Header";
import SeachBody from "./subComponents/SeachBody";

const Search = () => {
  return (
    <div>
      <div className="fixed top-0">
        <Header />
      </div>
      <SeachBody />
    </div>
  )
}

export default Search;