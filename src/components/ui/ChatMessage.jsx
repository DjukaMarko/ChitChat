import { ClipLoader } from "react-spinners";
import { compareTimestamps, fetchDataFromLink, firebaseStoragePattern, isDifference, isValidUrl, parseFirebaseStorageLink, possibleImageFormat } from "@/lib/utils";
import { memo, useContext, useEffect, useState } from "react";
import { PageContext } from "../misc/PageContext";
import { doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { File } from "lucide-react";
import messagedelivered from "@/../public/messagedelivered.png"
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion"

export const ChatMessage = memo(({ text, m, index, isMessageSending }) => {
    const { usersRef, activeChatData } = useContext(PageContext);
    const [userMessageData, setUserMessageData] = useState({});
    const isSentByMe = m.sentBy === auth.currentUser.uid;
    const [linkData, setLinkData] = useState({});
    const { ref, inView } = useInView();
    const [readByUsers, setReadByUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if(!m.readBy || m.readBy.length === 0) return;
            const fetchUserDataPromises = m.readBy.filter(userId => userId !== auth.currentUser.uid).map(async userId => {
                const userDocRef = doc(db, "users", userId);
                try {
                    const docSnapshot = await getDoc(userDocRef);
                    if (docSnapshot.exists()) {
                        return docSnapshot.data();
                    } else {
                        return null;
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    return null;
                }
            });

            try {
                const userDatas = await Promise.all(fetchUserDataPromises);
                setReadByUsers(userDatas.filter(userData => userData !== null));
            } catch (error) {
                console.error("Error fetching user data for readBy IDs:", error);
            }
        };

        fetchData();
    }, [m.readBy]); // Dependency array to run the effect whenever m.readBy changes


    useEffect(() => {
        let fetchUser = async () => {
            const q = query(usersRef, where("userId", "==", m.sentBy));
            const otherUser = await getDocs(q);

            setUserMessageData(otherUser.docs[0].data());
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if (!m.message) return;

        let loadLinkData = async () => {

            if (isValidUrl(m.message) && Object.keys(linkData).length === 0) {
                if (firebaseStoragePattern.test(m.message)) {
                    const parsedData = parseFirebaseStorageLink(m.message);
                    setLinkData({ isFirebase: true, ...parsedData });
                } else {
                    const data = await fetchDataFromLink(m.message);
                    if (data && data.result) {
                        setLinkData({ isFirebase: false, ...data.result });
                    }
                }

            }
        }

        let checkIfMessageRead = async () => {
            if (m.id) {
                if (!m.readBy.includes(auth.currentUser.uid)) {
                    const messageRef = doc(db, "groups", activeChatData.id, "messages", m.id);
                    const groupRef = await getDoc(doc(db, "groups", activeChatData.id));
                    const previousLastMessageReadBy = groupRef.data().lastMessageReadBy;
                    await updateDoc(messageRef, { readBy: [...m.readBy, auth.currentUser.uid] });
                    await updateDoc(doc(db, "groups", activeChatData.id), { lastMessageReadBy: [...previousLastMessageReadBy, auth.currentUser.uid]})
                }
            }
        }


        if (inView) {
            loadLinkData();
            checkIfMessageRead();
        }
    }, [inView]);


    return (
        <div ref={ref} className={`flex flex-col ${isSentByMe ? "items-end" : "items-start"} mt-[0.2rem] ${!isSentByMe && (text[index + 1 === text.length ? index : index + 1]?.sentBy !== m?.sentBy) && "mt-4"}`}>
            {/* show the time difference between the current message and the next message */}
            {isDifference(m, text[index === text.length - 1 ? index : index + 1], text.length, index) && (
                <div className={`w-full flex justify-center my-3`}>
                    <p className={`text-xs text-textColor`}>{compareTimestamps(m, text[index === text.length - 1 ? index : index + 1]) || ""}</p>
                </div>
            )}
            <div className={`${isSentByMe ? "mr-2" : "ml-2 flex items-end space-x-2"} max-w-[70%] md:max-w-[95%] lg:max-w-[80%] 2xl:max-w-[80%] `}>
                {!isSentByMe && ((text[index + 1 === text.length ? index : index + 1]?.sentBy !== m?.sentBy || index + 1 === text.length) && <img className="w-6 rounded-full" src={userMessageData?.photoUrl} />)}
                <div className={`rounded-xl ${(isSentByMe ? (isMessageSending && index === 0 ? "bg-red-600" : "bg-primaryC hover:bg-primaryCHover") : "bg-secondaryC hover:bg-secondaryCHover")} ${Object.keys(linkData).length === 0 && "py-[6px] px-3"} ${!isSentByMe && "ml-[2rem]"} cursor-pointer relative`}>

                    {isValidUrl(m.message) ? (
                        linkData && (linkData.siteData ? ( // Check if linkData is not empty and contains siteData
                            <a target="_blank" href={linkData.siteData?.url} className="flex flex-col shadow-lg">
                                <img className="rounded-t-sm w-full max-h-96 object-cover" src={linkData.siteData?.image} />
                                <p className={`${isSentByMe ? "text-white" : "text-textColor"} text-sm underline p-2 break-words`}>{linkData.siteData?.title}</p>
                            </a>
                        ) : linkData.isFirebase ? (
                            possibleImageFormat.includes(linkData.extension.toLowerCase()) ? (
                                <a target="_blank" href={m.message}><img className="rounded-sm w-full max-h-96 object-cover" src={m.message} /></a>
                            ) : (
                                <a target="_blank" href={m.message} className={`${isSentByMe ? "text-white" : "text-textColor"} flex items-center p-2`}>
                                    <div className="pr-2">
                                        <File size={20} />
                                    </div>
                                    <p className="underline text-sm break-all">{linkData.fileName}</p>
                                </a>
                            )
                        ) : (
                            <a href={m.message.startsWith("http") ? m.message : `https://${m.message}`} className={`${isSentByMe ? "text-white" : "text-black"} underline text-sm break-all`} target="_blank" rel="noopener noreferrer">
                                {m.message}
                            </a>
                        )
                        )
                    ) : (
                        <p className={`${isSentByMe ? "text-white" : "text-textColor"} text-sm break-words`}>{m.message}</p>
                    )}

                </div>
            </div>
            {isMessageSending && isSentByMe &&
                <div className={`w-full flex justify-end items-center p-1`}><ClipLoader size={10} color="#c91e1e" /></div>
            }
            {!isMessageSending && isSentByMe && index === 0 && readByUsers.length === 0 &&
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className={`w-full flex items-center justify-end p-1`}><img className="w-4" src={messagedelivered} /></motion.div>
            }
            <div className="w-full flex items-center justify-end -space-x-2">
                {readByUsers.map(user => {
                    if (index > 0) {
                        if (text[index - 1].readBy.includes(user.userId)) {
                            return;
                        }
                    }
                    if(user.userId === m.sentBy) return;
                    return <img key={m.id} src={user?.photoUrl} className="rounded-full w-6 p-1" />
                })}
            </div>
        </div>
    )
})
