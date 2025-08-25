import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { Bookmark, User } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  return (
    <div className="overflow-hidden">
      <Header />
      <div className="flex flex-col items-center min-h-screen">
        <div className="mt-10 bg-[#1D1D1D] w-[800px] h-[60px] rounded-2xl p-4 flex items-center cursor-pointer"
          onClick={() => navigate('/profile/saved-quotes')}
        >
          <Bookmark style={{ fill: "white" }} />
          <p className="text-white font-ibm font-bold ml-2">Saved Quotes</p>
        </div>
        <div className="mt-4 bg-[#1D1D1D] w-[800px] h-[60px] rounded-2xl p-4 flex items-center cursor-pointer">
          <User color="white" />
          <p className="text-white font-ibm font-bold ml-2">Profile info</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;