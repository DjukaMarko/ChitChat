import { auth } from "../config/firebase"


export const ChatHistory = ({ isSelected, formatTimeAgo, item, index, handleClick }) => {
    return (
        <div onClick={handleClick} className={`w-full ${isSelected ? "bg-black/5" : "bg-white"} rounded-xl cursor-pointer p-3 inline-flex relative space-x-4 hover:bg-black/10 cursor-default mb-1`} key={index}>

            <div className="flex space-x-4 items-center">
                <img src={item?.members[0]?.photoUrl} referrerPolicy="no-referrer" className="w-[50px] h-[50px] rounded-full" />
                <div className="inline-flex flex-col space-y-1 justify-center">
                    <p className="text-sm md:text-md">{item?.members.map(item => `${item?.display_name},`)}</p>
                    <div className="inline-flex space-x-2 items-center">
                        <div className="inline-flex space-x-1">
                            {item?.lastMessageSentBy === auth?.currentUser?.uid && (
                                <p className="text-xs md:text-sm text-gray-500">You:</p>
                            )}
                            <p className="text-xs md:text-sm text-gray-500">{item?.lastMessage?.length > 15 ? item?.lastMessage?.slice(0, 15) + "..." : item?.lastMessage}</p>
                        </div>
                        <p className="text-xs md:text-[13px] text-gray-500">• {formatTimeAgo({ seconds: item?.lastMessageSent?.seconds, nanoseconds: item?.lastMessageSent?.nanoseconds })}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}