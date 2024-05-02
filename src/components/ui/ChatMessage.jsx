import { BeatLoader, ClipLoader } from "react-spinners";
import { compareTimestamps, fetchDataFromLink, firebaseStoragePattern, isDifference, isValidUrl, parseFirebaseStorageLink, possibleImageFormat } from "@/lib/utils";
import { memo, useContext, useEffect, useState } from "react";
import { PageContext } from "../misc/PageContext";
import { getDocs, query, where } from "firebase/firestore";
import { auth } from "@/config/firebase";
import { File } from "lucide-react";

export const ChatMessage = memo(({ text, m, index, isMessageSending }) => {
    const { usersRef } = useContext(PageContext);
    const [userMessageData, setUserMessageData] = useState({});
    const isSentByMe = m.sentBy === auth.currentUser.uid;
    const [linkData, setLinkData] = useState({});


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

            if (isValidUrl(m.message)) {

                if (firebaseStoragePattern.test(m.message)) {
                    const parsedData = parseFirebaseStorageLink(m.message);
                    setLinkData({ isFirebase: true, ...parsedData });
                } else {
                    const data = await fetchDataFromLink(m.message);
                    if(data && data.result) {
                        setLinkData({ isFirebase: false, ...data.result });
                    }
                }

            }
        }

        loadLinkData();
    }, []);


    return (
        <div className={`flex flex-col ${isSentByMe ? "items-end" : "items-start"} mt-[0.2rem] ${!isSentByMe && (text[index + 1 === text.length ? index : index + 1]?.sentBy !== m?.sentBy) && "mt-4"}`}>
            {/* show the time difference between the current message and the next message */}
            {isDifference(m, text[index === text.length - 1 ? index : index + 1], text.length, index) && (
                <div className={`w-full flex justify-center my-3`}>
                    <p className={`text-xs text-textColor`}>{compareTimestamps(m, text[index === text.length - 1 ? index : index + 1]) || ""}</p>
                </div>
            )}
            <div className={`${isSentByMe ? "mr-2" : "ml-2 flex items-end space-x-2"} max-w-[70%] md:max-w-[95%] lg:max-w-[80%] 2xl:max-w-[80%] `}>
                {!isSentByMe && ((text[index + 1 === text.length ? index : index + 1]?.sentBy !== m?.sentBy || index + 1 === text.length) && <img className="w-6 rounded-full" src={userMessageData?.photoUrl} />)}
                <div className={`${(isSentByMe ? (isMessageSending && index === 0 ? "bg-red-600" : "bg-red-800 hover:bg-red-700") : "bg-secondaryC hover:bg-secondaryCHover")} ml-[2rem] ${Object.keys(linkData).length === 0 && "py-[7px] px-3"} rounded-lg cursor-pointer relative`}>

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
                                <a target="_blank" href={m.message} className={`p-2 ${isSentByMe ? "text-white" : "text-textColor"} flex items-center`}>
                                    <File className="mr-2" size={18} />
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

                    {isMessageSending && isSentByMe &&
                        <div className={`absolute -bottom-6 right-0`}><ClipLoader className="w-max" size={10} color="#c91e1e" /></div>
                    }
                </div>
            </div>
        </div>
    )
})
