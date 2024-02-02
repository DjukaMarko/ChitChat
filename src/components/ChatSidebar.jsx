import { auth } from "../config/firebase";
import emptychat from "../../public/undraw_empty_sidebar.svg"
import hamburger from "../../public/hamburger.png"
import { SearchBar } from "./SearchBar";
import { ChatHistory } from "./ChatHistory";
import { FriendBubble } from "./FriendBubble";
import { isEqual } from "lodash";
import { useEffect } from "react";


export const ChatSidebar = ({ usersRef, formatTimeAgo, deleteChat, removeFriend, chats, currentFriends, selectedChat, setActiveChatData, handleChat, setChatOpen, setCurrentGroupId, setSelectedChat}) => {
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
            <div className="flex flex-col space-y-6 p-5">
                <div className="w-full flex justify-between">
                    <p className="text-lg md:text-2xl font-[500]">Chats</p>
                    <div className="cursor-pointer bg-[#f7f7f7] lg:hidden block hover:bg-[#f0f0f0] rounded-full p-2"><img src={hamburger} className="w-[20px] h-[20px]" /></div>
                </div>
                <SearchBar usersRef={usersRef} />
                <div className="flex w-full min-h-[6rem] space-x-6 overflow-x-auto">
                    <FriendBubble r={{ username: auth?.currentUser?.displayName, photoUrl: auth?.currentUser?.photoURL, activityStatus: "online", display_name: "You" }} />
                    {currentFriends.map((r) => (
                        <FriendBubble key={r?.userId} removeFriend={() => removeFriend(r?.display_name)} r={r} handleClick={() => handleBubble(r)} />
                    ))}
                </div>
            </div>
            <div className="flex items-center flex-col space-y-1 h-full overflow-y-auto mt-2 p-5 border-t-[1px]">
                {chats.length == 0 && <div className="flex mt-16 flex-col items-center justify-center space-y-6">
                    <img src={emptychat} className="w-[128px] h-[128px]" />
                    <p className="text-sm text-center max-w-[50ch] font-[400] tracking-wider">Shhh... Did you hear that? The chat is whispering for some attention. Time to give it a voice!</p>
                </div>
                }
                {chats.length > 0 && chats.map((item, index) => (
                    <ChatHistory key={item.id} deleteChat={(id) => deleteChat(id)} isSelected={isEqual(selectedChat, item) ? true : false} formatTimeAgo={(t) => formatTimeAgo(t)} item={item} index={index} handleClick={() => handleChatByGroupId(item)} />
                ))}
            </div>
        </>
    )
}