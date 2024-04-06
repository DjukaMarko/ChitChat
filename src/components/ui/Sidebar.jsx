import { BookUser, LogOut, MessageSquareHeart } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { useContext } from "react";
import { PageContext } from "../misc/PageContext";

export const Sidebar = ({ selectedSidebar, setSelectedSidebar, cookies }) => {

    const { refresh, isSigningOut, handleSignOut } = useContext(PageContext);


    return (
        <div className="hidden lg:flex flex-col justify-between h-screen border-r-[1px] border-black/5 py-2 px-4">
            <div className="flex flex-col">
                <div onClick={() => setSelectedSidebar(1)} className={`p-3 space-y-4 cursor-pointer ${selectedSidebar === 1 ? "bg-black/10" : "bg-black/5"} hover:bg-black/10 rounded-t-xl`}>
                    <MessageSquareHeart color={selectedSidebar === 1 ? "#991b1b" : "#000"} />
                </div>
                <div onClick={() => setSelectedSidebar(2)} className={`p-3 space-y-4 cursor-pointer ${selectedSidebar === 2 ? "bg-black/10" : "bg-black/5"} hover:bg-black/10 rounded-b-xl`}>
                    <BookUser color={selectedSidebar === 2 ? "#991b1b" : "#000"} />
                </div>
            </div>
            <div onClick={handleSignOut} className={`p-3 space-y-4 cursor-pointer bg-black/5 hover:bg-black/10 rounded-xl flex justify-center items-center`}>
                {isSigningOut ? <BeatLoader size={4} color="#991b1b" /> : <LogOut /> }
            </div>
        </div>
    )
}