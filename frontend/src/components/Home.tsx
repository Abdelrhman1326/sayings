import Header from "./Header"
import HomeBody from "./subComponents/HomeBody";
import HomeFooter from "./subComponents/HomeFooter";

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      <Header />
      <HomeBody />
      <HomeFooter />
    </div>
  )
}

export default Home;