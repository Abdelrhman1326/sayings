import Header from "./Header"
import HomeBody from "./subComponents/HomeBody";
import HomeFooter from "./subComponents/HomeFooter";

const Home = () => {
  return (
  <div className="overflow-x-hidden">
    <Header />
    <HomeBody />
    <div className="fixed bottom-0 left-0 w-full">
      <HomeFooter />
    </div>
  </div>
  )
}

export default Home;