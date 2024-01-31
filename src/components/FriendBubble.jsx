import { useState } from "react"
import crosssign from "../../public/cross-sign.png"

export const FriendBubble = ({ removeFriend, r, handleClick }) => {

    const [isHovered, setHover] = useState(false);
    return (
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} key={r?.username} className="flex min-w-[5rem] relative cursor-pointer flex-col justify-center items-center space-y-1">
            {(isHovered && r?.display_name !== "You") && 
                <div onClick={() => removeFriend()} className="fixed flex space-x-4 justify-center items-center top-[100px] z-[1000] p-4 rounded-xl shadow-sm border-[1px] bg-white">
                    <img src={crosssign} className="w-[16px] h-[16px]" />
                    <p className="text-[13px] text-red-700 font-[600]">Remove Friend</p>
                </div>
            }
            <div onClick={handleClick} className="flex flex-col items-end relative">
                <img src={r?.photoUrl} referrerPolicy="no-referrer" className="w-[4rem] h-[4rem] rounded-full" />
                {r?.activityStatus === "online" && <div className="absolute bottom-0 w-[1.2rem] h-[1.2rem] border-[3px] border-white rounded-full bg-red-600"></div>}
            </div>
            <p className="text-xs md:text-[11px]">{r?.display_name}</p>
        </div>
    )
}