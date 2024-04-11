import { useContext } from "react";
import { ThemeProvider, theme } from "../misc/ThemeProvider";

export const Footer = () => {
    const { themeMode , handleChangeThemeMode } = useContext(ThemeProvider);
    return (
        <div className="w-full h-full flex p-8 justify-center items-center shadow-inner">
            <p className={`font-[500] font-poppins text-xs tracking-wider italic ${themeMode === "dark" && "text-white"}`}>Powered by <span className="font-[700]">DigitalNexus™</span></p>
        </div>
    )
}