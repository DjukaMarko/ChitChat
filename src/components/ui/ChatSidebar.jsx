import emptychat from "../../../public/undraw_empty_sidebar.svg"
import { SearchBar } from "./SearchBar";
import { ChatHistory } from "./ChatHistory";
import { FriendBubble } from "./FriendBubble";
import { isEqual } from "lodash";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, BookUser, LogOut, MessageSquareHeart } from "lucide-react";
import {
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { useContext, useState } from "react";
import { PageContext } from "../misc/PageContext";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { Switch } from "./switch";


export const ChatSidebar = ({
    usersRef,
    removeFriend,
    setActiveChatData,
    setChatOpen,
    setCurrentGroupId,
    setSelectedChat,
    handleChat }) => {
    const { myUserData, myGroups, deleteChat, selectedChat, currentGroupId } = useContext(PageContext);
    const [mode, setMode] = useState("light");

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
    const trailingActions = (id) => {
        return (
            <TrailingActions>
                <SwipeAction
                    destructive={true}
                    className="bg-red-700 rounded-xl p-3 mb-1 ml-1 text-white font-bold"
                    onClick={async () => {
                        await deleteChat(id);
                    }}
                >
                    <Trash2 color="#fff" className="w-full h-full p-3" />
                </SwipeAction>
            </TrailingActions>
        )
    };

    return (
        <div className="relative w-full h-screen-safe flex flex-col">
            <div className="relative top-0 flex flex-col space-y-6 p-4">
                <div className="w-full flex justify-between items-center">
                    <div className="flex flex-col space-y-1">
                        <p className="text-lg md:text-2xl font-[500]">Chats</p>
                        <p className="text-sm text-gray-400">People, Groups, Messages</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Switch
                            checked={mode === 'light'}
                            onCheckedChange={() => setMode(mode === 'light' ? 'dark' : 'light')}
                        />
                        <DarkModeSwitch
                            checked={mode === 'dark'}
                            moonColor="#000"
                            sunColor="#991b1b"
                            onChange={(checked) => setMode(checked ? 'dark' : 'light')}
                            size={20}
                        />
                    </div>
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
            <div className="h-full flex flex-col items-center overflow-y-scroll px-4">
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
                                    key={item.id}
                                    trailingActions={trailingActions(item.id)}
                                >
                                    <motion.div
                                        initial={{ x: -100 }}
                                        animate={{ x: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.1 }}
                                        className="w-full rounded-lg"
                                    >
                                        <ChatHistory
                                            isSelected={isEqual(selectedChat.id, item.id) || (myGroups.length === 1 && currentGroupId === item.id)}
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
            <div className="md:hidden w-full border-t-[1px] border-black/5 flex">
                <div className="flex justify-center items-center h-full grow bg-black/5 hover:bg-black/10 p-3 border-t-[2px] border-red-800"><MessageSquareHeart color="#991b1b" /></div>
                <div className="flex justify-center items-center h-full grow hover:bg-black/10 p-3"><BookUser /></div>
                <div className="flex justify-center items-center h-full grow hover:bg-black/10 p-3"><LogOut /></div>
            </div>
        </div>
    )
}
