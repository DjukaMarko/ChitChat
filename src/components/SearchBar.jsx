import { useState } from "react";
import { auth, db } from "../config/firebase";
import { and, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { SearchInput } from "./SearchInput";

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
      <div className="flex relative flex-col space-y-4">
        <SearchInput searchInput={searchInput} setSearchInput={setSearchInput} usersRef={usersRef} setPossibleRequests={v => setPossibleRequests(v)} handleSearchSubmit={handleSearchSubmit} />
        {possibleRequests.length > 0 && (
          <div className="w-full space-y-2 p-3 flex flex-col overflow-scroll h-[250px] rounded-md bg-gray-300">
            {possibleRequests?.map((r) => {
              if (r !== auth?.currentUser?.displayName) {
                return (
                  <div key={r} className="flex items-center space-x-6">
                    <p>{r}</p>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleSendRequest(r)}
                        className="w-24 text-sm h-8 rounded-sm bg-green-500"
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
      </div>
    </>
  )
}