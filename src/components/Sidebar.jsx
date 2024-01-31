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
        <div className="hidden lg:flex lg:w-[80px] flex-col justify-between h-full min-h-screen border-r-[1px] py-5 px-4">
            <div className="flex flex-col">
                <div onClick={() => setSelectedSidebar(1)} className={`p-3 space-y-4 cursor-pointer bg-[${selectedSidebar === 1 ? "#f0f0f0" : "#f7f7f7"}] hover:bg-[#f0f0f0] rounded-t-full`}>
                    <img src={chaticon} />
                </div>
                <div onClick={() => setSelectedSidebar(2)} className={`p-3 space-y-4 cursor-pointer bg-[${selectedSidebar === 2 ? "#f0f0f0" : "#f7f7f7"}] hover:bg-[#f0f0f0] rounded-b-full`}>
                    <img src={requestsimg} />
                </div>
            </div>
            <div onClick={handleSignOut} className={`p-3 space-y-4 cursor-pointer bg-[#f7f7f7] hover:bg-[#f0f0f0] rounded-full`}>
                <img src={signout} />
            </div>
        </div>
    )
}