import { motion } from "framer-motion";

export const MobileNav = ({
  isMobileNavClicked,
  setMobileNavClicked,
  selectedNavbar,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div
        onClick={() => setMobileNavClicked(false)}
        className="w-[35px] h-[35px] top-10 right-14 cursor-pointer flex absolute flex-col space-y-2 md:hidden"
      >
        <motion.div
          initial={false}
          animate={
            isMobileNavClicked ? { rotate: 45, top: 2 } : { rotate: 0, top: 0 }
          }
          className={`w-full h-[2px] bg-black`}
        ></motion.div>
        <motion.div
          initial={false}
          animate={isMobileNavClicked ? { rotate: -45 } : { rotate: 0 }}
          className={`${
            isMobileNavClicked ? "w-full absolute top-[-8px]" : "w-1/2"
          } h-[2px] bg-black`}
        ></motion.div>
      </div>
      <div className="w-full flex justify-center items-center h-screen">
        <ul className="space-y-6 font-[800] flex flex-col">
          <motion.li
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 1.1 }}
            className={`cursor-pointer tracking-wider ${
              selectedNavbar === "Home"
                ? "bg-gradient-to-r from-[#a20707] to-[#f40e0e] text-white rounded-3xl"
                : ""
            } px-6 flex justify-center items-center py-2`}
          >
            Home
          </motion.li>
          <motion.li
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 1.1 }}
            className={`cursor-pointer tracking-wider ${
              selectedNavbar === "About Us"
                ? "bg-gradient-to-r from-[#a20707] to-[#f40e0e] text-white rounded-3xl"
                : ""
            } px-6 flex justify-center items-center  py-2`}
          >
            About Us
          </motion.li>
          <motion.li
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 1.1 }}
            className={`cursor-pointer tracking-wider ${
              selectedNavbar === "Sign Up"
                ? "bg-gradient-to-r from-[#a20707] to-[#f40e0e] text-white rounded-3xl"
                : ""
            } px-6  flex justify-center items-center py-2`}
          >
            Sign Up
          </motion.li>
        </ul>
      </div>
    </motion.div>
  );
};
