import Button from "../ui/Button";
import illustration from "../../assets/homepage_illustration.svg";
import { useNavigate } from "react-router-dom";

const HomeBody = () => {
  const navigate = useNavigate();

  return (
      <div className="px-4 lg:px-32 xl:pt-8 sm:mt-8 lg:pt-12 cursor-default flex flex-col lg:flex-row items-center">
        {/* Increased flex-grow for the text side (flex-[1.5]) */}
        <div className="flex-[1.5]">
          <h1 className="text-white font-jsMath font-bold text-[48px] sm:text-[100px] sm:ml-8 lg:text-[80px] xl:text-[90px] 2xl:text-[100px] mt-8 lg:mt-4 leading-[1.1]">
            <span className="block">Discover</span>
            {/* Added whitespace-nowrap to prevent "Hidden Lines" from breaking */}
            <span className="block mt-1 lg:mt-2 whitespace-nowrap">
            Hidden Lines
          </span>
          </h1>
          <div className="mt-6 lg:mt-10">
            <h2 className="text-white font-ibm font-bold text-[16px] sm:ml-8 sm:text-[24px] lg:text-[20px] xl:text-[24px] leading-relaxed max-w-[600px]">
              Enjoy reading handpicked quotes from books—created, edited, and
              ranked by a community of passionate readers like you.
            </h2>
          </div>
          <div className="mt-10 lg:mt-16 ml-8 items-center relative">
            <Button
                text={"Get A Quote"}
                className="font-jsMath font-bold text-[22px] sm:text-[26px] lg:text-[30px] rounded-full border-solid border-white border-4 px-8 py-3 transition-transform hover:scale-105"
                onClick={() => navigate('/lucky-quote')}
            />
          </div>
        </div>

        {/* Kept image side at flex-1 to leave more room for the text */}
        <div className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0 lg:ml-8">
          <img
              src={illustration}
              className="w-full max-w-[300px] lg:max-w-[450px] xl:max-w-[390px] sm:max-w-0 h-auto object-contain"
          />
        </div>
      </div>
  );
};

export default HomeBody;