import Cookies from "universal-cookie";
import { auth, db, googleProvider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import arrows from "../../public/arrows.png";
import blankpfp from "../../public/blankpfp.jpg"
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { DescriptionChitChat } from "./DescriptionChitChat";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { collection, getDocs, doc, query, where, setDoc } from "firebase/firestore";
import "../Auth.css"

const cookies = new Cookies();

export const Auth = () => {
  const [isMobileNavClicked, setMobileNavClicked] = useState(false);
  const [selectedNavbar, setSelectedNavbar] = useState("Home");
  const usersRef = collection(db, "users");

  const refresh = () => window.location.reload(true);
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const q = query(usersRef, where("userId", "==", result.user.uid));
      const user_to_sign = await getDocs(q);
      if(user_to_sign.size === 0) {
        await setDoc(doc(db, "users", auth?.currentUser?.uid), {
          userId: result.user.uid,
          username: result.user.displayName.toLowerCase(),
          display_name: result.user.displayName,
          photoUrl: (result.user.photoURL === "" ? blankpfp : result.user.photoURL),
          activityStatus: "online",
          f_requests: [],
          friends: [],
          groups: [],
          lastActive: 0,
        })
      }
      cookies.set("auth-token", result.user.refreshToken);
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="max-w-[2500px] mx-auto relative background">
        <AnimatePresence>
          {isMobileNavClicked && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              exit={{ opacity:0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="fixed md:hidden top-0 right-0 bottom-0 z-[1000000] bg-white"
            >
              <MobileNav selectedNavbar={selectedNavbar} isMobileNavClicked={isMobileNavClicked} setMobileNavClicked={setMobileNavClicked} />
            </motion.div>
          )}
        </AnimatePresence>
        <Navbar setMobileNavClicked={setMobileNavClicked} />
        <Hero handleSignIn={handleSignIn} />

        <div className="w-full my-16">
          <div className="w-16 h-16 mx-auto flex justify-center items-center rounded-full bg-white drop-shadow-xl shadow-inner">
            <img src={arrows} className="w-8" />
          </div>
        </div>

        <DescriptionChitChat handleSignIn={handleSignIn} />
        <Footer />
      </div>
    </>
  );
};
