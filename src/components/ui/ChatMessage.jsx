import { BeatLoader } from "react-spinners";

export const ChatMessage = ({ side, isDifference, isMessageLoading, text, m, index, compareTimestamps, returnTimestampFirstMessage ,isMessageSending, currentMembers }) => {
    let otherMember = currentMembers.find(member => member.userId === m.sentBy);


    const isValidUrl = urlString => {
        if (urlString === undefined) return;
        const urlRegex = /^(?:https?|ftp):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?|^((?!www\.)[\w-]+\.)+[a-z]{2,6}(:[0-9]{1,5})?([\w/?.#=%&~-]*)?$/i;
        return urlRegex.test(urlString);
    }

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

            {/* If the message is the first message in the chat, show the timestamp of the first message */}
            {text.length - 1 === index && !isMessageLoading && (
                <div className={`w-full flex justify-center`}>
                    <p className={`text-xs`}>{returnTimestampFirstMessage(m)}</p>
                </div>
            )}

            {/* Otherwise, show the time difference between the current message and the next message */}
            {isDifference(m, text[index === text.length - 1 ? index : index + 1], text.length, index) && (
                <div className={`w-full flex justify-center`}>
                    <p className={`text-xs`}>{compareTimestamps(m, text[index === text.length - 1 ? index : index + 1])}</p>
                </div>
            )}

            {side === 2 && (text[index + 1]?.sentBy !== otherMember?.userId && <img className="w-9 rounded-full mt-4 ml-2" src={otherMember?.photoUrl} />)}
            <div className={`${(side === 1 ? (isMessageSending && index === 0 ? "bg-red-400" : "bg-red-800 hover:bg-red-700") : "bg-black/10 hover:bg-black/20")} ${side === 1 ? "mx-6" : "mx-10"}  py-2 px-4 rounded-xl relative max-w-[70%] break-words cursor-pointer`}>
                {isValidUrl(m.message) ? (
                    <a href={m.message.startsWith("http") ? m.message : `https://${m.message}`} className={`${side === 1 ? "text-white" : "text-black"} underline text-xs md:text-sm`} target="_blank" rel="noopener noreferrer">
                        {m.message}
                    </a>
                ) : (
                    <p className={`${side === 1 ? "text-white" : "text-black"} text-sm`}>{m.message}</p>
                )}
                {isMessageSending && index === 0 &&
                    <div className={`absolute bottom-[-22px] right-0`}><BeatLoader size={8} color="#c91e1e" /></div>
                }
            </div>
        </div>
    )
}
