import { useEffect, useRef, useState } from "react";
import { auth, db, storage } from "../config/firebase"
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import threedots from "../../public/threedots.png"
import newchat from "../../public/newchat.svg"
import exitchat from "../../public/exitchat.png"
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, increment, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { serverTimestamp as firestoreTimestamp } from "firebase/firestore";
import { BeatLoader } from "react-spinners";
import moment from "moment";
import { ChatMessage } from "./ChatMessage";
import { motion } from "framer-motion";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Images, Paperclip, SendHorizontal, Trash2, UserRoundPlus } from "lucide-react";


export const ChatBox = ({ activeChatData, setMemberListWindow, deleteChat, currentGroupId, hideChat }) => {

    const [loadMoreDocs, setLoadMoreDocs] = useState(0);
    const [text, setText] = useState([]);
    const [textValue, setTextValue] = useState("");
    const [fileUploadInput, setFileUploadInput] = useState("");
    const [isMessageSending, setMessageSending] = useState(false);
    const [currentMembers, setMembers] = useState([]);
    const [isMessageLoading, setMessageLoading] = useState(false);
    const [isChatMenuOpened, setChatMenuOpened] = useState(false);
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
        const fileInput1 = document.getElementById('fileInput1');
        fileInput1.click();
    };

    const handleImageUploadClick = (e) => {
        e.preventDefault();
        const fileInput2 = document.getElementById('fileInput2');
        fileInput2.click();
    };


    useEffect(() => {
        if (scrollContainerRef.current) {
            const scrollContainer = scrollContainerRef.current;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [activeChatData]);

    useEffect(() => {

        let foo = async () => {
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

        setMessageLoading(true);

        foo();
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


    const sendMessage = async () => {
        if (textValue === "") return;
        setMessageSending(true);
        setText(prevText => [{ sentBy: auth?.currentUser?.uid, message: textValue }, ...prevText]);

        await updateDoc(doc(db, "users", auth?.currentUser?.uid), {
            groups: arrayUnion(currentGroupId),
        })

        await Promise.all(activeChatData.map(async item => {
            const q1 = query(
                collection(db, "users"),
                where('display_name', '==', item.display_name)
            );

            try {
                const otherUser = await getDocs(q1);

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

        if (timeDifference > 15 || index == textLength - 1) {
            return true;
        }

        return false;
    }

    const compareTimestamps = (obj1, obj2) => {

        const timestamp1 = moment.unix(obj1?.sentAt?.seconds);
        const timestamp2 = moment.unix(obj2?.sentAt?.seconds);
        // Get the object with the latest timestamp
        const latestObject = timestamp1.isAfter(timestamp2) ? obj1 : obj2;
        const latestTimestamp = moment.unix(latestObject?.sentAt?.seconds);

        // Check the difference between now and the latest timestamp
        const now = moment();
        const differenceToNow = now.diff(latestTimestamp, 'hours');

        if (differenceToNow > 24) {
            // Return the time of the object with the latest timestamp in the desired format
            return latestTimestamp.format("MMM DD, h:mm A");
        }

        return latestTimestamp.format("h:mm A");
    }

    return (
        <div className="w-full h-full relative">
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="w-full h-[95%] overflow-y-scroll rounded-md flex flex-col-reverse pb-[2%]">
                <div className="w-full bg-white border-b-[1px] border-black/5 flex flex-col space-y-2 absolute top-0 z-[2] p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <img onClick={hideChat} src={exitchat} className="w-6 md:w-[32px] md:h-[32px] cursor-pointer md:hidden mr-4" />
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
                                    <img className="cursor-pointer w-5" src={threedots} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => setMemberListWindow(true)} className="flex space-x-4 items-center cursor-pointer p-2">
                                            <UserRoundPlus />
                                            <p>Add Member</p>
                                        </DropdownMenuItem>
                                        {activeChatData.length > 1 ?
                                            <DropdownMenuItem onClick={() => leaveGroup()} className="flex space-x-4 items-center cursor-pointer p-2">
                                                <X color="#991b1b" />
                                                <p className="text-red-800 font-bold">Leave Group</p>
                                            </DropdownMenuItem>
                                            :
                                            <DropdownMenuItem onClick={() => deleteChat(currentGroupId)} className="flex space-x-4 items-center cursor-pointer p-2">
                                                <Trash2 color="#991b1b" />
                                                <p className="text-red-800 font-bold">Delete Chat</p>
                                            </DropdownMenuItem>
                                        }
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    {isMessageLoading &&
                        <div className="w-full flex justify-center items-center p-4">
                            <BeatLoader color="#c91e1e" />
                        </div>
                    }
                </div>
                {currentMembers.length > 0 && text.map((m, index) => {
                    return <ChatMessage key={index} side={m.sentBy == auth?.currentUser?.uid ? 1 : 2} currentMembers={currentMembers} isDifference={(v1, v2, v3) => isDifference(v1, v2, v3)} text={text} m={m} index={index} compareTimestamps={(v1, v2) => compareTimestamps(v1, v2)} isMessageSending={isMessageSending} />
                })}
                <div className="w-full flex justify-center pt-48 pb-16">
                    {(loadMoreDocs * 20 + 20) >= chatLength && !isMessageLoading && (
                        <div className="flex flex-col items-center justify-center">
                            <img src={newchat} className="w-48 h-48 sm:w-64 sm:h-64" />
                            <p className="text-sm md:text-md max-w-[40ch] text-center">Welcome to the conversation! Write something down to start the convo.</p>
                        </div>
                    )}
                </div>

            </div>
            <div className="w-full h-[5%] border-t-[1px] px-6 py-2 flex space-x-4">
                <form className="flex space-x-6 items-center w-full">
                    <motion.a whileHover={{ scale: 1.05 }} className="cursor-pointer" onClick={handleAttachClick}>
                        <Paperclip width={20} height={20} color="#991b1b" />
                    </motion.a>
                    <motion.a whileHover={{ scale: 1.05 }} className="cursor-pointer" onClick={handleImageUploadClick}>
                        <Images width={20} height={20} color="#991b1b" />
                    </motion.a>
                    <input id="fileInput1" type="file" onChange={handleFileUpload} className="hidden" />
                    <input id="fileInput2" type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <input value={textValue} onChange={addText} type="text" className="text-xs md:text-sm p-2 bg-[#f0f0f0] rounded-full px-5 w-full" placeholder="Type message here" />
                    <motion.button whileHover={{ scale: 1.05 }} type="submit" onClick={buttonSendClick}><SendHorizontal width={20} height={20} color="#991b1b" /></motion.button>
                </form>
            </div>
        </div>
    )
}
