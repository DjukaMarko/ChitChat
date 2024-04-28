import { useContext, useEffect, useRef, useState } from "react";
import { auth, db, storage } from "@/config/firebase"
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import newchat from "@/../public/newchat.svg"
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, increment, limit, onSnapshot, orderBy, query, runTransaction, updateDoc, where } from "firebase/firestore";
import { serverTimestamp as firestoreTimestamp } from "firebase/firestore";
import { BeatLoader } from "react-spinners";
import { ChatMessage } from "./ChatMessage";
import { motion } from "framer-motion";
import emptylist from "@/../public/404illustration.svg"
import surprisedImage from "@/../public/surprised.svg"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, CirclePlus, ContactRound, Ellipsis, Images, Paperclip, SendHorizontal, Trash, UserRoundPlus, X } from "lucide-react";
import { PageContext } from "../misc/PageContext";
import Modal from "./Modal";
import { Button } from "./button";
import WarningModalPrint from "./WarningModalPrint";
import { hasOnlyBlankSpaces } from "@/lib/utils";
import { ThemeProvider } from "../misc/ThemeProvider";
import ShortUniqueId from "short-unique-id";


export const ChatBox = ({ hideChat }) => {

    const { activeChatData, deleteChat } = useContext(PageContext);
    if (Object.keys(activeChatData).length === 0) return;

    const { themeMode } = useContext(ThemeProvider);
    const [loadMoreDocs, setLoadMoreDocs] = useState(1);
    const [text, setText] = useState([]);
    const [textValue, setTextValue] = useState("");
    const [fileUploadInput, setFileUploadInput] = useState("");
    const [isMessageSending, setMessageSending] = useState(false);
    const [isMessageLoading, setMessageLoading] = useState(true);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [isDeletingChatLoading, setIsDeletingChatLoading] = useState(false);
    const [memberListWindow, setMemberListWindow] = useState(false);
    const [addMemberWindow, setMemberWindow] = useState(false);

    const isGroup = activeChatData.members.length > 1;
    const members = activeChatData.members;
    const chatLength = activeChatData.numMessages;

    const scrollContainerRef = useRef();

    useEffect(() => {
        setText([]);
        setLoadMoreDocs(1);
    }, [activeChatData]);

    useEffect(() => {
        if (fileUploadInput === "") return;

        let sendFiles = async () => {
            await sendMessage();
        };
        sendFiles();
    }, [fileUploadInput]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const storageRef = ref(storage, `${activeChatData.id}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on("state_changed",
            (snapshot) => {
                const progress =
                    Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            },
            (error) => {
                console.error(error)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    setTextValue(downloadURL);
                    setFileUploadInput(downloadURL);
                });
            }
        );
    };

    const handleAttachClick = (e) => {
        e.preventDefault();
        const attachedFile = document.getElementById('fileInput1');
        attachedFile.click();
    };

    const handleImageUploadClick = (e) => {
        e.preventDefault();
        const attachedImage = document.getElementById('fileInput2');
        attachedImage.click();
    };


    useEffect(() => {
        if (scrollContainerRef.current) {
            const scrollContainer = scrollContainerRef.current;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [activeChatData]);

    useEffect(() => {
        setMessageLoading(true);
        let threshold = (loadMoreDocs * 20);

        const subcollectionRef = collection(doc(db, "groups", activeChatData.id), "messages");
        const orderedQuery = query(subcollectionRef, orderBy('sentAt', 'desc'), limit(threshold));
        const unsubscribe = onSnapshot(orderedQuery, (querySnapshot) => {
            setText([]);
            querySnapshot.forEach(async (doc) => {
                setText(prevText => [...prevText, doc.data()])
            });
            setMessageLoading(false);
        });

        return () => unsubscribe();
    }, [activeChatData, loadMoreDocs]);


    const buttonSendClick = async (e) => {
        e.preventDefault();
        await sendMessage();
    }

    const sendMessage = async () => {
        if (textValue === "" || hasOnlyBlankSpaces(textValue)) return;
        setMessageSending(true);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }

        setText(prevText => [{ sentBy: auth.currentUser.uid, message: textValue }, ...prevText]);

        await updateDoc(doc(db, "users", auth.currentUser.uid), {
            groups: arrayUnion(activeChatData.id),
        })
        await Promise.all(members.map(async item => {
            try {
                const otherUser = await getDocs(query(
                    collection(db, "users"),
                    where('display_name', '==', item.display_name)
                ));

                if (otherUser.docs.length > 0) {
                    if (otherUser.docs[0].data().groups.indexOf(activeChatData.id) === -1) {
                        await updateDoc(doc(db, "users", otherUser.docs[0].data().userId), {
                            groups: arrayUnion(activeChatData.id)
                        })
                    }
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        }));

        await updateDoc(doc(db, "groups", activeChatData.id), {
            lastMessage: textValue,
            lastMessageSent: firestoreTimestamp(),
            lastMessageSentBy: auth.currentUser.uid,
            numMessages: increment(1),
        })


        const messageRef = collection(doc(db, "groups", activeChatData.id), "messages");

        addDoc(messageRef, {
            message: textValue,
            sentAt: firestoreTimestamp(),
            sentBy: auth.currentUser.uid
        });

        setTextValue("");

        setMessageSending(false);

    }

    const addText = (e) => {
        setTextValue(e.target.value);
    }

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        const scrolledFromTop = container.scrollTop;
        const maxScrollHeight = container.scrollHeight - container.clientHeight;

        if ((Math.abs(scrolledFromTop)) >= maxScrollHeight - 2) {

            setLoadMoreDocs(prevDocs => {
                if ((prevDocs * 20) >= chatLength) return prevDocs;
                else return prevDocs + 1;
            });
        }
    };

    const leaveGroup = async () => {
        let myData = await getDoc(doc(db, "users", auth.currentUser.uid));
        let newMembers = members.filter(el => el.userId !== myData.data().userId).map(el => el.userId);
        await updateDoc(doc(db, "groups", activeChatData.id), {
            members: newMembers,
        })
        deleteChat(activeChatData.id);

    }
    const handleChatDelete = async () => {
        setIsDeletingChatLoading(true);
        if (members.length > 1) leaveGroup(); else deleteChat(activeChatData.id);
        setIsDeletingChatLoading(false);
        setIsWarningModalOpen(false);
    }

    return (
        <>
            <Modal isShown={isWarningModalOpen} setShown={setIsWarningModalOpen}>
                <WarningModalPrint
                    image={surprisedImage}
                    executedFunc={handleChatDelete}
                    isShown={isWarningModalOpen}
                    setShown={setIsWarningModalOpen}
                    isLoading={isDeletingChatLoading}
                    confirmText="Yes, leave/delete it."
                    cancelText="No, do not."
                    text={`Are you sure you want to delete the chat/leave the group?`}
                />
            </Modal>

            <motion.div
                key="chatbox"
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                exit={{ x: -100 }}
                transition={{ duration: 0.1 }}
                className="w-full h-[calc(100dvh)] relative flex flex-col">
                <div className="relative w-full border-b-[1px] border-secondaryC z-[2]">
                    <Modal isShown={addMemberWindow} setShown={setMemberWindow}>
                        <ModalAddMember setShown={setMemberWindow} />
                    </Modal>
                    <Modal isShown={memberListWindow} setShown={setMemberListWindow}>
                        <ModalListMembers setShown={setMemberWindow} />
                    </Modal>
                    <div className="flex items-center justify-between p-4 sm:p-5">
                        <div className="flex items-center">
                            <ChevronLeft color={themeMode === "dark" ? "#ffffff" : "#000000"} onClick={hideChat} className="md:hidden cursor-pointer mr-4" />
                            <>
                                {isGroup ?
                                    <div className="flex -space-x-6 items-center mr-4">
                                        <img src={members[0]?.photoUrl} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full border-[1px] border-black/20" />
                                        <img src={members[1]?.photoUrl} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border-[1px] border-black/20" />
                                    </div>
                                    :
                                    <img src={members[0]?.photoUrl} referrerPolicy="no-referrer" className="w-10 mr-4 rounded-full border-[1px] border-black/20" />
                                }
                                <div className="flex flex-col space-y-1 text-textColor">
                                    <p className="text-sm">{isGroup ? activeChatData.group_name : members[0].display_name}</p>
                                    <p className="text-xs">{!isGroup && members[0].activityStatus}</p>
                                </div>
                            </>
                        </div>
                        <div className="p-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Ellipsis color={themeMode === "dark" ? "#ffffff" : "#000000"} className="cursor-pointer" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className={`m-2 w-40 ${themeMode === "dark" ? "dark" : "light"} border-secondaryC bg-backgroundTheme`}>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => setMemberListWindow(true)} className="w-full flex justify-between items-center cursor-pointer text-textColor">
                                            <ContactRound className="w-5" />
                                            <p>View Members</p>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setMemberWindow(true)} className="w-full flex justify-between items-center cursor-pointer text-textColor">
                                            <UserRoundPlus className="w-5" />
                                            <p>Add Members</p>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsWarningModalOpen(true)} className="w-full flex justify-between items-center cursor-pointer">
                                            <Trash color="#b91c1c" className="w-5" />
                                            <p className="text-primaryCHover font-bold">{members.length > 1 ? "Leave Group" : "Delete Chat"}</p>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    {isMessageLoading &&
                        <div className="absolute bg-backgroundTheme border-t-[1px] border-secondaryC p-2 w-full flex justify-center items-center">
                            <BeatLoader size={10} color="#c91e1e" />
                        </div>
                    }
                </div>
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="w-full h-[calc(100dvh)] overflow-y-scroll scrollbar-hide flex flex-col-reverse py-6">
                    {members.length > 0 && text.map((m, index) => {
                        return <ChatMessage key={index} side={m.sentBy == auth.currentUser.uid ? 1 : 2} text={text} m={m} index={index} isMessageSending={isMessageSending} />
                    })}
                    <div className={`w-full flex justify-center`}>
                        {(loadMoreDocs * 20) >= chatLength && !isMessageLoading && (
                            <div className="flex flex-col items-center justify-center p-6">
                                <img src={newchat} className="w-48 h-48 sm:w-64 sm:h-64" />
                                <p className="text-sm md:text-md text-center text-textColor">Welcome to the conversation! Write something down to start the convo.</p>
                            </div>
                        )}
                    </div>

                </div>
                <div className="w-full border-t-[1px] border-secondaryC px-6 py-3 flex space-x-4">
                    <form className="flex space-x-6 items-center w-full">
                        <motion.a whileHover={{ scale: 1.05 }} className="cursor-pointer" onClick={handleAttachClick}>
                            <Paperclip width={20} height={20} color="#b91c1c" />
                        </motion.a>
                        <motion.a whileHover={{ scale: 1.05 }} className="cursor-pointer" onClick={handleImageUploadClick}>
                            <Images width={20} height={20} color="#b91c1c" />
                        </motion.a>
                        <input id="fileInput1" type="file" onChange={handleFileUpload} className="hidden" />
                        <input id="fileInput2" type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
                        <input value={textValue} onChange={addText} type="text" className="text-xs md:text-sm text-textColor py-2 bg-secondaryC hover:bg-secondaryCHover placeholder-inputInnerElements rounded-full px-5 w-full outline-0" placeholder="Type message here" />
                        <motion.button whileHover={{ scale: 1.05 }} type="submit" onClick={buttonSendClick}><SendHorizontal width={20} height={20} color="#b91c1c" /></motion.button>
                    </form>
                </div>
            </motion.div>
        </>
    )
}
const ModalListMembers = ({ setShown }) => {
    const { myUserData, activeChatData } = useContext(PageContext);
    const members = [myUserData, ...activeChatData.members];


    return (
        <div className="w-full h-full flex flex-col space-y-4">
            <div>
                <p className="text-textColor text-lg sm:text-2xl">List of all members</p>
                <div className="w-full h-[1px] bg-secondaryC mt-2"></div>
            </div>
            <div className="w-full h-full overflow-y-scroll scrollbar-hide flex flex-col space-y-1">
                {members.length <= 1 ?
                    <div className="w-full p-6 h-full flex flex-col justify-center items-center space-y-6 text-textColor">
                        <img src={emptylist} className="w-28" />
                        <div className="flex flex-col justify-center items-center text-sm">
                            <p className="font-[400] tracking-wide">Oops, it's too quiet in here! &#x1F60E;</p>
                            <p className="font-[400] tracking-wide">Let's add some friends first!</p>
                        </div>
                        <Button className="bg-red-800 hover:bg-red-700 text-white" onClick={() => setShown(false)}>Close</Button>
                    </div>
                    :
                    members.map(item => (
                        <div key={item.userId} className="w-full flex justify-between items-center text-textColor hover:bg-secondaryCHover cursor-pointer p-1 rounded-xl">
                            <div className="flex space-x-4 items-center">
                                <img src={item?.photoUrl} referrerPolicy="no-referrer" className="w-10 rounded-full" />
                                <p className="text-xs sm:text-sm">{item.display_name}</p>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    )
}

const ModalAddMember = ({ setShown }) => {
    const { myUserData, activeChatData } = useContext(PageContext);
    const members = activeChatData.members;

    const handleAddMember = async (item, index) => {
        if (!item || item.userId === undefined) return;

        await updateDoc(doc(db, "groups", activeChatData.id), {
            members: arrayUnion(item.userId)
        });

        await updateDoc(doc(db, "users", item.userId), {
            groups: arrayUnion(activeChatData.id),
        })
    }

    let checkIfExists = (item, index) => {
        if (!item || item.display_name === undefined) return;
        for (let i = 0; i < members.length; i++) {
            if (members[i].display_name === item.display_name) return true;
        }
        return false;
    }

    return (
        <div className="w-full h-full flex flex-col space-y-4">
            <div>
                <p className="text-textColor text-lg sm:text-2xl">Add members</p>
                <div className="w-full h-[1px] bg-secondaryC mt-2"></div>
            </div>
            <div className="overflow-y-scroll scrollbar-hide flex flex-col space-y-1">
                {myUserData?.friends?.filter((item, index) => !checkIfExists(item, index)).length === 0 ? (
                    <div className="w-full p-6 h-full flex flex-col justify-center items-center space-y-6 text-textColor">
                        <img src={emptylist} className="w-28" />
                        <div className="flex flex-col justify-center items-center text-sm">
                            <p className="font-[400] tracking-wide">Oops, it's too quiet in here! &#x1F60E;</p>
                            <p className="font-[400] tracking-wide">Let's add some friends first!</p>
                        </div>
                        <Button className="bg-red-800 hover:bg-red-700 text-white" onClick={() => setShown(false)}>Close</Button>
                    </div>
                ) : (
                    myUserData?.friends?.filter((item, index) => !checkIfExists(item, index)).map((item, index) => (
                        <div key={item?.userId} className="w-full flex justify-between items-center text-textColor hover:bg-secondaryCHover cursor-pointer p-1 rounded-xl">
                            <div className="flex space-x-4 items-center">
                                <img src={item?.photoUrl} referrerPolicy="no-referrer" className="w-10 rounded-full" />
                                <p className="text-xs sm:text-sm">{item?.display_name}</p>
                            </div>
                            <button onClick={(event) => {
                                handleAddMember(item, index)
                                event.currentTarget.disabled = true;
                            }} className="disabled:cursor-not-allowed disabled:opacity-50"><CirclePlus size={22} /></button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}