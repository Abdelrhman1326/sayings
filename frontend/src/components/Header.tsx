import Button from "./ui/Button"
import Logo from "./ui/Logo"

const Header = () => {
  return (
    <div className="flex place-items-center gap-24 w-screen pl-32 pr-32 pt-8">
      <Logo size={44} />
      <nav className="flex text-white font-ibm font-bold gap-20 mt-1 text-[18px]">
        <p className="cursor-pointer">Quote of the day</p>
        <p className="cursor-pointer">Browse</p>
        <p className="cursor-pointer">Search</p>
        <p className="cursor-pointer">Saved</p>
      </nav>
      <div className="pr-32 absolute right-4">
        <Button text="Sign in" className="font-kalnia font-bold rounded-full w-[125px] h-[45px]
        border-solid border-white border-4 text-[22px] flex items-center justify-center" />
      </div>
    </div>
  )
}

export default Header;