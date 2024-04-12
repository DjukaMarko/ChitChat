import { useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, real_db } from "@/config/firebase";
import emptycart from "@/../public/landing404illustration.svg"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { serverTimestamp as firestoreTimestamp } from "firebase/firestore";
import {
  ref,
  onDisconnect,
  update,
  serverTimestamp,
  onValue,
} from "firebase/database";
import { ChatBox } from "./ChatBox";
import { SkeletonLoader } from "./SkeletonLoader";
import { ChatSidebar } from "./ChatSidebar";
import { RequestsSidebar } from "./RequestsSidebar";
import { Sidebar } from "./Sidebar";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { PageContext } from "../misc/PageContext";
import { BookUser, GripVertical, LogOut, MessageSquareHeart } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { AnimatePresence, motion } from "framer-motion";
import { refresh } from "@/lib/utils";
import { ThemeProvider } from "../misc/ThemeProvider";

export default function HomeDashboard({ cookies }) {
    const { width } = useWindowDimensions();
    const [isChatOpened, setChatOpen] = useState(false);
    const [myUserData, setMyUserData] = useState({});
    const [myGroups, setMyGroups] = useState([]);
    const [selectedSidebar, setSelectedSidebar] = useState(1); // 1 - chat, 2 - friend requests
    const [currentGroupId, setCurrentGroupId] = useState("");
    const [isChatSidebarLoading, setChatSidebarLoading] = useState(true);
    const [activeChatData, setActiveChatData] = useState({});
    const [memberListWindow, setMemberListWindow] = useState(false);
    const { themeMode } = useContext(ThemeProvider);
    const usersRef = collection(db, "users");

    const [isSigningOut, setIsSigningOut] = useState(false);
    const handleSignOut = async () => {
        try {
            setIsSigningOut(true);
            await signOut(auth);
            cookies.set("auth-token", "");
            refresh();
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const fetchGroups = async () => {
            if (!myUserData || typeof myUserData.groups === "undefined") return;
            if (myUserData.groups.length === 0) setChatSidebarLoading(false);

            let snapshots_to_unmount = [];

            await Promise.all(myUserData.groups.filter(group => group.length > 0).map(async group => {
                const unsubscribe = onSnapshot(doc(db, "groups", group), async snapshot => {
                    const membersData = await Promise.all(snapshot.data().members.filter(member => member !== myUserData.userId).map(async member => {
                        let memberData = await getDoc(doc(db, "users", member));
                        return memberData.data();
                    }));

                    let groupData = {
                        ...snapshot.data(),
                        members: membersData,
                    };

                    setMyGroups((prev) => {
                        const updatedGroups = [groupData, ...prev.filter((prevGroup) => prevGroup.id !== groupData.id)];
                        updatedGroups.sort((a, b) => b?.lastMessageSent?.seconds - a?.lastMessageSent?.seconds)
                        return updatedGroups;
                    });
                });

                snapshots_to_unmount.push(unsubscribe);
            }));
            return () => {
                snapshots_to_unmount.forEach(unsub => {
                    unsub();
                })
            }
        }

        fetchGroups();
    }, [myUserData]);


    useEffect(() => {
        if (myGroups.length > 0) setChatSidebarLoading(false);
    }, [myGroups]);





    useEffect(() => {
        const fetch = async () => {
            let snapshots_to_unmount = [];
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const unsubscribe_user_snapshot = onSnapshot(doc(db, "users", auth?.currentUser?.uid), async snapshot => {
                        const friendsData = await Promise.all(snapshot.data().friends.map(async (friendId) => {
                            const friendSnapshot = await getDoc(doc(db, "users", friendId));
                            return friendSnapshot?.data();
                        }));

                        const requestsData = await Promise.all(snapshot.data().f_requests.map(async (request_id) => {
                            const friendSnapshot = await getDoc(doc(db, "users", request_id));
                            return friendSnapshot?.data();
                        }));

                        setMyUserData({
                            ...snapshot.data(),
                            f_requests: requestsData.filter(Boolean),
                            friends: friendsData.filter(Boolean),
                        });

                    });
                    snapshots_to_unmount.push(unsubscribe_user_snapshot);
                    var uid = auth?.currentUser?.uid;
                    // Create a reference to this user's specific status node.
                    var userStatusDatabaseRef = ref(real_db, "/status/" + uid);

                    // Define the offline and online status objects.
                    var isOfflineForDatabase = {
                        state: "away",
                        last_changed: serverTimestamp(),
                    };

                    var isOnlineForDatabase = {
                        state: "online",
                        last_changed: serverTimestamp(),
                    };

                    // Listen for changes in the connection status.

                    var isConnectedToRDB = ref(real_db, ".info/connected");
                    onValue(isConnectedToRDB, (snapshot) => {
                        if (snapshot.val() == false) {
                            return;
                        }

                        onDisconnect(userStatusDatabaseRef)
                            .set(isOfflineForDatabase)
                            .then(async () => {
                                update(userStatusDatabaseRef, isOnlineForDatabase);
                            });
                    });
                }
            });

            snapshots_to_unmount.push(unsubscribe);
            return () => {
                snapshots_to_unmount.forEach(unsubscribe => {
                    unsubscribe();
                });
            };
        };

        fetch();
    }, []);

    const handleReject = async (r) => {
        try {
            const myUser = await getDoc(doc(db, "users", auth?.currentUser?.uid));

            const q = query(
                usersRef,
                where("display_name", "==", r)
            );
            const otherUser = await getDocs(q);

            const requests = myUser.data().f_requests;
            const index = requests.indexOf(otherUser.docs[0].data().userId);
            if (index > -1) {
                requests.splice(index, 1);
                await updateDoc(doc(db, "users", myUser.data().userId), {
                    f_requests: requests,
                });
            }

            const otherRequests = otherUser.docs[0].data().f_requests;
            const otherIndex = otherRequests.indexOf(myUser.data().userId);
            if (otherIndex > -1) {
                otherRequests.splice(otherIndex, 1);
                await updateDoc(doc(db, "users", otherUser.docs[0].data().userId), {
                    f_requests: otherRequests,
                });
            }


        } catch (e) {
            console.error(e);
        }
    };

    const handleAccept = async (r) => {
        try {

            const myUser = await getDoc(doc(db, "users", auth?.currentUser?.uid));

            var q = query(usersRef, where("display_name", "==", r));
            var signedUser = await getDocs(q);


            const requests = myUser.data().f_requests;
            const index = requests.indexOf(signedUser.docs[0].data().userId);
            if (index > -1) {
                requests.splice(index, 1);
            }

            const otherRequests = signedUser.docs[0].data().f_requests;
            const otherIndex = otherRequests.indexOf(myUser.data().userId);
            if (otherIndex > -1) {
                otherRequests.splice(otherIndex, 1);
            }

            if (!myUser.data().friends.includes(signedUser.docs[0].data().userId)) {

                const previousFriends = myUser.data().friends;
                const newFriends = [...previousFriends, signedUser.docs[0].data().userId];
                await updateDoc(doc(db, "users", myUser.data().userId), {
                    friends: newFriends,
                    f_requests: requests,
                });

                if (signedUser.size > 0) {
                    for (const d of signedUser.docs) {
                        const previousFriends = d.data().friends;
                        const newFriends = [...previousFriends, myUser.data().userId];
                        await updateDoc(doc(db, "users", d.data().userId), {
                            friends: newFriends,
                            f_requests: otherRequests
                        });
                    }
                }
            }



        } catch (e) {
            console.error(e);
        }
    };

    const handleRemoveFriend = async (r) => {
        try {
            if (isChatOpened) hideChat();
            let [_, groupId] = await getGroup(r);
            if (groupId.length != 0) {
                const myUser = await getDoc(doc(db, "users", auth?.currentUser?.uid));

                const q = query(usersRef, where("display_name", "==", r));
                const otherUser = await getDocs(q);

                const myFriends = myUser.data().friends;
                const index = myFriends.indexOf(otherUser.docs[0].data().userId);
                if (index > -1) {
                    myFriends.splice(index, 1);
                }
                await updateDoc(doc(db, "users", myUser.data().userId), {
                    friends: myFriends,
                });


                const otherFriends = otherUser.docs[0].data().friends;
                const otherIndex = otherFriends.indexOf(auth?.currentUser?.uid);
                if (otherIndex > -1) {
                    otherFriends.splice(otherIndex, 1);
                }
                await updateDoc(doc(db, "users", otherUser.docs[0].data().userId), {
                    friends: otherFriends,
                });
            }

        } catch (e) {
            console.error(e);
        }
    };

    const handleChat = async (username) => {
        setChatOpen(true);

        const [other_user, commonGroups] = await getGroup(username);

        if (commonGroups.length == 0) {
            const newDocRef = await addDoc(collection(db, "groups"), {
                createdAt: firestoreTimestamp(),
                createdBy: auth?.currentUser?.uid,
                members: [auth?.currentUser?.uid, other_user.docs[0].data().userId],
                id: ''
            })

            // Access the ID of the newly created document using the id property of the reference
            const newDocId = newDocRef.id;


            // Update the document with the actual ID
            await updateDoc(newDocRef, { id: newDocId });
            setCurrentGroupId(newDocId);
        } else {
            setCurrentGroupId(commonGroups[0].data().id);
        }
    }

    const deleteChat = async (id) => {
        hideChat();
        let newGroups = myUserData.groups.filter(item => item !== id);
        setMyGroups(prevGroups => prevGroups.filter(group => group.id !== id));
        await updateDoc(doc(db, "users", myUserData.userId), {
            groups: newGroups,
        })
    }

    const getGroup = async (username) => {

        const qOtherUser = query(usersRef, where("display_name", "==", username));
        const otherUser = await getDocs(qOtherUser);

        const myGroupsQuery = query(
            collection(db, 'groups'),
            where('members', 'array-contains', myUserData.userId)
        );

        const otherGroupsQuery = query(
            collection(db, 'groups'),
            where('members', 'array-contains', otherUser.docs[0].data().userId)
        );

        // Combine the results of the two queries
        const result1 = await getDocs(myGroupsQuery);
        const result2 = await getDocs(otherGroupsQuery);

        let commonGroups = result1.docs.filter(doc1 =>
            result2.docs.some(doc2 => doc1.id === doc2.id)
        );

        commonGroups = commonGroups.filter(el => el.data().members.length === 2);

        return [otherUser, commonGroups];
    }


    const hideChat = () => {
        setChatOpen(false);
        setActiveChatData({});
        setCurrentGroupId("");
    }


    return (
        <div className={`${themeMode === "dark" ? "dark" : "light"} w-full h-[calc(100dvh)] relative flex bg-backgroundTheme`}>
            <PageContext.Provider
                value={{
                    width,
                    myUserData,
                    myGroups,
                    currentGroupId,
                    activeChatData,
                    deleteChat,
                }}
            >
                <Sidebar {...{ selectedSidebar, setSelectedSidebar, cookies, isSigningOut, handleSignOut }}  />
                <PanelGroup direction="horizontal" className="w-full h-full flex">
                    <Panel
                        defaultSize={width > 900 ? 40 : 50}
                        minSize={width > 900 ? 40 : 50}
                        className={` ${isChatOpened ? "hidden md:block" : "block"} flex border-r-[1px] border-secondaryC relative w-full flex-col justify-between h-full`}>
                        <div className="relative flex flex-col w-full h-full overflow-y-scroll scrollbar-hide">
                            <div className="relative w-full h-[calc(100dvh-3rem)] md:h-[calc(100dvh)] flex flex-col p-4 overflow-y-scroll">
                                {isChatSidebarLoading
                                    ?
                                    <SkeletonLoader />
                                    :
                                    selectedSidebar === 1 ?
                                        <ChatSidebar
                                            usersRef={usersRef}
                                            setActiveChatData={(v) => setActiveChatData(v)}
                                            handleChat={(v) => handleChat(v)}
                                            setChatOpen={(v) => setChatOpen(v)}
                                            removeFriend={(r) => handleRemoveFriend(r)}
                                            setCurrentGroupId={(v) => setCurrentGroupId(v)}
                                        />
                                        :
                                        <RequestsSidebar
                                            acceptRequest={(r) => handleAccept(r)}
                                            removeRequest={(r) => handleReject(r)} />


                                }
                            </div>
                            <div className="bg-backgroundTheme w-full h-[3rem] md:hidden border-t-[1px] border-secondaryC flex z-[5]">
                                <div onClick={() => setSelectedSidebar(1)} className={`flex justify-center items-center h-full grow ${selectedSidebar === 1 && !isSigningOut && "bg-secondaryCHover border-t-[2px] border-red-800"} hover:bg-secondaryCHover p-3`}><MessageSquareHeart size={20} color={selectedSidebar === 1 ? "#991b1b" :  themeMode === "dark" ? "#ffffff" : "#000000"} /></div>
                                <div onClick={() => setSelectedSidebar(2)} className={`flex justify-center items-center h-full grow ${selectedSidebar === 2 && !isSigningOut && "bg-secondaryC border-t-[2px] border-red-800"} hover:bg-secondaryCHover p-3`}><BookUser size={20} color={selectedSidebar === 2 ? "#991b1b" :  themeMode === "dark" ? "#ffffff" : "#000000"} /></div>
                                <div onClick={handleSignOut} className={`flex justify-center items-center h-full grow ${isSigningOut && "bg-secondaryC border-t-[2px] border-red-800"} hover:bg-secondaryCHover p-3`}>{isSigningOut ? <BeatLoader size={4} color="#991b1b" /> : <LogOut size={20} color={themeMode === "dark" ? "#ffffff" : "#000000"} />} </div>
                            </div>
                        </div>
                    </Panel>
                    <PanelResizeHandle className="items-center hidden md:flex relative">
                        <div className="absolute -right-4 cursor-pointer bg-backgroundTheme border-[1px] border-secondaryC p-2 rounded-full w-8 h-8 z-[1] flex items-center justify-center">
                            <GripVertical color={themeMode === "dark" ? "#fff" : "#000"} className="w-4 h-4" />
                        </div>
                    </PanelResizeHandle>
                    <Panel minSize={35} className={`w-full h-full ${(!isChatOpened && "hidden md:flex justify-center items-center")}`}>

                        <AnimatePresence>
                            {isChatOpened && (
                                <ChatBox
                                    memberListWindow={memberListWindow}
                                    setMemberListWindow={(v) => setMemberListWindow(v)}
                                    hideChat={hideChat}
                                />
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {!isChatOpened && (
                                <EmptyChatWindow />
                            )}
                        </AnimatePresence>

                    </Panel>
                </PanelGroup>
            </PageContext.Provider>
        </div>
    )
}

const EmptyChatWindow = () => {
    return (
        <motion.div
            key="emptychatwindow"
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            transition={{ duration: 0.1 }} className="flex flex-col justify-center items-center space-y-6">
            <img src={emptycart} className="w-32 sm:w-64" />
            <div className="flex flex-col justify-center items-center text-sm text-textColor">
                <p className="font-[400] tracking-wide">Oops, it's too quiet in here! &#x1F60E;</p>
                <p className="font-[400] tracking-wide">Start a conversation and break the silence!</p>
            </div>
        </motion.div>
    )
}