import { auth } from "@/config/firebase"
import { formatTimeAgo } from "@/lib/utils";

export const ChatHistory = ({ isSelected, item, index, handleClick }) => {

    return (
        <div onClick={handleClick} className={`w-full ${isSelected ? "bg-secondaryCHover" : "bg-terciaryC"} rounded-xl cursor-pointer p-3 inline-flex relative space-x-4 hover:bg-secondaryCHover cursor-default mb-1`} key={index}>

            <div className="flex space-x-4 items-center">
                <img src={item?.members[0]?.photoUrl} referrerPolicy="no-referrer" className="w-[50px] h-[50px] rounded-full border-[1px] border-black/20" />
                <div className="inline-flex flex-col space-y-1 justify-center">
                    <p className="text-sm md:text-md text-textColor">{item?.members.map(item => `${item?.display_name}`)}</p>
                    <div className="inline-flex space-x-2 items-center text-secondOrderText">
                        <div className="inline-flex space-x-1">
                            {item?.lastMessageSentBy === auth?.currentUser?.uid && (
                                <p className="text-xs md:text-sm">You:</p>
                            )}
                            <p className="text-xs md:text-sm">{item?.lastMessage?.length > 15 ? item?.lastMessage?.slice(0, 15) + "..." : item?.lastMessage}</p>
                        </div>
                        <p className="text-xs md:text-[13px]">• {formatTimeAgo({ seconds: item?.lastMessageSent?.seconds, nanoseconds: item?.lastMessageSent?.nanoseconds })}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}