import { BookUser, LogOut, MessageSquareHeart } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { ThemeProvider } from "../misc/ThemeProvider";
import { useContext } from "react";

export const Sidebar = ({ selectedSidebar, setSelectedSidebar, isSigningOut, handleSignOut  }) => {
    const { themeMode } = useContext(ThemeProvider);
    return (
        <div className="bg-backgroundTheme hidden md:flex flex-col justify-between h-screen border-r-[1px] border-secondaryC py-4 px-2">
            <div className="flex flex-col items-center justify-center">
                <div onClick={() => setSelectedSidebar(1)} className={`p-2 space-y-4 cursor-pointer ${selectedSidebar === 1 ? "bg-secondaryCHover" : "bg-secondaryC"} hover:bg-secondaryCHover rounded-t-lg`}>
                    <MessageSquareHeart size={22} color={selectedSidebar === 1 ? "#991b1b" : themeMode === "dark" ? "#ffffff" : "#000000"} />
                </div>
                <div onClick={() => setSelectedSidebar(2)} className={`p-2 space-y-4 cursor-pointer ${selectedSidebar === 2 ? "bg-secondaryCHover" : "bg-secondaryC"} hover:bg-secondaryCHover rounded-b-lg`}>
                    <BookUser size={22} color={selectedSidebar === 2 ? "#991b1b" : themeMode === "dark" ? "#ffffff" : "#000000"} />
                </div>
            </div>
            <div onClick={handleSignOut} className={`p-2 space-y-4 cursor-pointer bg-secondaryC hover:bg-secondaryCHover rounded-lg flex justify-center items-center`}>
                {isSigningOut ? <BeatLoader size={4} color="#991b1b" /> : <LogOut size={22} color={themeMode === "dark" ? "#fff" : "#000"} /> }
            </div>
        </div>
    )
}