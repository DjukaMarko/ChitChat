import { motion } from "framer-motion";
import { Switch } from "./switch";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { useContext } from "react";
import { ThemeProvider } from "../misc/ThemeProvider";
import { X } from "lucide-react";

export const MobileNav = ({
  setMobileNavClicked,
  selectedNavbar,
}) => {

  const { themeMode, handleChangeThemeMode } = useContext(ThemeProvider);
  return (
    <motion.div
      initial={{ x: 100 }}
      animate={{ x: 0 }}
      exit={{ x: 100 }}
      transition={{ duration: 0.2 }}
      className="fixed bg-backgroundTheme md:hidden top-0 right-0 bottom-0 z-[2] w-full h-screen-safe"
    >
      <div
        onClick={() => setMobileNavClicked(false)}
        className="w-[35px] h-[35px] top-10 right-14 cursor-pointer flex absolute flex-col space-y-2 md:hidden"
      >
        <X color={themeMode === "dark" ? "#fff" : "#000"} size={36} className="absolute top-8 right-8" />
      </div>
      <div className="w-full h-full flex flex-col p-6">
        <div className="w-full h-full flex justify-center items-center">
          <ul className="space-y-6 font-[800] flex flex-col justfiy-center items-center">
            <motion.li
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 1.1 }}
              className={`cursor-pointer tracking-wider ${selectedNavbar === "Home"
                ? "bg-gradient-to-r from-[#a20707] to-[#f40e0e] text-white rounded-3xl"
                : ""
                } px-6 flex justify-center items-center py-2`}
            >
              Home
            </motion.li>
            <motion.li
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 1.1 }}
              className={`cursor-pointer tracking-wider ${selectedNavbar === "About Us"
                ? "bg-gradient-to-r from-[#a20707] to-[#f40e0e] ${} rounded-3xl"
                : ""
                } px-6 flex justify-center items-center  py-2 text-textColor`}
            >
              About Us
            </motion.li>
            <motion.li
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 1.1 }}
              className={`cursor-pointer tracking-wider ${selectedNavbar === "Sign Up"
                ? `bg-gradient-to-r from-[#a20707] to-[#f40e0e] rounded-3xl`
                : ""
                } px-6  flex justify-center items-center py-2 text-textColor`}
            >
              Sign Up
            </motion.li>
          </ul>
        </div>
        <div className="flex justify-center items-center space-x-3">
          <Switch
            checked={themeMode === 'light'}
            onCheckedChange={() => handleChangeThemeMode(themeMode === 'light' ? 'dark' : 'light')}
          />
          <DarkModeSwitch
            checked={themeMode === 'dark'}
            moonColor="#fff"
            sunColor="#991b1b"
            onChange={(checked) => handleChangeThemeMode(checked ? 'dark' : 'light')}
            size={20}
          />
        </div>
      </div>
    </motion.div>
  );
};
