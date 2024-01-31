import { useState } from "react";
import { auth } from "../config/firebase"


export const ChatHistory = ({ isSelected, formatTimeAgo, deleteChat, item, index, handleClick }) => {
    const [isHovered, setHover] = useState(false);
    return (
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className={`w-full ${isSelected ? "bg-[#f7f7f7]" : ""} rounded-xl cursor-pointer p-2 inline-flex relative space-x-4 hover:bg-[#f0f0f0] cursor-default`} key={index}>
            {(isHovered) &&
                <div onClick={() => deleteChat(item?.id)} className="absolute rounded-full right-1 flex justify-center items-center z-[1000000] w-[150px] h-[50px] border-[1px] bg-white">
                    <p className="text-xs font-[600] tracking-wide text-red-700">Delete Chat?</p>
                </div>
            }

            <div onClick={handleClick} className="flex space-x-4 items-center">
                <img src={item?.members[0]?.photoUrl} referrerPolicy="no-referrer" className="w-[50px] h-[50px] rounded-full" />
                <div className="inline-flex flex-col justify-center">
                    <p className="text-sm md:text-md">{item?.members[0]?.display_name}</p>
                    <div className="inline-flex space-x-2 items-center">
                        <div className="inline-flex space-x-1">
                            {item?.lastMessageSentBy === auth?.currentUser?.uid && (
                                <p className="text-xs md:text-sm text-gray-500">You:</p>
                            )}
                            <p className="text-xs md:text-sm text-gray-500">{item?.lastMessage?.length > 15 ? item?.lastMessage?.slice(0, 15) + "..." : item?.lastMessage}</p>
                        </div>
                        <p className="text-xs md:text-[13px] text-gray-500">{formatTimeAgo({ seconds: item?.lastMessageSent?.seconds, nanoseconds: item?.lastMessageSent?.nanoseconds })}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}