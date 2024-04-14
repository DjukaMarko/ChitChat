import { ThemeProvider } from "../misc/ThemeProvider";
import { useContext, useEffect, useState } from "react";
import { Skeleton } from "./skeleton";
import { PageContext } from "../misc/PageContext";
import { doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { CirclePlus } from "lucide-react";
import { motion } from "framer-motion";

export default function GridRandomFriends({ handleSendRequest }) {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [hoverIndex, setHoverIndex] = useState(null);
    const { usersRef } = useContext(PageContext);
    useEffect(() => {
        let fetchData = async () => {
            const q = query(usersRef, limit(9));
            const snapshot = await getDocs(q);

            const documents = [];
            for (const docSnap of snapshot.docs) {
                documents.push({ ...docSnap.data() });
                if (docSnap.data().friends.includes(auth.currentUser.uid) && docSnap.data().userId !== auth.currentUser.uid) {
                }
            }//docSnap.data().friends.includes(auth.currentUser.uid) && docSnap.data().userId !== auth.currentUser.uid

            setData(documents);
            console.log(documents)
            setLoading(false);
        }

        fetchData();
    }, []);
    return (
        <div className="w-[50%] md:w-[30%] h-full grid sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 2xl:grid-rows-4 gap-1 rounded-bl-lg border-r-[1px] border-secondaryCHover p-3 overflow-y-auto">
            {isLoading ?
                <SkeletonLoader /> :
                <>
                    {data.map((item, index) => (
                        <div
                            onMouseEnter={() => setHoverIndex(index)}
                            onMouseLeave={() => setHoverIndex(null)}
                            key={index}
                            className={`border-[1px] border-borderColor bg-secondaryCHover rounded-lg relative overflow-hidden ${index === 0 && "col-span-2 row-span-2"}`}>
                            {hoverIndex === index && <motion.div whileHover={{ scale: 1.2 }} className="cursor-pointer absolute w-full h-full bg-black/50 rounded-lg flex justify-center items-center">
                                <button className="disabled:cursor-not-allowed disabled:opacity-50" onClick={(event) => {
                                    handleSendRequest(item.display_name);
                                    event.currentTarget.disabled = true;
                                }}>
                                    <CirclePlus color="#fff" />
                                </button>
                            </motion.div>
                            }
                            <img src={item?.photoUrl} referrerPolicy="no-referrer" className="w-full h-full rounded-lg object-cover" />
                        </div>
                    ))}
                </>
            }
        </div>
    )
}
/**
 <div className="bg-secondaryCHover rounded-lg col-span-2 row-span-2"></div>
            <div className="bg-secondaryCHover rounded-lg"></div>
            <div className="bg-secondaryCHover rounded-lg"></div>
            <div className="bg-secondaryCHover rounded-lg"></div>
            <div className="bg-secondaryCHover rounded-lg"></div>
            <div className="bg-secondaryCHover rounded-lg"></div>
            <div className="bg-secondaryCHover rounded-lg"></div>
            <div className="bg-secondaryCHover rounded-lg"></div>
            <div className="bg-secondaryCHover rounded-lg"></div>
 */

const SkeletonLoader = () => {
    const { themeMode } = useContext(ThemeProvider);
    return (
        <>
            <div className="bg-secondaryCHover rounded-lg col-span-2 row-span-2"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
            <div className="bg-secondaryCHover rounded-lg"><Skeleton className="bg-skeletonColor w-full h-full" /></div>
        </>
    )
}