import { auth } from "../config/firebase"


export const ChatHistory = ({ formatTimeAgo, item, index, handleClick }) => {

    return (
        <div onClick={handleClick} className="w-full rounded-md p-2 flex space-x-4 hover:bg-gray-200 cursor-default" key={index}>
            <img src={item.members[0].photoUrl} className="w-[50px] h-[50px] rounded-full" />
            <div className="flex flex-col justify-center">
                {item.members.length > 1 ? <p>Group</p> : <p className="text-sm md:text-md">{item.members[0].display_name}</p>}
                <div className="flex space-x-2 items-center">
                    <div className="flex space-x-1">
                        {item.lastMessageSentBy === auth?.currentUser?.uid && (
                            <p className="text-xs md:text-sm text-gray-500">You:</p>
                        )}
                        <p className="text-xs md:text-sm text-gray-500">{item.lastMessage.length > 15 ? item.lastMessage.slice(0, 15) + "..." : item.lastMessage}</p>
                    </div>
                    <p className="text-xs md:text-[13px] text-gray-500">{formatTimeAgo({ seconds: item?.lastMessageSent?.seconds, nanoseconds: item?.lastMessageSent?.nanoseconds })}</p>
                </div>
            </div>
        </div>
    )
}