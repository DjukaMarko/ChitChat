import { useEffect, useState } from "react";
import { auth, db } from "@/config/firebase";
import { and, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { SearchInput } from "./SearchInput";
import { AnimatePresence, motion } from "framer-motion";
import GridRandomFriends from "./GridRandomFriends";
import SearchFriends from "./SearchFriends";

export const SearchBar = ({ usersRef }) => {

  const [isLoading, setLoading] = useState(true);
  const [isSearchMenuOpened, setSearchMenuOpened] = useState(false);
  const [possibleRequests, setPossibleRequests] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const updateStateWithDelay = () => {
      if (searchInput === "") {
        setSearchMenuOpened(false);
        setPossibleRequests([]);
      }
    };

    const timeoutId = setTimeout(updateStateWithDelay, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handleSearchSubmit = async (str) => {
    try {
      if (str !== "") {
        const q = query(
          usersRef,
          and(
            where("username", ">=", str.toLowerCase()),
            where("username", "<=", str.toLowerCase() + "\uf8ff"),
            where("username", "!=", auth?.currentUser?.displayName.toLowerCase())
          )
        );
        const listUsers = await getDocs(q);
        let myData = (await getDoc(doc(db, "users", auth?.currentUser?.uid))).data();
        const myuserFriendsIds = myData.friends;

        const filteredRequests = listUsers.docs.filter((d) => {
          const docSnap = d.data();
          if(!myuserFriendsIds.includes(docSnap.userId)) {
            return docSnap;
          }
        });

        const requests = filteredRequests.map((d) => d.data());
        setPossibleRequests(requests);
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendRequest = async (r) => {
    try {
      const q = query(usersRef, where("display_name", "==", r));
      const signedUser = await getDocs(q);

      const myUser = await getDoc(doc(db, "users", auth?.currentUser?.uid));

      if (signedUser.size > 0) {
        for (const d of signedUser.docs) {
          const previousRequests = d.data().f_requests;
          const friends = d.data().friends;

          if (
            friends.includes(myUser.data().userId) ||
            previousRequests.includes(myUser.data().userId) ||
            myUser.data().f_requests.includes(r)
          ) {
            return;
          }
          const newRequestsSet = new Set([
            ...previousRequests,
            myUser.data().userId,
          ]);
          const newRequests = Array.from(newRequestsSet);

          await updateDoc(doc(db, "users", d.data().userId), {
            f_requests: newRequests,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <>
      <div className="flex relative flex-col bg-secondaryC rounded-xl">
        <SearchInput isSearchMenuOpened={isSearchMenuOpened} setSearchMenuOpened={setSearchMenuOpened} searchInput={searchInput} setSearchInput={setSearchInput} usersRef={usersRef} possibleRequests={possibleRequests} setPossibleRequests={v => setPossibleRequests(v)} handleSearchSubmit={handleSearchSubmit} />
        <AnimatePresence>
          {isSearchMenuOpened && (
            <motion.div
              key="searchAnimation"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "16rem", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex rounded-b-xl w-full max-h-64 border-t-[1px] border-secondaryCHover">

              <GridRandomFriends handleSendRequest={handleSendRequest} />
              <SearchFriends handleSendRequest={handleSendRequest} possibleRequests={possibleRequests} isLoading={isLoading} />

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}




/*
{possibleRequests.length > 0 && (
          <div className="z-[1] rounded-b-xl w-full h-32 flex flex-col overflow-y-scroll p-4">
            {possibleRequests?.map((r) => {
              if (r !== auth?.currentUser?.displayName) {
                return (
                  <div key={r} className="flex items-center space-x-6">
                    <p className="text-textColor">{r}</p>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleSendRequest(r)}
                        className="w-24 text-sm h-8 rounded-sm bg-green-500 hover:bg-green-400"
                      >
                        Add Friend
                      </button>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}


*/