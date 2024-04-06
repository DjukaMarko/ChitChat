import { auth } from "../../config/firebase";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Modal from "./Modal";
import { Button } from "./button";
import { useState } from "react";
import { BeatLoader } from "react-spinners";

export const FriendBubble = ({ removeFriend, r, handleClick }) => {
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [isRemovingFriendLoading, setIsRemovingFriendLoading] = useState(false);

    const handleRemovingFriend = () => {
        setIsRemovingFriendLoading(true);
        removeFriend();

        setTimeout(() => {
            setIsRemovingFriendLoading(false);
        }, 1000);
    }
    return (
        <>
            <Modal isShown={isWarningModalOpen} setShown={setIsWarningModalOpen}>
                <div className="relative w-full h-full flex flex-col items-center justify-center space-y-6 px-2 py-8">
                    <p className="text-sm text-center sm:text-base">Are you sure you want to remove {r?.display_name}?</p>
                    <div className="w-full flex flex-col space-y-1 sm:space-y-0 sm:space-x-2 sm:flex-row ">
                        <Button onClick={handleRemovingFriend} className="bg-red-800 text-white grow text-xs sm:text-sm">{isRemovingFriendLoading ? <BeatLoader size={8} color="#fff" /> : "Yes, remove them." }</Button>
                        <Button className="grow text-xs sm:text-sm" variant="secondary" onClick={() => setIsWarningModalOpen(false)}>No, do not.</Button>
                    </div>
                </div>
            </Modal>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div key={r?.username} className={`flex p-2 rounded-lg ${r?.display_name === auth?.currentUser?.displayName && "bg-black/[.03]" } hover:bg-black/10 relative cursor-pointer flex-col items-center justify-center space-y-2`}>
                        <div className="flex flex-col items-end relative">
                            <img src={r?.photoUrl} referrerPolicy="no-referrer" className="w-[60px] min-w-[60px] rounded-full border-[1px] border-black/20" />
                            {r?.activityStatus === "online" && <div className="absolute bottom-0 w-[1.2rem] h-[1.2rem] border-[3px] border-white rounded-full bg-red-800"></div>}
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={` ${r?.display_name === auth?.currentUser?.displayName && "hidden" }`}>
                    <DropdownMenuGroup>
                        <DropdownMenuItem className="p-2" onClick={handleClick}>
                            Start Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-800 font-bold p-2" onClick={() => setIsWarningModalOpen(true)}>
                            Remove Friend
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}