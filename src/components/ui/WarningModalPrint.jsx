import { BeatLoader } from "react-spinners";
import { Button } from "./button";

export default function WarningModalPrint({ image="", text = "", executedFunc, isShown, setShown, isLoading = false, confirmText="Yes", cancelText="No" }) {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center space-y-8 px-2 py-8">
            {image !== "" && <img className="w-32" src={image} />}
            <div className="flex flex-col justify-center items-center space-y-4">
                <p className="text-sm text-center sm:text-base">{text}</p>
                <div className="w-full flex flex-col space-y-1 sm:space-y-0 sm:space-x-2 sm:flex-row ">
                    <Button onClick={executedFunc} className="bg-red-800 text-white grow text-xs sm:text-sm">{isLoading ? <BeatLoader size={8} color="#fff" /> : confirmText}</Button>
                    <Button className="grow text-xs sm:text-sm" variant="secondary" onClick={() => setShown(false)}>{cancelText}</Button>
                </div>
            </div>
        </div>
    )
}