import { useEffect, useState } from "react";
import Button from "./ui/Button"
import Logo from "./ui/Logo"

import { useNavigate, useLocation } from "react-router-dom"
import { getAuth } from "../apis/auth";
import { logout } from "../apis/logoutApi";
import { toast } from "react-toastify";

const Header = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getNavItemStyle = (item: string) => {
    const path = location.pathname.toLowerCase();
    return path.startsWith(`/${item.toLowerCase()}`)
    ? "text-uiPrimary cursor-pointer"
    : "text-white cursor-pointer";
  }
  
  useEffect(() => {
    const checkAuth = async () => {
      const authData = await getAuth();
      if (authData.authenticated){
        setIsAuthenticated(true);
      } 
      else setIsAuthenticated(false);
    };
    checkAuth();
  }, []);

  return (
    <div className="flex place-items-center gap-24 w-screen pl-32 pr-32 pt-8">
      <Logo size={44} />
      <nav className="flex font-ibm font-bold gap-16 mt-1 text-[16px]">
        <p onClick={() => navigate('/home')} className={getNavItemStyle("home")}>Home</p>
        <p onClick={() => navigate('/quote-of-the-day')} className={getNavItemStyle("quote-of-the-day")}>Quote of the day</p>
        <p onClick={() => navigate('/browse')} className={getNavItemStyle("browse")}>Browse</p>
        <p onClick={() => navigate('/search')} className={getNavItemStyle("search")}>Search</p>
        <p onClick={() => navigate('/saved')} className={getNavItemStyle("saved")}>Saved</p>
      </nav>
      <div className="pr-32 absolute right-4">
        <Button
          text={isAuthenticated ? "log out" : "sign in"}
          className="font-jsMath font-bold rounded-full w-[125px] h-[45px]
          border-solid border-white border-4 text-[22px] flex items-center justify-center"
          onClick={async () => {
            if (!isAuthenticated) {
              navigate('/login');
            } else {
              try {
                navigate('/home');
                await logout();
                setIsAuthenticated(false);
                toast.success("Logout successful")
                navigate('/login');
              } catch (err) {
                toast.error(`${err}`);
              }
            }
          }}
        />

      </div>
    </div>
  )
}

export default Header;