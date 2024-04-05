import { auth } from "../../config/firebase";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const FriendBubble = ({ removeFriend, r, handleClick }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div key={r?.username} className={`flex p-3 rounded-lg ${r?.display_name === auth?.currentUser?.displayName && "bg-black/[.03]" } hover:bg-black/10 relative cursor-pointer flex-col items-center justify-center space-y-2`}>
                    <div className="flex flex-col items-end relative">
                        <img src={r?.photoUrl} referrerPolicy="no-referrer" className="w-12 rounded-full border-[1px] border-black/20" />
                        {r?.activityStatus === "online" && <div className="absolute bottom-0 w-[1.2rem] h-[1.2rem] border-[3px] border-white rounded-full bg-red-800"></div>}
                    </div>
                    <p className="text-xs">{r?.display_name}</p>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={` ${r?.display_name === auth?.currentUser?.displayName && "hidden" }`}>
                <DropdownMenuGroup>
                    <DropdownMenuItem className="p-2" onClick={handleClick}>
                        Start Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-800 font-bold p-2" onClick={() => removeFriend()}>
                        Remove Friend
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}