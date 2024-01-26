import { useState } from "react";
import { auth, db } from "../config/firebase";
import { and, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import search from "../../public/search.png"
import arrow from "../../public/arrow.png"
export const SearchBar = ({ usersRef }) => {

    const [searchInput, setSearchInput] = useState("");
    const [possibleRequests, setPossibleRequests] = useState([]);

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
          const signed_user = await getDocs(q);
    
          const my_user = await getDoc(doc(db, "users", auth?.currentUser?.uid));
    
          if (signed_user.size > 0) {
            for (const d of signed_user.docs) {
              const previousRequests = d.data().f_requests;
              const friends = d.data().friends;
    
              if (
                friends.includes(my_user.data().userId) ||
                previousRequests.includes(my_user.data().userId) ||
                my_user.data().f_requests.includes(r)
              ) {
                return;
              }
              const newRequestsSet = new Set([
                ...previousRequests,
                my_user.data().userId,
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
            <div className="group">
              <div className="py-2 flex space-x-2 items-center px-5 rounded-xl bg-[#f7f7f7] group-hover:bg-[#f0f0f0] font-light outline-0">
                <img src={search} className="w-[16px] h-[16px]" />
                <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="text-sm md:text-base outline-0 border-0 w-full bg-[#f7f7f7] font-[400] placeholder-[#9e9e9e] group-hover:bg-[#f0f0f0]"
                    type="text"
                    placeholder="Search For Friends"
                />
                <button onClick={handleSearchSubmit} className="w-[16px] h-[16px] disabled:cursor-not-allowed disabled:opacity-50" disabled={searchInput === "" ? true : false}><img src={arrow} className="w-full h-full" /></button>
              </div>
            </div>
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