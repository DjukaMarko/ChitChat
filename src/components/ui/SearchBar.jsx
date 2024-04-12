import { useState } from "react";
import { auth, db } from "@/config/firebase";
import { and, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { SearchInput } from "./SearchInput";
import { AnimatePresence, motion } from "framer-motion";

export const SearchBar = ({ usersRef }) => {

  const [possibleRequests, setPossibleRequests] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = async () => {
    try {
        if (searchInput !== "") {
            const q = query(
                usersRef,
                and(
                    where("username", ">=", searchInput.toLowerCase()),
                    where("username", "<=", searchInput.toLowerCase() + "\uf8ff"),
                    where("username", "!=", auth?.currentUser?.displayName.toLowerCase())
                )
            );
            const listUsers = await getDocs(q);
            const requests = listUsers.docs.map((d) => {
                const docSnap = d.data();
                return docSnap.display_name;
            });

            setPossibleRequests(requests);
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
        <SearchInput searchInput={searchInput} setSearchInput={setSearchInput} usersRef={usersRef} possibleRequests={possibleRequests} setPossibleRequests={v => setPossibleRequests(v)} handleSearchSubmit={handleSearchSubmit} />
        <AnimatePresence>
          {possibleRequests.length > 0 && (
            <motion.div 
              key="searchAnimation" 
              initial={{ height: 0 }} 
              animate={{ height: "16rem" }} 
              exit={{ height: 0 }} 
              transition={{ duration: 0.2 }} 
              className="flex z-[1] rounded-b-xl w-full border-t-[1px] border-secondaryCHover">

              <div className="grow h-full grid grid-rows-3 grid-columns-3 gap-1 rounded-bl-lg border-r-[1px] border-secondaryCHover p-1">
                <div className="bg-secondaryCHover rounded-lg"></div>
                <div className="bg-secondaryCHover rounded-lg col-start-2"></div>
                <div className="bg-secondaryCHover rounded-lg"></div>
                <div className="bg-secondaryCHover rounded-lg"></div>
                <div className="bg-secondaryCHover rounded-lg"></div>
                <div className="bg-secondaryCHover rounded-lg"></div>
              </div>
              <div className="grow h-full rounded-br-lg flex flex-col space-y-1 p-1 overflow-y-scroll">
                <div className="w-full h-12 bg-secondaryCHover rounded-lg"></div>
                <div className="w-full h-12 bg-secondaryCHover rounded-lg"></div>
                <div className="w-full h-12 bg-secondaryCHover rounded-lg"></div>
                <div className="w-full h-12 bg-secondaryCHover rounded-lg"></div>
                <div className="w-full h-12 bg-secondaryCHover rounded-lg"></div>
                <div className="w-full h-12 bg-secondaryCHover rounded-lg"></div>
                <div className="w-full h-12 bg-secondaryCHover rounded-lg"></div>
                <div className="w-full h-12 bg-secondaryCHover rounded-lg"></div>
                <div className="w-full h-12 bg-secondaryCHover rounded-lg"></div>
                <div className="w-full h-12 bg-secondaryCHover rounded-lg"></div>
          
              </div>
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