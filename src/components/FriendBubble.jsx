

export const FriendBubble = ({ r, handleClick }) => {

    return (
        <div key={r?.username} onClick={handleClick} className="flex min-w-[5rem] cursor-pointer flex-col justify-center items-center space-y-1">
            <div className="flex flex-col items-end relative">
                <img src={r?.photoUrl} className="w-[4rem] h-[4rem] rounded-full" />
                {r?.activityStatus === "online" && <div className="absolute bottom-0 w-[1.2rem] h-[1.2rem] border-[3px] border-white rounded-full bg-red-600"></div>}
            </div>
            <p className="text-[13px]">{r?.display_name}</p>
        </div>
    )
}