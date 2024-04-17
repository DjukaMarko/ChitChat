import { BeatLoader } from "react-spinners";
import { compareTimestamps, isDifference, isValidUrl } from "@/lib/utils";

export const ChatMessage = ({ side, text, m, index, isMessageSending, currentMembers }) => {
    let otherMember = currentMembers.find(member => member.userId === m.sentBy);

    /*
        side == 1 => Sent by me
        side == 2 => Sent by other person
        
        The text state is reversed, that's why i'm comparing the index with the text.length - 1
        i'm checking every message if it's the first message (last in text state because of the reversal). If it is, then
        i'm showing the timestamp of the first message and if it is not the first message, 
        i'm comparing the current message with the next message and showing the time difference between them.
    */

    return (
        <div className={`flex flex-col ${side === 1 ? "items-end" : "items-start"} mt-1`}>
            {/* show the time difference between the current message and the next message */}
            {isDifference(m, text[index === text.length - 1 ? index : index + 1], text.length, index) && (
                <div className={`w-full flex justify-center my-3`}>
                    <p className={`text-xs text-textColor`}>{compareTimestamps(m, text[index === text.length - 1 ? index : index + 1]) || ""}</p>
                </div>
            )}
            <div className={` ${side === 1 ? "mr-4" : "ml-4 flex items-center space-x-3"} max-w-[80%]`}>
                {side === 2 && (text[index + 1]?.sentBy !== otherMember?.userId && <img className="w-9 rounded-full" src={otherMember?.photoUrl} />)}
                <div className={`${(side === 1 ? (isMessageSending && index === 0 ? "bg-red-400" : "bg-red-800 hover:bg-red-700") : "bg-secondaryC hover:bg-secondaryCHover")} ml-[3rem] py-[8px] px-3 rounded-xl break-words cursor-pointer relative`}>
                    {isValidUrl(m.message) ? (
                        <a href={m.message.startsWith("http") ? m.message : `https://${m.message}`} className={`${side === 1 ? "text-white" : "text-black"} underline text-xs md:text-sm`} target="_blank" rel="noopener noreferrer">
                            {m.message}
                        </a>
                    ) : (
                        <p className={`${side === 1 ? "text-white" : "text-textColor"} text-sm`}>{m.message}</p>
                    )}
                    {isMessageSending && index === 0 &&
                        <div className={`absolute -bottom-6 right-0`}><BeatLoader size={8} color="#c91e1e" /></div>
                    }
                </div>
            </div>
        </div>
    )
}
