import Cookies from "universal-cookie";
import { auth, db, googleProvider } from "@/config/firebase";
import { signInWithPopup } from "firebase/auth";
import arrows from "@/../public/arrows.png";
import blankpfp from "@/../public/blankpfp.png"
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { DescriptionChitChat } from "./DescriptionChitChat";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { useContext, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { collection, getDocs, doc, query, where, setDoc } from "firebase/firestore";
import { refresh } from "@/lib/utils";
import { ThemeProvider } from "../misc/ThemeProvider";

const cookies = new Cookies();

export const Auth = () => {
  const [isMobileNavClicked, setMobileNavClicked] = useState(false);
  const [selectedNavbar, setSelectedNavbar] = useState("Home");
  const usersRef = collection(db, "users");

  const { themeMode } = useContext(ThemeProvider);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const q = query(usersRef, where("userId", "==", result.user.uid));
      const user_to_sign = await getDocs(q);
      if (user_to_sign.size === 0) {
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
    <div className={`${themeMode === "dark" ? "dark" : "light"} bg-backgroundTheme`}>
      <div className="max-w-[2500px] mx-auto relative">
        <AnimatePresence>
          {isMobileNavClicked && (
              <MobileNav selectedNavbar={selectedNavbar} setMobileNavClicked={setMobileNavClicked} />
          )}
        </AnimatePresence>
        <Navbar setMobileNavClicked={setMobileNavClicked} />
        <Hero handleSignIn={handleSignIn} />

        <div className="bg-landingWaves">
          <div className="relative w-full py-16">
            <div className={`w-16 h-16 mx-auto flex justify-center items-center rounded-full bg-landingWaves drop-shadow-xl shadow-inner`}>
              <img src={arrows} className="w-8" />
            </div>
          </div>

          <DescriptionChitChat handleSignIn={handleSignIn} />
          <Footer />
        </div>

      </div>
    </div>
  );
};
