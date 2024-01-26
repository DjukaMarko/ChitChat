import { useEffect, useState } from "react";
import { addDoc, collection,serverTimestamp, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { auth, db } from "../config/firebase"

export const Chat = ({ room }) => {
    const [allMessages, setAllMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const collectionRef = collection(db, "messages");

    useEffect(() => {
        const queryMessages = query(collectionRef, where("room" , "==", room), orderBy("createdAt"));
        const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
            let messages = [];
            snapshot.forEach((doc) => {
                messages.push({ ...doc.data(), id:doc.id});
            });

            setAllMessages(messages);
        })

        return () => unsubscribe();
    }, [])

    const handleSend = async (e) => {
        e.preventDefault();
        try {
            if(newMessage === "") return;
            await addDoc(collectionRef, {
                text: newMessage,
                createdAt: serverTimestamp(),
                user: auth.currentUser.displayName,
                room,
            });

            setNewMessage("");
        } catch(e) {
            console.error(e);
        }
    }
    return (
        <div className="">
            <div>
                {allMessages.map((message) => {
                    return <h1><b>{message.user}</b> : {message.text}</h1>
                })}
            </div>
            <form onSubmit={handleSend}>
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message here..." />
                <button type="submit">Send</button>
            </form>
        </div>
    )
}