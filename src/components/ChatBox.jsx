import { useEffect, useRef, useState } from "react";
import { auth, db } from "../config/firebase"
import adduser from "../../public/add-user.png"
import sendmessage from "../../public/send-message.png"
import exitchat from "../../public/exitchat.png"
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { serverTimestamp as firestoreTimestamp } from "firebase/firestore";

export const ChatBox = ({ formatTimeAgo, activeChatData, currentGroupId, hideChat }) => {

    const [loadMoreDocs, setLoadMoreDocs] = useState(0);
    const [text, setText] = useState([]);
    const [textValue, setTextValue] = useState("");
    const [currentMembers, setMembers] = useState([]);
    const scrollContainerRef = useRef();


    useEffect(() => {
        let foo = async () => {

            let query1 = query(collection(db, "group"), where("id", "==", currentGroupId));
            let groupData = await getDocs(query1);

            groupData.docs[0].data().members.map(async (m) => {
                let query2 = query(collection(db, "users"), where("userId", "==", m));
                let userData = await getDocs(query2);

                setMembers(prevMember => [...prevMember, userData.docs[0].data()]);
            })
        }

        foo();
    }, [currentGroupId]);

    useEffect(() => {
        if (currentGroupId === "") return;

        const subcollectionRef = collection(doc(db, "messages", currentGroupId), "message");
        const orderedQuery = query(subcollectionRef, orderBy('sentAt', 'desc'), limit(20 + (loadMoreDocs * 20)));
        const unsubscribe = onSnapshot(orderedQuery, (querySnapshot) => {
            setText([]);
            console.log("NEW DATA INCOMING:");
            querySnapshot.forEach(async (doc) => {
                setText(prevText => [...prevText, doc.data()])
            });
        });


        return () => unsubscribe();
    }, [currentGroupId, loadMoreDocs]);


    const sendMessage = async (e) => {
        e.preventDefault();
        if (textValue === "") return;

        setText(prevText => [{ sentBy: auth?.currentUser?.uid, message: textValue }, ...prevText]);
        console.log(currentGroupId);

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
        return `${hours}:${minutes}`;
      };

      console.log("active chat data:")
      console.log(activeChatData)
    return (
        <div className="w-full h-full relative">
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="w-full h-[95%] overflow-y-scroll rounded-md flex flex-col-reverse pb-[2%]">
                <div className="w-full bg-[#f7f7f7] flex items-center justify-between absolute py-4 px-8 top-0 z-10">
                    <div className="flex items-center space-x-4">
                        <img onClick={hideChat} src={exitchat} className="w-[24px] h-[24px] md:w-[32px] md:h-[32px] cursor-pointer md:hidden" />
                        {(typeof activeChatData.members !== 'undefined') ?
                            <>
                                <img src={activeChatData?.members[0]?.photoUrl} className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] rounded-full" />
                                <div className="flex flex-col">
                                    <p>{activeChatData?.members[0]?.display_name}</p>
                                    {(activeChatData?.members?.length === 1) && <p className="text-xs">{activeChatData?.members[0]?.activityStatus}</p>}
                                </div>
                            </>
                            :
                            <>
                                <img src={activeChatData?.photoUrl} className="w-[64px] h-[64px] rounded-full" />
                                <div className="flex flex-col">
                                    <p>{activeChatData?.display_name}</p>
                                    <p className="text-xs">{activeChatData?.activityStatus}</p>
                                </div>
                            </>
                        }
                    </div>
                    <img src={adduser} className="w-[24px] h-[24px] cursor-pointer" />
                </div>
                {currentMembers.length > 0 && text.map((m, index) => {
                    if (m.sentBy == auth?.currentUser?.uid) {
                        return <div key={index} className="w-full bg-white flex items-end justify-end px-5 py-2">
                            <div className="bg-blue-500 py-2 px-4 m-2 rounded-xl relative">
                                <p className="text-white font-[600] text-sm md:text-base">{m.message}</p>
                                <p className="text-xs absolute bottom-[-16px] right-[-10px]">{formatTime(m?.sentAt?.seconds)}</p>
                            </div>
                            <img className="w-[42px] h-[42px] rounded-full" src={auth?.currentUser?.photoURL} />
                        </div>
                    } else {
                        let otherMember = currentMembers.find(member => member.userId === m.sentBy);
                        return <div key={index} className="w-full bg-white flex justify-start items-end px-5 py-2">
                            <img className="w-[42px] h-[42px] rounded-full" src={otherMember?.photoUrl} />
                            <div className="bg-red-500 py-2 px-4 m-2 relative rounded-xl">
                                <p className="text-white font-[600] text-sm md:text-base">{m.message}</p>
                                <p className="text-xs absolute bottom-[-16px] left-[-10px]">{formatTime(m?.sentAt?.seconds)}</p>
                            </div>
                        </div>
                    }
                })}
                <div className="w-full flex justify-center py-[200px]">
                    <p className="text-sm md:text-md">You have started a new conversation!</p>
                </div>

            </div>
            <div className="w-full h-[5%] bg-[#f7f7f7] px-6 py-2 flex space-x-4">
                <form className="flex space-x-6 w-full">
                    <input value={textValue} onChange={addText} type="text" className="text-sm md:text-base p-1 hover:bg-[#e8e8e8] rounded-lg px-5 w-full" placeholder="Type text..." />
                    <button type="submit" onClick={sendMessage} className="bg-white rounded-full hover:bg-[#e8e8e8] py-1 px-5 text-sm hover:bg-[#f0f0f0]"><img src={sendmessage} className="w-[16px] h-[16px]" /></button>
                </form>
            </div>
        </div>
    )
}