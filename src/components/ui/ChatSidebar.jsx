import emptychat from "@/../public/undraw_empty_sidebar.svg"
import { SearchBar } from "./SearchBar";
import { ChatHistory } from "./ChatHistory";
import { FriendBubble } from "./FriendBubble";
import { AnimatePresence, motion } from "framer-motion";
import { Smile, Trash2 } from "lucide-react";
import {
    LeadingActions,
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { useContext, useRef } from "react";
import { PageContext } from "../misc/PageContext";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { Switch } from "./switch";
import { useDraggable } from "react-use-draggable-scroll";
import { ThemeProvider } from "../misc/ThemeProvider";


export const ChatSidebar = ({

    usersRef,
    removeFriend,
    setActiveChatData,
    setChatOpen,
    setCurrentGroupId,
    handleChat

    }) => {
    const { myUserData, myGroups, currentGroupId, deleteChat } = useContext(PageContext);
    const { themeMode, handleChangeThemeMode } = useContext(ThemeProvider);

    const ref = useRef(); // We will use React useRef hook to reference the wrapping div:
    const { events } = useDraggable(ref);

    const handleBubble = (r) => {
        setActiveChatData([r]);
        handleChat(r?.display_name);
    }

    const handleChatByGroupId = async (item) => {
        setCurrentGroupId(item.id);
        setActiveChatData(item.members);
        setChatOpen(true);
    }

    const leadingActions = () => (
        <LeadingActions>
             <SwipeAction
                    className="bg-yellow-500 rounded-xl p-3 mb-1 ml-1 text-white font-bold"
                    onClick={() => {}}
                >
                    <Smile color="#fff" className="w-full h-full p-3" />
                </SwipeAction>
        </LeadingActions>
    );

    const trailingActions = (id) => {
        return (
            <TrailingActions>
                <SwipeAction
                    destructive={true}
                    className="bg-red-700 rounded-xl p-3 mb-1 ml-1 text-white font-bold"
                    onClick={async () => await deleteChat(id)}
                >
                    <Trash2 color="#fff" className="w-full h-full p-3" />
                </SwipeAction>
            </TrailingActions>
        )
    };

    return (
        <>
            <div className="relative top-0 left-0 right-0 flex flex-col space-y-6 pb-4">
                <div className="w-full flex justify-between items-center">
                    <div className="flex flex-col space-y-1">
                        <p className="text-textColor text-lg md:text-2xl font-[500]">Chats</p>
                        <p className="text-sm text-secondOrderText text-gray-500">People, Groups, Messages</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Switch
                            checked={themeMode === 'light'}
                            onCheckedChange={() => handleChangeThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                        />
                        <DarkModeSwitch
                            checked={themeMode === 'dark'}
                            moonColor="#fff"
                            sunColor="#991b1b"
                            onChange={(checked) => handleChangeThemeMode(checked ? 'dark' : 'light')}
                            size={20}
                        />
                    </div>
                </div>
                <SearchBar usersRef={usersRef} />
                <div {...events} ref={ref} className="flex w-full space-x-1 overflow-x-scroll scrollbar-hide">
                    <FriendBubble r={myUserData} />
                    {myUserData?.friends?.map((r) => (
                        <FriendBubble key={r.userId} removeFriend={() => removeFriend(r.display_name)} r={r} handleClick={() => handleBubble(r)} />
                    ))}
                </div>
            </div>
            <div className="w-full h-[1px] bg-secondaryC mb-3"></div>
            <div className="w-full min-h-[24rem] flex flex-col items-center overflow-y-scroll scrollbar-hide">
                {myGroups.length === 0 ?

                    <div className="flex mt-16 flex-col items-center justify-center space-y-6">
                        <img src={emptychat} className="w-32 sm:w-64" />
                        <p className="text-sm text-center text-textColor max-w-[30ch]">Shhh... Did you hear that? The chat is whispering for some attention. Time to give it a voice!</p>
                    </div>
                    :
                    <AnimatePresence>

                        <SwipeableList fullSwipe={false}>
                            {myGroups.map((item, index) => (
                                <SwipeableListItem
                                    key={item.id}
                                    leadingActions={leadingActions()}
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
                                            isSelected={currentGroupId === item.id}
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
