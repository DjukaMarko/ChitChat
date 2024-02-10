import { auth } from "../config/firebase";
import emptychat from "../../public/undraw_empty_sidebar.svg"
import hamburger from "../../public/hamburger.png"
import { SearchBar } from "./SearchBar";
import { ChatHistory } from "./ChatHistory";
import { FriendBubble } from "./FriendBubble";
import { isEqual } from "lodash";
import { useEffect } from "react";


export const ChatSidebar = ({ usersRef, formatTimeAgo, myUserData, removeFriend, myGroups, chats, currentFriends, selectedChat, setActiveChatData, handleChat, setChatOpen, setCurrentGroupId, setSelectedChat }) => {
    const handleBubble = (r) => {
        setActiveChatData([r]);
        handleChat(r?.display_name);
    }

    const handleChatByGroupId = async (item) => {
        setCurrentGroupId(item.id);
        setSelectedChat(item);
        setActiveChatData(item.members);
        setChatOpen(true);
    }

    return (
        <>
            <div className="flex flex-col space-y-6 px-5 py-2">
                <div className="w-full flex justify-between items-center">
                    <div className="flex flex-col space-y-1">
                        <p className="text-lg md:text-2xl font-[500]">Chats</p>
                        <p className="text-sm text-gray-400">People, Groups, Messages</p>
                    </div>
                    <div className="cursor-pointer bg-[#f7f7f7] lg:hidden block hover:bg-[#f0f0f0] rounded-full p-2"><img src={hamburger} className="w-[20px] h-[20px]" /></div>
                </div>
                <SearchBar usersRef={usersRef} />
                <div className="flex w-full min-h-[5rem] space-x-2 overflow-x-auto">
                    <FriendBubble r={myUserData} />
                    {myUserData?.friends?.map((r) => (
                        <FriendBubble key={r.userId} removeFriend={() => removeFriend(r.display_name)} r={r} handleClick={() => handleBubble(r)} />
                    ))}
                </div>
            </div>
            <div className="flex items-center flex-col h-full overflow-y-auto px-1 py-4">
                {myGroups.length === 0 ?

                    <div className="flex mt-16 flex-col items-center justify-center space-y-6">
                        <img src={emptychat} className="w-24" />
                        <p className="text-sm text-center max-w-[30ch]">Shhh... Did you hear that? The chat is whispering for some attention. Time to give it a voice!</p>
                    </div>
                    :
                    myGroups.map((item, index) => (
                        <ChatHistory key={item.id} isSelected={isEqual(selectedChat.id, item.id) ? true : false} formatTimeAgo={(t) => formatTimeAgo(t)} item={item} index={index} handleClick={() => handleChatByGroupId(item)} />
                    ))
                }
            </div>
        </>
    )
}

//<ChatHistory key={item.id} isSelected={isEqual(selectedChat, item) ? true : false} formatTimeAgo={(t) => formatTimeAgo(t)} item={item} index={index} handleClick={() => handleChatByGroupId(item)} />