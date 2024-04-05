import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { BookUser, LogOut, MessageSquareHeart } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { useState } from "react";

export const Sidebar = ({ selectedSidebar, setSelectedSidebar, cookies }) => {

    const refresh = () => window.location.reload(true);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const handleSignOut = async () => {
        try {
            setIsSigningOut(true);
            await signOut(auth);
            cookies.set("auth-token", "");
            refresh();
        } catch (e) {
            console.error(e);
        }
    };


    return (
        <div className="hidden lg:flex flex-col justify-between h-screen border-r-[1px] border-black/5 py-2 px-4">
            <div className="flex flex-col">
                <div onClick={() => setSelectedSidebar(1)} className={`p-3 space-y-4 cursor-pointer ${selectedSidebar === 1 ? "bg-black/10" : "bg-black/5"} hover:bg-black/10 rounded-t-xl`}>
                    <MessageSquareHeart />
                </div>
                <div onClick={() => setSelectedSidebar(2)} className={`p-3 space-y-4 cursor-pointer ${selectedSidebar === 2 ? "bg-black/10" : "bg-black/5"} hover:bg-black/10 rounded-b-xl`}>
                    <BookUser />
                </div>
            </div>
            <div onClick={handleSignOut} className={`p-3 space-y-4 cursor-pointer bg-black/5 hover:bg-black/10 rounded-xl flex justify-center items-center`}>
                {isSigningOut ? <BeatLoader size={4} /> : <LogOut /> }
            </div>
        </div>
    )
}