import Logo from "./ui/Logo";

const LuckyQuote = () => {
  return (
    <div className="flex place-items-center gap-24 w-screen pl-32 pr-32 pt-8 bg-[#141414] bg-opacity-95">
      <Logo size={44} />
      <p className="text-uiPrimary font-bold font-ibm mt-2 text-[16px]">Lucky Quote</p>
    </div>
  )
}

export default LuckyQuote;