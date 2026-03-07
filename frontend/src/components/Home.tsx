import Header from "./Header"
import HomeBody from "./subComponents/HomeBody";
import HomeFooter from "./subComponents/HomeFooter";

const Home = () => {
  return (
  <div className="overflow-x-hidden">
    <Header />
    <HomeBody />
    <div className="w-full lg:mt-0 sm:mt-10">
      <HomeFooter />
    </div>
  </div>
  )
}

export default Home;