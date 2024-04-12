import { useContext } from "react";
import { ThemeProvider } from "../misc/ThemeProvider";

export const Footer = () => {
    const { themeMode } = useContext(ThemeProvider);
    return (
        <div className="w-full h-full flex p-8 justify-center items-center border-t-[1px] border-secondaryC">
            <p className={`font-[500] font-poppins text-xs tracking-wider italic ${themeMode === "dark" && "text-white"}`}>Powered by <span className="font-[700]">DigitalNexus™</span></p>
        </div>
    )
}