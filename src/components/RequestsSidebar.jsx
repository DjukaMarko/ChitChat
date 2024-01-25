import hamburger from "../../public/hamburger.png"

export const RequestsSidebar = () => {

    return (
        <>
            <div className="flex flex-col space-y-6 p-5">
                <div className="w-full flex justify-between">
                    <p className="text-lg md:text-2xl font-[500]">Requests</p>
                    <div className="cursor-pointer bg-[#f7f7f7] lg:hidden block hover:bg-[#f0f0f0] rounded-full p-2"><img src={hamburger} className="w-[20px] h-[20px]" /></div>
                </div>
            </div>
        </>
    )
}