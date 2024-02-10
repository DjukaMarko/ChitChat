import { useEffect, useState } from "react";
import "./App.css";
import { Auth } from "./components/Auth";
import Cookies from "universal-cookie";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, real_db } from "./config/firebase";
import drag from "../public/drag.png"
import add from "../public/add.png"
import moment from 'moment';
import emptycart from "../public/undraw_blank_canvas.svg"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  addDoc,
  arrayUnion,
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
import { ChatBox } from "./components/ChatBox";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { ChatSidebar } from "./components/ChatSidebar";
import { RequestsSidebar } from "./components/RequestsSidebar";
import { Sidebar } from "./components/Sidebar";


const cookies = new Cookies();
function App() {
  const [isAuth, _] = useState(cookies.get("auth-token"));
  const [isChatOpened, setChatOpen] = useState(false);
  const [selectedSidebar, setSelectedSidebar] = useState(1); // 1 - chat, 2 - friend requests
  const [currentGroupId, setCurrentGroupId] = useState("");
  const [isChatSidebarLoading, setChatSidebarLoading] = useState(true);
  const [activeChatData, setActiveChatData] = useState({});
  const [memberListWindow, setMemberListWindow] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});
  const [myUserData, setMyUserData] = useState({});
  const [myGroups, setMyGroups] = useState([]);

  const usersRef = collection(db, "users");
  if (!isAuth) {
    return (
      <div>
        <Auth />
      </div>
    );
  }

  useEffect(() => {
    const fetchGroups = async () => {
      if (!myUserData) return;
      if (myUserData.groups === undefined) return;
      let snapshots_to_unmount = [];

      await Promise.all(myUserData.groups.map(async group => {
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
            updatedGroups.sort((a,b) => b?.lastMessageSent?.seconds - a?.lastMessageSent?.seconds)
            return updatedGroups;
          });
        });
        
        snapshots_to_unmount.push(unsubscribe);
      }));

      setChatSidebarLoading(false);
      return () => {
        snapshots_to_unmount.forEach(unsub => {
          unsub();
        })
      }
    }

    fetchGroups();
  }, [myUserData]);




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

  const hideChat = () => {
    setChatOpen(false)
    setCurrentGroupId("");
    setSelectedChat({});
  }

  const deleteChat = async (id) => {
    hideChat();
    let newGroups = myUserData.groups.filter(item => item !== id);
    setMyGroups(prevGroups => prevGroups.filter(group => group.id !== id));
    await updateDoc(doc(db, "users", myUserData.userId), {
      groups: newGroups,
    })
  }

  const formatTimeAgo = (timestamp) => {
    const currentTime = moment();
    const messageTime = moment(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
    const diffInMinutes = currentTime.diff(messageTime, 'minutes');
    const diffInHours = currentTime.diff(messageTime, 'hours');
    const diffInDays = currentTime.diff(messageTime, 'days');

    if (diffInMinutes < 1) {
      return 'now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `${diffInHours} h`;
    } else if (diffInDays < 7) {
      return messageTime.format('ddd').toLowerCase(); // Display the weekday if it's within the same week
    } else {
      return messageTime.format('MMMM D, YYYY'); // Fallback to a full date format
    }
  }

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
    <div className="w-full h-full min-h-screen relative flex">
      {memberListWindow &&
        <>

          <div onClick={() => setMemberListWindow(false)} className="bg-black bg-opacity-20 z-[100000] absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center">
          </div>
          <div className="absolute w-full h-full flex justify-center items-center">
            <div className="bg-white absolute z-[1000000] w-[550px] h-[350px] rounded-xl p-6 flex flex-col space-y-6">
              <div className="flex flex-col overflow-y-auto">
                {myUserData?.friends?.filter((item, index) => !checkIfExists(item, index)).map((item, index) => {
                  return (<div key={item?.userId} className="flex justify-between items-center hover:bg-[#f0f0f0] cursor-pointer p-2 rounded-xl">
                    <div className="flex space-x-4 items-center">
                      <img src={item?.photoUrl} referrerPolicy="no-referrer" className="w-[50px] h-[50px] rounded-full" />
                      <p className="text-sm md:text-md">{item?.display_name}</p>
                    </div>
                    <button onClick={(event) => {
                      handleAddMember(item, index)
                      event.currentTarget.disabled = true;
                    }} className="disabled:cursor-not-allowed disabled:opacity-50"><img src={add} className="w-[24px] h-[24px]" /> </button>
                  </div>)
                })}
              </div>
            </div>
          </div>
        </>
      }
      <Sidebar {...{ selectedSidebar, setSelectedSidebar, cookies }} />
      <PanelGroup direction="horizontal" className="w-full h-full min-h-screen flex">
        <Panel defaultSize={20} minSize={20} className={` ${isChatOpened ? "hidden md:block" : "block"} flex bg-white border-r-[1px] relative w-full flex-col justify-between`}>
          <div className="flex flex-col h-full max-h-screen">
            {isChatSidebarLoading
              ?
              <SkeletonLoader />
              :
              selectedSidebar === 1 ?
                <ChatSidebar
                  usersRef={usersRef}
                  formatTimeAgo={(t) => formatTimeAgo(t)}
                  myUserData={myUserData}
                  myGroups={myGroups}
                  selectedChat={selectedChat}
                  setActiveChatData={(v) => setActiveChatData(v)}
                  handleChat={(v) => handleChat(v)}
                  setChatOpen={(v) => setChatOpen(v)}
                  removeFriend={(r) => handleRemoveFriend(r)}
                  setCurrentGroupId={(v) => setCurrentGroupId(v)}
                  setSelectedChat={(v) => setSelectedChat(v)}
                />
                :
                <RequestsSidebar myUserData={myUserData} acceptRequest={(r) => handleAccept(r)} removeRequest={(r) => handleReject(r)} />

            }
          </div>
        </Panel>
        <PanelResizeHandle className="items-center hidden md:flex bg-[#f7f7f7] relative">
          <div className="absolute right-[-20px] cursor-pointer bg-white border-[1px] p-2 rounded-full w-[36px] h-[36px] z-[1000]">
            <img src={drag} className="w-full h-full" alt="Resize" />
          </div>
        </PanelResizeHandle>
        <Panel minSize={35} className={(isChatOpened ? "w-full max-h-screen" : "hidden md:flex justify-center items-center w-full max-h-screen")}>
          {
            isChatOpened && currentGroupId !== "" ? (
              <ChatBox setMyGroups={(v) => setMyGroups(v)} setMemberListWindow={(v) => setMemberListWindow(v)} formatTimeAgo={(t) => formatTimeAgo(t)} activeChatData={activeChatData} currentGroupId={currentGroupId} deleteChat={id => deleteChat(id)} hideChat={hideChat} />
            ) :
              <div className="flex flex-col justify-center items-center space-y-6">
                <img src={emptycart} className="w-36" />
                <div className="flex flex-col justify-center items-center text-sm">
                  <p className="font-[400] tracking-wide">Oops, it's too quiet in here! &#x1F60E;</p>
                  <p className="font-[400] tracking-wide">Start a conversation and break the silence!</p>
                </div>
              </div>
          }
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
