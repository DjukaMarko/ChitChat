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
import { SearchInput } from "./components/SearchInput";

const cookies = new Cookies();
function App() {
  const [isAuth, _] = useState(cookies.get("auth-token"));
  const [f_requests, setFrequests] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentFriends, setCurrentFriends] = useState([]);
  const [isChatOpened, setChatOpen] = useState(false);
  const [selectedSidebar, setSelectedSidebar] = useState(1); // 1 - chat, 2 - friend requests
  const [currentGroupId, setCurrentGroupId] = useState("");
  const [isChatSidebarLoading, setChatSidebarLoading] = useState(true);
  const [activeChatData, setActiveChatData] = useState({});
  const [memberListWindow, setMemberListWindow] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});

  const [searchInput, setSearchInput] = useState("");

  const [isAddMemberClicked, setAddMemberClicked] = useState(false);

  const usersRef = collection(db, "users");
  if (!isAuth) {
    return (
      <div>
        <Auth />
      </div>
    );
  }

  console.log(currentFriends)

  let comparator = (a, b) => {
    if (a?.lastMessageSent?.seconds > b?.lastMessageSent?.seconds) return 1;
    else if (a?.lastMessageSent?.seconds < b?.lastMessageSent?.seconds) return -1;
    else return 0;
  }

  let getChats = async (uid) => {
    var user_db = await getDoc(doc(db, "users", uid));
    console.log(user_db.data().groups.length);
    if (user_db.data().groups.length === 0) return [];

    let newChats = await Promise.all(user_db.data().groups.map(async (e) => {
      let group = await getDoc(doc(db, "group", e));
      let messages_db = await getDoc(doc(db, "messages", e));

      let allMembers = await Promise.all(
        group?.data().members?.filter((memberId) => {
          if (memberId === auth?.currentUser?.uid) return false;
          return true;
        })?.map(async (memberId) => {
          // Handle the case where eachMember?.data() might be null or undefined
          let eachMember = await getDoc(doc(db, "users", memberId));
          return {
            display_name: eachMember?.data()?.display_name || "Unknown",
            photoUrl: eachMember?.data()?.photoUrl || "",
            activityStatus: eachMember?.data()?.activityStatus || "away",
            id: eachMember?.data()?.userId || "",
          };
        })
      );


      let allData = {
        id: group?.data().id,
        lastMessage: messages_db?.data().lastMessage,
        lastMessageSent: messages_db?.data().lastMessageSent,
        lastMessageSentBy: messages_db?.data().lastMessageSentBy,
        members: allMembers
      };

      return allData;
    }));

    setChats(newChats.sort(comparator).reverse());
  };

  useEffect(() => {
    const fetch = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          var uid = auth?.currentUser?.uid;
          await getChats(uid);
          setChatSidebarLoading(false);
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
      return () => {
        unsubscribe();
      };
    };

    fetch();
  }, []);


  useEffect(() => {
    let fetch = async () => {
      try {
        if (!auth?.currentUser?.uid) {
          console.log("User not authenticated");
          return;
        }
        let snapshots_to_unmount = [];

        var user_db = await getDoc(doc(db, "users", auth?.currentUser?.uid));

        await Promise.all(user_db.data().groups.map(async (e) => {
          const unsubscribe = onSnapshot(doc(db, "messages", e), async (snapshot) => {
            const updatedLastMessage = snapshot.data();
            let groupDoc = await getDoc(doc(db, "group", updatedLastMessage.id));

            let allMembers = groupDoc?.data()?.members?.filter((memberId) => {
              if (memberId === auth?.currentUser?.uid) return false;
              return true;
            })?.map(async (memberId) => {
              let eachMember = await getDoc(doc(db, "users", memberId));
              return {
                display_name: eachMember?.data()?.display_name || "Unknown",
                photoUrl: eachMember?.data()?.photoUrl || "",
                activityStatus: eachMember?.data()?.activityStatus || "away",
                id: eachMember?.data()?.userId || "",
              };
            });

            allMembers = await Promise.all(allMembers);

            let allData = {
              id: updatedLastMessage.id,
              lastMessage: updatedLastMessage.lastMessage,
              lastMessageSent: updatedLastMessage.lastMessageSent,
              lastMessageSentBy: updatedLastMessage.lastMessageSentBy,
              members: allMembers,
            };

            setChats((prevChats) => {
              const index = prevChats.findIndex((chat) => chat.id === updatedLastMessage.id);
              try {
                if (index !== -1) {
                  const newChats = [...prevChats];
                  newChats[index] = { ...newChats[index], ...allData };
                  return newChats.sort(comparator).reverse();
                }
                return [allData, ...prevChats];
              } catch (error) {
                console.error("Error fetching data:", error);
                return prevChats.sort(comparator).reverse();
              }
            });
          });

          snapshots_to_unmount.push(unsubscribe);
        }));

        let unsubscribe = onSnapshot(doc(db, "users", auth?.currentUser?.uid), async (snapshot) => {
          const updatedUserData = snapshot.data();

          if (updatedUserData) {
            const friendsData = await Promise.all(updatedUserData.friends.map(async (friendId) => {
              const friendSnapshot = await getDoc(doc(db, "users", friendId));
              return friendSnapshot?.data();
            }));

            const requestsData = await Promise.all(updatedUserData.f_requests.map(async (request_id) => {
              const friendSnapshot = await getDoc(doc(db, "users", request_id));
              return friendSnapshot?.data();
            }));

            await getChats(auth?.currentUser?.uid);

            setCurrentFriends(friendsData.filter(Boolean));
            setFrequests(requestsData.filter(Boolean));
            
          }
        });

        snapshots_to_unmount.push(unsubscribe);

        return () => {
          snapshots_to_unmount.forEach((unsubscribeFunction) => {
            unsubscribeFunction();
          });
        };
      } catch (err) {
        console.error(err);
      }
    };

    fetch();
  }, [auth?.currentUser?.uid, currentGroupId]);


  const handleReject = async (r) => {
    try {
      const my_user = await getDoc(doc(db, "users", auth?.currentUser?.uid));

      const q2 = query(
        usersRef,
        where("display_name", "==", r)
      );
      const other_user = await getDocs(q2);


      const requests = my_user.data().f_requests;
      const index = requests.indexOf(other_user.docs[0].data().userId);
      if (index > -1) {
        requests.splice(index, 1);
        await updateDoc(doc(db, "users", my_user.data().userId), {
          f_requests: requests,
        });
      }

      const other_requests = other_user.docs[0].data().f_requests;  // This code might be redundant. (from 194 to 201)
      const other_index = other_requests.indexOf(my_user.data().userId);
      if (other_index > -1) {
        other_requests.splice(other_index, 1);
        await updateDoc(doc(db, "users", other_user.docs[0].data().userId), {
          f_requests: other_requests,
        });
      }


    } catch (e) {
      console.error(e);
    }
  };

  const handleAccept = async (r) => {
    try {

      const my_user = await getDoc(doc(db, "users", auth?.currentUser?.uid));

      var q2 = query(usersRef, where("display_name", "==", r));
      var signed_user2 = await getDocs(q2);


      const requests = my_user.data().f_requests;
      const index = requests.indexOf(signed_user2.docs[0].data().userId);
      if (index > -1) {
        requests.splice(index, 1);
      }

      const other_requests = signed_user2.docs[0].data().f_requests;
      const other_index = other_requests.indexOf(my_user.data().userId);
      if (other_index > -1) {
        other_requests.splice(other_index, 1);
      }

      if (!my_user.data().friends.includes(signed_user2.docs[0].data().userId)) {

        const previousFriends = my_user.data().friends;
        const newFriends = [...previousFriends, signed_user2.docs[0].data().userId];
        await updateDoc(doc(db, "users", my_user.data().userId), {
          friends: newFriends,
          f_requests: requests,
        });

        if (signed_user2.size > 0) {
          for (const d of signed_user2.docs) {
            const previousFriends = d.data().friends;
            const newFriends = [...previousFriends, my_user.data().userId];
            await updateDoc(doc(db, "users", d.data().userId), {
              friends: newFriends,
              f_requests: other_requests
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
        const my_user = await getDoc(doc(db, "users", auth?.currentUser?.uid));

        const q = query(usersRef, where("display_name", "==", r));
        const other_user = await getDocs(q);

        const my_friends = my_user.data().friends;
        const index = my_friends.indexOf(other_user.docs[0].data().userId);
        if (index > -1) {
          my_friends.splice(index, 1);
        }
        await updateDoc(doc(db, "users", my_user.data().userId), {
          friends: my_friends,
        });


        const other_friends = other_user.docs[0].data().friends;
        const other_index = other_friends.indexOf(auth?.currentUser?.uid);
        if (other_index > -1) {
          other_friends.splice(other_index, 1);
        }
        await updateDoc(doc(db, "users", other_user.docs[0].data().userId), {
          friends: other_friends,
        });
      }

    } catch (e) {
      console.error(e);
    }
  };



  const getGroup = async (username) => {

    const q_other_user = query(usersRef, where("display_name", "==", username));
    const other_user = await getDocs(q_other_user);

    const query1 = query(
      collection(db, 'group'),
      where('members', 'array-contains', auth?.currentUser?.uid)
    );

    const query2 = query(
      collection(db, 'group'),
      where('members', 'array-contains', other_user.docs[0].data().userId)
    );

    // Combine the results of the two queries
    const result1 = await getDocs(query1);
    const result2 = await getDocs(query2);

    let commonGroups = result1.docs.filter(doc1 =>
      result2.docs.some(doc2 => doc1.id === doc2.id)
    );

    commonGroups = commonGroups.filter(el => el.data().members.length === 2);

    return [other_user, commonGroups];
  }

  const handleChat = async (username) => {
    setChatOpen(true);

    const [other_user, commonGroups] = await getGroup(username);

    if (commonGroups.length == 0) {
      const newDocRef = await addDoc(collection(db, "group"), {
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
    const my_user = await getDoc(doc(db, "users", auth?.currentUser?.uid));
    let user_groups = my_user.data().groups;
    let new_groups = user_groups.filter(item => item !== id);
    await updateDoc(doc(db, "users", my_user.data().userId), {
      groups: new_groups,
    })
  }

  const formatTimeAgo = (timestamp) => {
    const currentTime = moment();
    const messageTime = moment(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
    const diffInMinutes = currentTime.diff(messageTime, 'minutes');
    const diffInHours = currentTime.diff(messageTime, 'hours');
    const diffInDays = currentTime.diff(messageTime, 'days');

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return messageTime.format('ddd'); // Display the weekday if it's within the same week
    } else {
      return messageTime.format('MMMM D, YYYY'); // Fallback to a full date format
    }
  }

  const handleAddMember = async (item, index) => {
    let currentgroup = await getDoc(doc(db, "group", currentGroupId));
    console.log(currentgroup.data());
    await updateDoc(doc(db, "group", currentGroupId), {
      members: arrayUnion(item?.userId),
    })

  }

  let checkIfExists = (item, index) => {
    for (let i = 0; i < activeChatData.length; i++) {
      if (activeChatData[i].display_name === item?.display_name) return true;
    }
    return false;
  }


  //<SearchInput searchInput={searchInput} setSearchInput={setSearchInput} handleSearchSubmit={() => console.log("hey")} />
  return (
    <div className="w-full h-full min-h-screen relative flex">
      {memberListWindow &&
        <>

          <div onClick={() => setMemberListWindow(false)} className="bg-black bg-opacity-20 z-[100000] absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center">
          </div>
          <div className="absolute w-full h-full flex justify-center items-center">
            <div className="bg-white absolute z-[1000000] w-[550px] h-[350px] rounded-xl p-6 flex flex-col space-y-6">
              <div className="flex flex-col overflow-y-auto">
                {currentFriends.filter((item, index) => !checkIfExists(item, index)).map((item, index) => {
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
        <Panel defaultSize={30} minSize={30} className={` ${isChatOpened ? "hidden md:block" : "block"} flex bg-white border-r-[1px] relative w-full flex-col justify-between shadow-lg`}>
          <div className="flex flex-col h-full max-h-screen">
            {isChatSidebarLoading
              ?
              <SkeletonLoader />
              :
              selectedSidebar === 1 ?
                <ChatSidebar
                  usersRef={usersRef}
                  formatTimeAgo={(t) => formatTimeAgo(t)}
                  chats={chats}
                  currentFriends={currentFriends}
                  selectedChat={selectedChat}
                  setActiveChatData={(v) => setActiveChatData(v)}
                  handleChat={(v) => handleChat(v)}
                  setChatOpen={(v) => setChatOpen(v)}
                  removeFriend={(r) => handleRemoveFriend(r)}
                  setCurrentGroupId={(v) => setCurrentGroupId(v)}
                  setSelectedChat={(v) => setSelectedChat(v)}
                />
                :
                <RequestsSidebar requests={f_requests} acceptRequest={(r) => handleAccept(r)} removeRequest={(r) => handleReject(r)} />

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
              <ChatBox setMemberListWindow={(v) => setMemberListWindow(v)} formatTimeAgo={(t) => formatTimeAgo(t)} activeChatData={activeChatData} currentGroupId={currentGroupId} deleteChat={id => deleteChat(id)} hideChat={hideChat} />
            ) :
              <div className="flex flex-col justify-center items-center space-y-6">
                <img src={emptycart} className="w-[220px] h-[220px]" />
                <div className="flex flex-col justify-center items-center">
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
