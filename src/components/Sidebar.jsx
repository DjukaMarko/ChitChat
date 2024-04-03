import requestsimg from "../../public/requests.png"
import chaticon from "../../public/chaticon.png"
import signout from "../../public/logout.png"
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

export const Sidebar = ({ selectedSidebar, setSelectedSidebar, cookies }) => {

    const refresh = () => window.location.reload(true);
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            cookies.set("auth-token", "");
            refresh();
        } catch (e) {
            console.error(e);
        }
    };


    return (
        <div className="hidden lg:flex lg:w-[80px] flex-col justify-between h-full min-h-screen border-r-[1px] border-black/5 py-2 px-4">
            <div className="flex flex-col">
                <div onClick={() => setSelectedSidebar(1)} className={`p-3 space-y-4 cursor-pointer ${selectedSidebar === 1 ? "bg-black/10" : "bg-black/5"} hover:bg-black/10 rounded-t-xl`}>
                    <img src={chaticon} />
                </div>
                <div onClick={() => setSelectedSidebar(2)} className={`p-3 space-y-4 cursor-pointer ${selectedSidebar === 2 ? "bg-black/10" : "bg-black/5"} hover:bg-black/10 rounded-b-xl`}>
                    <img src={requestsimg} />
                </div>
            </div>
            <div onClick={handleSignOut} className={`p-3 space-y-4 cursor-pointer bg-black/5 hover:bg-black/10 rounded-xl`}>
                <img src={signout} />
            </div>
        </div>
    )
}