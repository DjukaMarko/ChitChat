import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { Switch } from "./switch";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { ThemeProvider, theme } from "../misc/ThemeProvider";
import { Menu } from "lucide-react";

export const Navbar = ({ setMobileNavClicked }) => {

    const [scrollLevel, setScrollLevel] = useState(0);
    const { themeMode, handleChangeThemeMode } = useContext(ThemeProvider);

    useEffect(() => {
        window.addEventListener("scroll", () => setScrollLevel(window.scrollY));
        return () => window.removeEventListener("scroll", () => setScrollLevel(window.scrollY));
    });

    const handleMobileClick = () => {
        setMobileNavClicked(prevClick => !prevClick);
    }
    return (
        <motion.div
            initial={{ padding: '10px' }}
            animate={{ paddingTop: scrollLevel > 0 ? '20px' : '25px', paddingBottom: scrollLevel > 0 ? '20px' : '25px', paddingLeft: "50px", paddingRight: "50px" }}
            transition={{ duration: 0.2 }}
            className="w-full bg-backgroundTheme max-w-[2500px] z-[1] fixed flex justify-between items-center text-textColor border-b-[1px] border-secondaryC shadow-sm">
            <p className="font-[900] text-[20px] sm:text-[24px] md:text-[28px] lg:text-[36px] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#991b1b] to-[#b91c1c]">Chitchat</p>
            <ul className={`space-x-6 font-[800] hidden md:flex md:items-center`}>
                <motion.li whileHover={{ scale: 1.05 }} className={`cursor-pointer tracking-wider bg-gradient-to-r from-[#991b1b] to-[#b91c1c] text-white rounded-3xl px-6 py-2`}>Home</motion.li>
                <motion.li whileHover={{ scale: 1.05 }} className={`cursor-pointer tracking-wider px-6 py-2`}>About Us</motion.li>
                <motion.li whileHover={{ scale: 1.05 }} className={`cursor-pointer tracking-wider px-6 py-2`}>Sign Up</motion.li>
                <motion.li>
                    <div className="flex items-center space-x-3">
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
                </motion.li>
            </ul>
            <Menu className="md:hidden cursor-pointer" color={themeMode === "dark" ? "#fff" : "#000"} onClick={handleMobileClick} />
        </motion.div>
    )
}