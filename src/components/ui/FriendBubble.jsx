import { auth } from "@/config/firebase";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Modal from "./Modal";
import { useContext, useState } from "react";
import WarningModalPrint from "./WarningModalPrint";
import surprisedImage from "@/../public/surprised.svg";
import { ThemeProvider } from "../misc/ThemeProvider";

export const FriendBubble = ({ removeFriend, r, handleClick }) => {
    const { themeMode } = useContext(ThemeProvider);
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
                <WarningModalPrint
                    image={surprisedImage}
                    executedFunc={handleRemovingFriend}
                    isShown={isWarningModalOpen}
                    setShown={setIsWarningModalOpen}
                    isLoading={isRemovingFriendLoading}
                    confirmText="Yes, remove them."
                    cancelText="No, do not."
                    text={`Are you sure you want to remove ${r?.display_name}?`}
                />
            </Modal>
            <div key={r?.username} className={`flex p-2 rounded-lg ${r?.display_name === auth?.currentUser?.displayName && "bg-secondaryCHover"} hover:bg-secondaryCHover relative cursor-pointer flex-col items-center justify-center space-y-2`}>
                <div className="flex flex-col items-end relative">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <img src={r?.photoUrl} referrerPolicy="no-referrer" className="w-[60px] min-w-[60px] rounded-full border-[1px] border-borderColor" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className={` ${r?.display_name === auth?.currentUser?.displayName && "hidden"} ${themeMode === "dark" ? "dark" : "light"} bg-backgroundTheme border-secondaryC`}>
                            <DropdownMenuGroup>
                                <DropdownMenuItem className="text-textColor p-2" onClick={handleClick}>
                                    Start Chat
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-primaryCHover font-bold p-2" onClick={() => setIsWarningModalOpen(true)}>
                                    Remove Friend
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {r?.activityStatus === "online" && <div className="absolute bottom-0 w-[1.2rem] h-[1.2rem] border-[3px] border-backgroundTheme rounded-full bg-red-800"></div>}
                </div>
            </div>
        </>
    )
}