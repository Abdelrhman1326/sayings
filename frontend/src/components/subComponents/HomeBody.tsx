import Button from "../ui/Button";
import illustration from "../../assets/homepage_illustration.svg";
import { useNavigate } from "react-router-dom";

const HomeBody = () => {

  const navigate = useNavigate();

  return (
    <div className="pl-32 pr-32 pt-12 cursor-default flex flex-row flex items-center">
      <div>
        <h1 className="text-white font-jsMath font-bold text-[100px] mt-16 leading-[1]">
          <span className="block">Discover</span>
          <span className="block mt-2">Hidden Lines</span>
        </h1>
        <div className="mt-12">
          <h2 className="text-white font-ibm font-bold text-[24px]">
            Enjoy reading handpicked quotes from books—created, edited, and
            ranked by a community of passionate readers like you.
          </h2>
        </div>
        <div className="mt-16 items-center relative">
          <Button
            text={"Get A Quote"}
            className="font-jsMath font-bold text-[30px] rounded-full border-solid border-white border-4"
            onClick={() => navigate('/lucky-quote')}
          />
        </div>
      </div>
      <div className="ml-20 lg:flex md:hidden">
        <img src={illustration} alt="illustration" width={600} className="flex items-center" />
      </div>
    </div>
  );
};

export default HomeBody;