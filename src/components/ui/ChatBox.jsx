import { useContext, useEffect, useRef, useState } from "react";
import { auth, db, storage } from "../../config/firebase"
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import newchat from "../../../public/newchat.svg"
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, increment, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { serverTimestamp as firestoreTimestamp } from "firebase/firestore";
import { BeatLoader } from "react-spinners";
import moment from "moment";
import { ChatMessage } from "./ChatMessage";
import { AnimatePresence, motion } from "framer-motion";
import emptylist from "../../../public/404illustration.jpg"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, CirclePlus, Ellipsis, Images, Paperclip, SendHorizontal, Trash2, UserRoundPlus } from "lucide-react";
import { PageContext } from "../misc/PageContext";
import Modal from "./Modal";
import { Button } from "./button";


export const ChatBox = ({ setMemberListWindow, hideChat, isChatOpened }) => {
    const { activeChatData, deleteChat, currentGroupId, memberListWindow } = useContext(PageContext);

    const [loadMoreDocs, setLoadMoreDocs] = useState(0);
    const [text, setText] = useState([]);
    const [textValue, setTextValue] = useState("");
    const [fileUploadInput, setFileUploadInput] = useState("");
    const [isMessageSending, setMessageSending] = useState(false);
    const [currentMembers, setMembers] = useState([]);
    const [isMessageLoading, setMessageLoading] = useState(true);
    const [chatLength, setChatLength] = useState(0);

    const scrollContainerRef = useRef();

    useEffect(() => {
        if (!currentGroupId) return;

        let setGroupData = async () => {
            let fetchData = await getDoc(doc(db, "groups", currentGroupId));
            setChatLength(fetchData.data().numMessages || 0);
        }

        setGroupData();
    }, [currentGroupId]);

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

        const storageRef = ref(storage, `${currentGroupId}/${file.name}`);
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
        let fetchMembers = async () => {
            if (currentGroupId) {
                let q = query(collection(db, "groups"), where("id", "==", currentGroupId));
                let groupData = await getDocs(q);

                groupData.docs[0].data().members.map(async (m) => {
                    let userData = await getDocs(query(collection(db, "users"), where("userId", "==", m)));
                    setMembers(prevMember => [...prevMember, userData.docs[0].data()]);
                })
            }
        }

        if (currentGroupId === "") return;
        let threshold = 20 + (loadMoreDocs * 20);

        fetchMembers();

        const subcollectionRef = collection(doc(db, "groups", currentGroupId), "messages");
        const orderedQuery = query(subcollectionRef, orderBy('sentAt', 'desc'), limit(threshold));
        const unsubscribe = onSnapshot(orderedQuery, (querySnapshot) => {
            setText([]);
            querySnapshot.forEach(async (doc) => {
                setText(prevText => [...prevText, doc.data()])
            });
            setMessageLoading(false);
        });

        return () => unsubscribe();
    }, [currentGroupId, loadMoreDocs, chatLength]);




    const buttonSendClick = async (e) => {
        e.preventDefault();
        await sendMessage();
    }

    const hasOnlyBlankSpaces = (str) => {
        const regex = /^\s*$/;
        return regex.test(str);
    }


    const sendMessage = async () => {
        if (textValue === "" || hasOnlyBlankSpaces(textValue)) return;
        setMessageSending(true);
        setText(prevText => [{ sentBy: auth?.currentUser?.uid, message: textValue }, ...prevText]);

        await updateDoc(doc(db, "users", auth?.currentUser?.uid), {
            groups: arrayUnion(currentGroupId),
        })

        await Promise.all(activeChatData.map(async item => {
            try {
                const otherUser = await getDocs(query(
                    collection(db, "users"),
                    where('display_name', '==', item.display_name)
                ));

                if (otherUser.docs.length > 0) {
                    if (otherUser.docs[0].data().groups.indexOf(currentGroupId) === -1) {
                        await updateDoc(doc(db, "users", otherUser.docs[0].data().userId), {
                            groups: arrayUnion(currentGroupId)
                        })
                    }
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        }));

        await updateDoc(doc(db, "groups", currentGroupId), {
            lastMessage: textValue,
            lastMessageSent: firestoreTimestamp(),
            lastMessageSentBy: auth?.currentUser?.uid,
            numMessages: increment(1),
        })


        const messageRef = collection(doc(db, "groups", currentGroupId), "messages");

        addDoc(messageRef, {
            message: textValue,
            sentAt: firestoreTimestamp(),
            sentBy: auth?.currentUser?.uid
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
                if ((prevDocs * 20 + 20) >= chatLength) return prevDocs;
                else return prevDocs + 1;
            });
        }
    };

    const leaveGroup = async () => {
        let groupData = await getDoc(doc(db, "groups", currentGroupId));
        let myData = await getDoc(doc(db, "users", auth?.currentUser?.uid));
        let newMembers = groupData.data().members.filter(el => el !== myData.data().userId);
        await updateDoc(doc(db, "groups", currentGroupId), {
            members: newMembers,
        })
        deleteChat(currentGroupId);

    }

    const isDifference = (obj1, obj2, textLength, index) => {
        if (obj1 === undefined || obj2 === undefined) return;

        const timestamp1 = moment.unix(obj1?.sentAt?.seconds);
        const timestamp2 = moment.unix(obj2?.sentAt?.seconds);

        const timeDifference = Math.abs(timestamp2.diff(timestamp1, 'minutes'));

        if (timeDifference > 15 || index === textLength - 1) {
            return true;
        }

        return false;
    }

    const compareTimestamps = (obj1, obj2) => {
        const timestamp1 = moment.unix(obj1?.sentAt?.seconds);
        const timestamp2 = moment.unix(obj2?.sentAt?.seconds);
        const now = moment();

        // Get the object with the latest timestamp
        const latestObject = timestamp1.isAfter(timestamp2) ? obj1 : obj2;
        const latestTimestamp = moment.unix(latestObject?.sentAt?.seconds);

        // Check if the latest timestamp is today
        if (latestTimestamp.isSame(now, 'day')) {
            // Return hours and minutes
            return latestTimestamp.format("h:mm A");
        }

        // Check if the latest timestamp is yesterday
        if (latestTimestamp.isSame(now.clone().subtract(1, 'day'), 'day')) {
            // Return 'Yesterday' with hours and minutes
            return "Yesterday, " + latestTimestamp.format("h:mm A");
        }

        // Return the whole date
        return latestTimestamp.format("MMM DD, h:mm A");
    }

    const returnTimestampFirstMessage = (obj1) => {
        const timestamp = moment.unix(obj1?.sentAt?.seconds);
        const now = moment();

        // Check if the timestamp is today
        if (timestamp.isSame(now, 'day')) {
            // Return hours and minutes
            return timestamp.format("h:mm A");
        }

        // Check if the timestamp is yesterday
        if (timestamp.isSame(now.clone().subtract(1, 'day'), 'day')) {
            // Return 'Yesterday' with hours and minutes
            return "Yesterday, " + timestamp.format("h:mm A");
        }

        // Return the whole date
        return timestamp.format("MMM DD, h:mm A");
    }



    return (
        <AnimatePresence>
            {isChatOpened && (
                <motion.div
                    key="chatbox"
                    initial={{ x: 100 }}
                    animate={{ x: 0 }}
                    exit={{ x: 100 }}
                    className="w-full h-screen-safe relative flex flex-col">
                    <div className="relative w-full bg-white border-b-[1px] border-black/5 z-[2]">
                        <Modal isShown={memberListWindow} setShown={setMemberListWindow}>
                            <ModalList />
                        </Modal>
                        <div className="flex items-center justify-between p-4 sm:p-5">
                            <div className="flex items-center">
                                <ChevronLeft onClick={hideChat} className="md:hidden cursor-pointer mr-4" />
                                <>
                                    <img src={activeChatData[0]?.photoUrl} referrerPolicy="no-referrer" className="w-10 rounded-full mr-4" />
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm">{activeChatData[0]?.display_name}</p>
                                        <p className="text-xs">{activeChatData[0]?.activityStatus}</p>
                                    </div>
                                </>
                            </div>
                            <div className="p-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Ellipsis className="cursor-pointer" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="m-2">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => setMemberListWindow(true)} className="flex space-x-4 items-center cursor-pointer p-2">
                                                <UserRoundPlus className="w-5 h-5" />
                                                <p>Add Member</p>
                                            </DropdownMenuItem>
                                            {activeChatData.length > 1 ?
                                                <DropdownMenuItem onClick={() => leaveGroup()} className="flex space-x-4 items-center cursor-pointer p-2">
                                                    <X color="#991b1b" className="w-5 h-5" />
                                                    <p className="text-red-800 font-bold">Leave Group</p>
                                                </DropdownMenuItem>
                                                :
                                                <DropdownMenuItem onClick={() => deleteChat(currentGroupId)} className="flex space-x-4 items-center cursor-pointer p-2">
                                                    <Trash2 color="#991b1b" className="w-5 h-5" />
                                                    <p className="text-red-800 font-bold">Delete Chat</p>
                                                </DropdownMenuItem>
                                            }
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        {isMessageLoading &&
                            <div className="absolute bg-white border-t-[1px] border-black/5 p-2 w-full flex justify-center items-center">
                                <BeatLoader size={10} color="#c91e1e" />
                            </div>
                        }
                    </div>
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="w-full h-screen-safe overflow-y-scroll flex flex-col-reverse py-6">
                        {currentMembers.length > 0 && text.map((m, index) => {
                            return <ChatMessage key={index} side={m.sentBy == auth?.currentUser?.uid ? 1 : 2} currentMembers={currentMembers} isDifference={(v1, v2, v3) => isDifference(v1, v2, v3)} text={text} m={m} index={index} returnTimestampFirstMessage={(v1) => returnTimestampFirstMessage(v1)} compareTimestamps={(v1, v2) => compareTimestamps(v1, v2)} isMessageSending={isMessageSending} isMessageLoading={isMessageLoading} />
                        })}
                        <div className={`w-full flex justify-center`}>
                            {(loadMoreDocs * 20 + 20) >= chatLength && !isMessageLoading && (
                                <div className="flex flex-col items-center justify-center p-6">
                                    <img src={newchat} className="w-48 h-48 sm:w-64 sm:h-64" />
                                    <p className="text-sm md:text-md text-center">Welcome to the conversation! Write something down to start the convo.</p>
                                </div>
                            )}
                        </div>

                    </div>
                    <div className="bg-white w-full border-t-[1px] px-6 py-3 flex space-x-4">
                        <form className="flex space-x-6 items-center w-full">
                            <motion.a whileHover={{ scale: 1.05 }} className="cursor-pointer" onClick={handleAttachClick}>
                                <Paperclip width={20} height={20} color="#991b1b" />
                            </motion.a>
                            <motion.a whileHover={{ scale: 1.05 }} className="cursor-pointer" onClick={handleImageUploadClick}>
                                <Images width={20} height={20} color="#991b1b" />
                            </motion.a>
                            <input id="fileInput1" type="file" onChange={handleFileUpload} className="hidden" />
                            <input id="fileInput2" type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
                            <input value={textValue} onChange={addText} type="text" className="text-xs md:text-sm py-2 bg-[#f0f0f0] rounded-full px-5 w-full" placeholder="Type message here" />
                            <motion.button whileHover={{ scale: 1.05 }} type="submit" onClick={buttonSendClick}><SendHorizontal width={20} height={20} color="#991b1b" /></motion.button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const ModalList = () => {
    const { myUserData, setMemberListWindow, activeChatData } = useContext(PageContext);

    const handleAddMember = async (item, index) => {
        if (!item || item.userId === undefined) return;

        await updateDoc(doc(db, "groups", currentGroupId), {
            members: arrayUnion(item.userId),
        })
        await updateDoc(doc(db, "users", item.userId), {
            groups: arrayUnion(currentGroupId),
        })

    }

    let checkIfExists = (item, index) => {
        if (!item || item.display_name === undefined) return;
        for (let i = 0; i < activeChatData.length; i++) {
            if (activeChatData[i].display_name === item.display_name) return true;
        }
        return false;
    }

    return (
        <>
            {myUserData?.friends?.filter((item, index) => !checkIfExists(item, index)).length === 0 ? (
                <div className="w-full p-6 h-full flex flex-col justify-center items-center space-y-6">
                    <img src={emptylist} className="w-52" />
                    <div className="flex flex-col justify-center items-center text-sm">
                        <p className="font-[400] tracking-wide">Oops, it's too quiet in here! &#x1F60E;</p>
                        <p className="font-[400] tracking-wide">Let's add some friends first!</p>
                    </div>
                    <Button className="bg-red-800 hover:bg-red-700" onClick={() => setMemberListWindow(false)}>Close</Button>
                </div>
            ) : (
                myUserData?.friends?.filter((item, index) => !checkIfExists(item, index)).map((item, index) => (
                    <div key={item?.userId} className="w-full sm:w-[20rem] flex justify-between items-center hover:bg-[#f0f0f0] cursor-pointer p-2 rounded-xl">
                        <div className="flex space-x-4 items-center">
                            <img src={item?.photoUrl} referrerPolicy="no-referrer" className="w-[50px] h-[50px] rounded-full" />
                            <p className="text-sm md:text-md">{item?.display_name}</p>
                        </div>
                        <button onClick={(event) => {
                            handleAddMember(item, index)
                            event.currentTarget.disabled = true;
                        }} className="disabled:cursor-not-allowed disabled:opacity-50"><CirclePlus /></button>
                    </div>
                ))
            )}
        </>
    )
}