import Button from "./ui/Button";
import Logo from "./ui/Logo";
import { TiArrowLeftOutline } from "react-icons/ti";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen">
      <div className="absolute pl-32 pr-32 pt-8">
        <Logo size={44} />
      </div>
      <div className="h-screen w-screen flex justify-center items-center">
        <div className="flex flex-col text-center px-4">
          <h1 className="text-white font-jsMath text-[250px] opacity-100 font-light leading-none cursor-default">404</h1>
          <p className="text-white font-jsMath text-[20px] mt-2 cursor-default">
            “In the middle of nowhere, you sometimes find yourself.”
          </p>
          <div className="flex justify-center mt-12">
            <div
              className="relative inline-block group cursor-pointer"
              onClick={() => navigate("/home")}
            >
              <TiArrowLeftOutline className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white text-[35px] transition-colors duration-300 group-hover:text-black" />
              <Button
                text="Go To Home Page"
                className="text-[20px] pl-[60px] pr-6 pt-3 pb-3 bg-opacity-0 text-white border-solid border-white border-4 rounded-full font-jsMath font-bold transition-colors duration-300 group-hover:bg-uiPrimary group-hover:text-black"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;