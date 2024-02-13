import { BeatLoader } from "react-spinners";

export const ChatMessage = ({ side, isDifference, text, m, index, compareTimestamps, isMessageSending, currentMembers }) => {
    let otherMember = currentMembers.find(member => member.userId === m.sentBy);


    const isValidUrl = urlString => {
        if (urlString === undefined) return;
        const urlRegex = /^(?:https?|ftp):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?|^((?!www\.)[\w-]+\.)+[a-z]{2,6}(:[0-9]{1,5})?([\w/?.#=%&~-]*)?$/i;
        return urlRegex.test(urlString);
    }


    return (
        <div className={`flex flex-col ${side === 1 ? "items-end" : "items-start"} mt-1`}>
            {isDifference(m, text[index === text.length - 1 ? index : index + 1], text.length, index) && (
                <div className={`w-full flex justify-center my-3 `}>
                    <p className={`text-xs ${side === 1 ? "mt-2" : "mt-0"} `}>{compareTimestamps(m, text[index === text.length - 1 ? index : index + 1])}</p>
                </div>
            )}
            {side === 2 && (text[index + 1]?.sentBy !== otherMember?.userId && <img className="w-9 rounded-full mt-4 ml-2" src={otherMember?.photoUrl} />)}
            <div className={`${(side === 1 ? (isMessageSending && index === 0 ? "bg-red-200" : "bg-red-500") : "bg-[#f0f0f0]")} ${side === 1 ? "mx-6" : "mx-10"}  py-2 px-4 rounded-xl relative max-w-[70%] break-words`}>
                {isValidUrl(m.message) ? (
                    <a href={m.message.startsWith("http") ? m.message : `https://${m.message}`} className={`${side === 1 ? "text-white" : "text-black"} underline text-xs md:text-sm`} target="_blank" rel="noopener noreferrer">
                        {m.message}
                    </a>
                ) : (
                    <p className={`${side === 1 ? "text-white" : "text-black"} text-xs md:text-sm`}>{m.message}</p>
                )}
                {isMessageSending && index === 0 &&
                    <div className={`absolute bottom-[-22px] ${side === 1 ? "left-[-16px]" : "right-[-16px]"}`}><BeatLoader size={8} color="#c91e1e" /></div>
                }
            </div>
        </div>
    )
}
