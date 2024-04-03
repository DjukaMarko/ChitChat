import emptychat from "../../public/undraw_empty_sidebar.svg"
import deleteIcon from "../../public/delete.png"
import hamburger from "../../public/hamburger.png"
import { SearchBar } from "./SearchBar";
import { ChatHistory } from "./ChatHistory";
import { FriendBubble } from "./FriendBubble";
import { isEqual } from "lodash";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import {
    LeadingActions,
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';


export const ChatSidebar = ({ deleteChat, currentGroupId, usersRef, formatTimeAgo, myUserData, removeFriend, myGroups, chats, currentFriends, selectedChat, setActiveChatData, handleChat, setChatOpen, setCurrentGroupId, setSelectedChat }) => {
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
    const trailingActions = () => (
        <TrailingActions>
            <SwipeAction
                destructive={true}
                className="bg-red-700 rounded-xl p-3 mb-1 ml-1 text-white font-bold"
                onClick={() => deleteChat(currentGroupId)}
            >
                <Trash2 color="#fff" className="w-full h-full p-3" />
            </SwipeAction>
        </TrailingActions>
    );

    return (
        <>
            <div className="flex flex-col space-y-6 p-6">
                <div className="w-full flex justify-between items-center">
                    <div className="flex flex-col space-y-1">
                        <p className="text-lg md:text-2xl font-[500]">Chats</p>
                        <p className="text-sm text-gray-400">People, Groups, Messages</p>
                    </div>
                    <div className="cursor-pointer bg-[#f7f7f7] lg:hidden block hover:bg-[#f0f0f0] rounded-full p-2"><img src={hamburger} className="w-[20px] h-[20px]" /></div>
                </div>
                <SearchBar usersRef={usersRef} />
                <div className="flex w-full space-x-1 overflow-x-auto">
                    <FriendBubble r={myUserData} />
                    {myUserData?.friends?.map((r) => (
                        <FriendBubble key={r.userId} removeFriend={() => removeFriend(r.display_name)} r={r} handleClick={() => handleBubble(r)} />
                    ))}
                </div>
            </div>
            <div className="w-full h-[1px] bg-black/5 mb-3"></div>
            <div className="flex items-center flex-col h-full overflow-y-auto overflow-x-hidden px-6">
                {myGroups.length === 0 ?

                    <div className="flex mt-16 flex-col items-center justify-center space-y-6">
                        <img src={emptychat} className="w-32 sm:w-64" />
                        <p className="text-sm text-center max-w-[30ch]">Shhh... Did you hear that? The chat is whispering for some attention. Time to give it a voice!</p>
                    </div>
                    :
                    <AnimatePresence>

                        <SwipeableList>
                            {myGroups.map((item, index) => (
                                <SwipeableListItem
                                trailingActions={trailingActions()}
                            >
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full rounded-lg"
                                >
                                    <ChatHistory
                                        isSelected={isEqual(selectedChat.id, item.id)}
                                        formatTimeAgo={(t) => formatTimeAgo(t)}
                                        item={item}
                                        index={index}
                                        handleClick={() => handleChatByGroupId(item)}
                                    />
                                </motion.div>
                            </SwipeableListItem>
                            ))}
                        </SwipeableList>;
                    </AnimatePresence>
                }
            </div>
        </>
    )
}

//<ChatHistory key={item.id} isSelected={isEqual(selectedChat, item) ? true : false} formatTimeAgo={(t) => formatTimeAgo(t)} item={item} index={index} handleClick={() => handleChatByGroupId(item)} />