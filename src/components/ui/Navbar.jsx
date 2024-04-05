import {motion} from "framer-motion";
import { useEffect, useState } from "react";

export const Navbar = ({ setMobileNavClicked }) => {

    const [scrollLevel, setScrollLevel] = useState(0);

    useEffect(() => {
        window.addEventListener("scroll", () => setScrollLevel(window.scrollY));
        return () => window.removeEventListener("scroll", () => setScrollLevel(window.scrollY));
    });

    const handleMobileClick = () => {
        setMobileNavClicked(prevClick => !prevClick);
    }
    return (
        <motion.div
                    initial={{padding: '10px'}}
                    animate={{paddingTop: scrollLevel > 0 ? '20px': '25px', backgroundColor: scrollLevel > 0 ? "white" : "transparent" , paddingBottom: scrollLevel > 0 ? '20px': '25px', paddingLeft: "50px", paddingRight: "50px"}}
                    transition={{duration: 0.5}}
                    className="w-full shadow-sm max-w-[2500px] z-[1] fixed flex justify-between items-center">
                    <p className="font-[900] text-[20px] sm:text-[24px] md:text-[28px] lg:text-[36px] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#a20707] to-[#f40e0e]">Chitchat</p>
                    <ul className="space-x-6 font-[800] hidden md:flex">
                        <motion.li whileHover={{ scale: 1.05 }} className={`cursor-pointer tracking-wider bg-gradient-to-r from-[#a20707] to-[#f40e0e] text-white rounded-3xl px-6 py-2`}>Home</motion.li>
                        <motion.li whileHover={{ scale: 1.05 }} className={`cursor-pointer tracking-wider px-6 py-2`}>About Us</motion.li>
                        <motion.li whileHover={{ scale: 1.05 }} className={`cursor-pointer tracking-wider px-6 py-2`}>Sign Up</motion.li>
                    </ul>
                    <div onClick={handleMobileClick} className="w-[35px] cursor-pointer flex relative flex-col space-y-2 md:hidden">
                        <div className={`w-full h-[2px] bg-black`}></div>
                        <div className={`w-full h-[2px] bg-black`}></div>
                    </div>
                </motion.div>
    )
}