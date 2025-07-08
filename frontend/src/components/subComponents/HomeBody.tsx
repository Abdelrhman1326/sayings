import Button from "../ui/Button";

const HomeBody = () => {
  return (
    <div className="pl-32 pr-32 pt-24 cursor-default">
        <h1 className="text-white font-jsMath font-bold text-[90px] mt-12 leading-[1]">
            <span className="block">Discover</span>
            <span className="block mt-2">Hidden Lines</span>
        </h1>
        <div className="pr-[800px] mt-8">
            <h2 className="text-white font-ibm font-bold text-[24px]">
                Enjoy reading handpicked quotes from books—created, edited, and
                ranked by a community of passionate readers like you.
            </h2>
        </div>
        <div className="mt-12 items-center relative">
            <Button text={"Get A Quote"} className="font-jsMath font-bold text-[30px] rounded-full border-solid border-white border-4" />
        </div>
    </div>
  )
}

export default HomeBody;