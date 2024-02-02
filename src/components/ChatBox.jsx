import { useEffect, useRef, useState } from "react";
import { auth, db } from "../config/firebase"
import threedots from "../../public/threedots.png"
import sendmessage from "../../public/send-message.png"
import exitchat from "../../public/exitchat.png"
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { serverTimestamp as firestoreTimestamp } from "firebase/firestore";
import { BeatLoader } from "react-spinners";
import { isNaN } from "lodash";

export const ChatBox = ({ formatTimeAgo, activeChatData, currentGroupId, hideChat }) => {

    const [loadMoreDocs, setLoadMoreDocs] = useState(0);
    const [text, setText] = useState([]);
    const [textValue, setTextValue] = useState("");
    const [isMessageSending, setMessageSending] = useState(false);
    const [currentMembers, setMembers] = useState([]);
    const [isMessageLoading, setMessageLoading] = useState(false);
    const scrollContainerRef = useRef();

    /*
    
    const foo = async () => {
            if(currentGroupId === "") return
             await Promise.all(activeChatData.map(async item => {
                const q1 = query(
                    collection(db, "users"),
                    where('display_name', '==', item.display_name)
                );
        
                try {
                    const other_user = await getDocs(q1);
        
                    // Check if any documents are returned
                    if (other_user.docs.length > 0) {
                        if (other_user.docs[0].data().groups.indexOf(currentGroupId) === -1) {
                            await updateDoc(doc(db, "users", other_user.docs[0].data().userId), {
                                groups: arrayUnion(currentGroupId)
                            })
                        } else {
                            //console.log("User is already in the group");
                        }
                    } else {
                        //console.log("User not found");
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                }
            }));
        }
    
    */
    useEffect(() => {
        let foo = async () => {
            if (currentGroupId) {
                let query1 = query(collection(db, "group"), where("id", "==", currentGroupId));
                let groupData = await getDocs(query1);

                groupData.docs[0].data().members.map(async (m) => {
                    let query2 = query(collection(db, "users"), where("userId", "==", m));
                    let userData = await getDocs(query2);

                    setMembers(prevMember => [...prevMember, userData.docs[0].data()]);
                })
            }
        }

        foo();
    }, [currentGroupId]);

    useEffect(() => {
        if (currentGroupId === "") return;

        setMessageLoading(true);
        const subcollectionRef = collection(doc(db, "messages", currentGroupId), "message");
        const orderedQuery = query(subcollectionRef, orderBy('sentAt', 'desc'), limit(20 + (loadMoreDocs * 20)));
        const unsubscribe = onSnapshot(orderedQuery, (querySnapshot) => {
            setText([]);
            querySnapshot.forEach(async (doc) => {
                setText(prevText => [...prevText, doc.data()])
            });
            setMessageLoading(false);
        });

        return () => unsubscribe();
    }, [currentGroupId, loadMoreDocs]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (textValue === "") return;
        setMessageSending(true);
        setText(prevText => [{ sentBy: auth?.currentUser?.uid, message: textValue }, ...prevText]);

        const q = query(
            collection(db, "messages"),
            where('id', '==', currentGroupId)
        );

        const message_at_group = await getDocs(q);
        if (message_at_group.empty) {
            await setDoc(doc(db, "messages", currentGroupId), {
                id: currentGroupId,
            });
        }

        await updateDoc(doc(db, "users", auth?.currentUser?.uid), {
            groups: arrayUnion(currentGroupId),
        })

        await Promise.all(activeChatData.map(async item => {
            const q1 = query(
                collection(db, "users"),
                where('display_name', '==', item.display_name)
            );

            try {
                const other_user = await getDocs(q1);

                // Check if any documents are returned
                if (other_user.docs.length > 0) {
                    if (other_user.docs[0].data().groups.indexOf(currentGroupId) === -1) {
                        await updateDoc(doc(db, "users", other_user.docs[0].data().userId), {
                            groups: arrayUnion(currentGroupId)
                        })
                    } else {
                        //console.log("User is already in the group");
                    }
                } else {
                    //console.log("User not found");
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        }));

        await updateDoc(doc(db, "messages", currentGroupId), {
            lastMessage: textValue,
            lastMessageSent: firestoreTimestamp(),
            lastMessageSentBy: auth?.currentUser?.uid,
        })


        const messageRef = collection(doc(db, "messages", currentGroupId), "message");

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

            setLoadMoreDocs(prevDocs => prevDocs + 1);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        if (hours !== "NaN" && minutes !== "NaN") return `${hours}:${minutes}`;
    };
    return (
        <div className="w-full h-full relative">
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="w-full h-[95%] overflow-y-scroll rounded-md flex flex-col-reverse pb-[2%]">
                <div className="w-full bg-white border-b-[1px] shadow-sm flex flex-col space-y-2 absolute py-4 px-8 top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img onClick={hideChat} src={exitchat} className="w-[24px] h-[24px] md:w-[32px] md:h-[32px] cursor-pointer md:hidden" />
                            <>
                                <img src={activeChatData[0]?.photoUrl} referrerPolicy="no-referrer" className="w-[64px] h-[64px] rounded-full" />
                                <div className="flex flex-col">
                                    <p>{activeChatData[0]?.display_name}</p>
                                    <p className="text-xs">{activeChatData[0]?.activityStatus}</p>
                                </div>
                            </>
                        </div>
                        <div className="w-[35px] h-[35px] p-2 cursor-pointer">
                            <img src={threedots} />
                        </div>
                    </div>
                    {isMessageLoading &&
                        <div className="w-full flex justify-center items-center p-4">
                            <BeatLoader color="#c91e1e" />
                        </div>
                    }
                </div>
                {currentMembers.length > 0 && text.map((m, index) => {
                    if (m.sentBy == auth?.currentUser?.uid) {
                        return <div key={index} className="w-full bg-white flex items-end justify-end px-5 py-2">
                            <div className={`${isMessageSending && index === 0 ? "bg-red-200" : "bg-red-500"} py-2 px-4 m-2 rounded-xl relative`}>
                                <p className="text-white font-[600] text-xs md:text-sm">{m.message}</p>
                                {isMessageSending && index === 0 ?
                                    <div className="absolute bottom-[-22px] left-[-16px]"><BeatLoader size={8} color="#c91e1e" /></div>
                                    :
                                    <p className="text-[10px] absolute bottom-[-16px] left-[-10px]">{formatTime(m?.sentAt?.seconds)}</p>
                                }
                            </div>
                            <img className="w-[42px] h-[42px] rounded-full" src={auth?.currentUser?.photoURL} />
                        </div>
                    } else {
                        let otherMember = currentMembers.find(member => member.userId === m.sentBy);
                        return <div key={index} className="w-full bg-white flex justify-start items-end px-5 py-2">
                            <img className="w-[42px] h-[42px] rounded-full" src={otherMember?.photoUrl} />
                            <div className="bg-[#f0f0f0] py-2 px-4 m-2 relative rounded-xl">
                                <p className="text-black text-xs md:text-sm">{m.message}</p>
                                {isMessageSending & index === 0 ?
                                    <div className="absolute bottom-[-22px] right-[-16px]"><BeatLoader size={8} color="#c91e1e" /></div>
                                    :
                                    <p className="text-[10px] absolute bottom-[-16px] right-[-10px]">{formatTime(m?.sentAt?.seconds)}</p>
                                }
                            </div>
                        </div>
                    }
                })}
                <div className="w-full flex justify-center py-[200px]">
                    <p className="text-sm md:text-md">You have started a new conversation!</p>
                </div>

            </div>
            <div className="w-full h-[5%] border-t-[1px] px-6 py-2 flex space-x-4">
                <form className="flex space-x-6 w-full">
                    <input value={textValue} onChange={addText} type="text" className="text-sm md:text-base p-1 bg-[#f0f0f0] rounded-full px-5 w-full" placeholder="I love you :)" />
                    <button type="submit" onClick={sendMessage} className="bg-white rounded-full hover:bg-[#e8e8e8] py-1 px-5 text-sm hover:bg-[#f0f0f0]"><img src={sendmessage} className="w-[16px] h-[16px]" /></button>
                </form>
            </div>
        </div>
    )
}