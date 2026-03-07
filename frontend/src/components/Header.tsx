import { useEffect, useState } from "react";
import Button from "./ui/Button"
import Logo from "./ui/Logo"

import { useNavigate, useLocation } from "react-router-dom"
import { getAuth } from "../apis/auth";
import { logout } from "../apis/logoutApi";
import { toast } from "react-toastify";
import { Menu, X } from "lucide-react";

const Header = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <>
      <div className="flex place-items-center gap-8 lg:gap-24 w-screen sm:ml-8 pl-4 pr-4 lg:pl-32 lg:pr-32 pt-4 lg:pt-6 bg-bgColor">
        <div onClick={() => navigate('/home')}>
          <Logo size={40} />
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex font-ibm font-bold gap-16 mt-2 text-[17px]">
          <p onClick={() => navigate('/home')} className={getNavItemStyle("home")}>Home</p>
          <p onClick={() => navigate('/browse')} className={getNavItemStyle("browse")}>Browse</p>
          <p onClick={() => navigate('/profile')} className={getNavItemStyle("profile")}>Profile</p>
        </nav>

        {/* Desktop Logout Button */}
        <div className="hidden lg:block absolute right-0 mr-32">
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

                  localStorage.removeItem("sayings_username");
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

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden absolute right-4 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X size={28} className="text-white" />
          ) : (
            <Menu size={28} className="text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-[70px] left-0 w-full bg-bgColor/95 backdrop-blur-sm z-50 border-t border-white/10">
          <nav className="flex flex-col font-ibm font-bold text-[18px] py-6 px-8 gap-4">
            <p 
              onClick={() => {
                navigate('/home');
                setIsMobileMenuOpen(false);
              }} 
              className={`${getNavItemStyle("home")} py-3 px-4 rounded-lg hover:bg-white/10 transition-colors`}
            >
              Home
            </p>
            <p 
              onClick={() => {
                navigate('/browse');
                setIsMobileMenuOpen(false);
              }} 
              className={`${getNavItemStyle("browse")} py-3 px-4 rounded-lg hover:bg-white/10 transition-colors`}
            >
              Browse
            </p>
            <p 
              onClick={() => {
                navigate('/profile');
                setIsMobileMenuOpen(false);
              }} 
              className={`${getNavItemStyle("profile")} py-3 px-4 rounded-lg hover:bg-white/10 transition-colors`}
            >
              Profile
            </p>
            <hr className="border-white/20 my-2" />
            <p 
              onClick={async () => {
                if (!isAuthenticated) {
                  navigate('/login');
                } else {
                  try {
                    navigate('/home');
                    await logout();
                    localStorage.removeItem("sayings_username");
                    setIsAuthenticated(false);
                    toast.success("Logout successful")
                    navigate('/login');
                  } catch (err) {
                    toast.error(`${err}`);
                  }
                }
                setIsMobileMenuOpen(false);
              }} 
              className={`${isAuthenticated ? "text-red-400" : "text-uiPrimary"} py-3 px-4 rounded-lg hover:bg-white/10 transition-colors`}
            >
              {isAuthenticated ? "Log Out" : "Sign In"}
            </p>
          </nav>
        </div>
      )}
    </>
  )
}

export default Header;