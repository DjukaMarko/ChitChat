import { CirclePlus } from "lucide-react";
import { Skeleton } from "./skeleton";

export default function SearchFriends({ handleSendRequest, possibleRequests, isLoading }) {
    return (
        <div className="w-[50%] md:w-[70%] h-full rounded-br-lg flex flex-col space-y-1 p-1 overflow-y-scroll scrollbar-hide text-textColor text-sm">
            {isLoading ? <SkeletonLoader /> :
                possibleRequests.length === 0 ? <p className="text-center text-xs mt-4">No users found</p> :
                possibleRequests?.map((r) => (
                    <div key={r.userId} className="w-full min-h-[48px] cursor-pointer bg-secondaryC hover:bg-secondaryCHover p-2 rounded-lg flex justify-center sm:justify-between items-center">
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center">
                            <img src={r.photoUrl} className="w-8 sm:w-12 rounded-lg" />
                            <p className="text-xs sm:text-sm text-textColor">{r.display_name}</p>
                        </div>
                        <button onClick={(event) => {
                            handleSendRequest(r.display_name)
                            event.currentTarget.disabled = true;
                        }} className="hidden sm:block disabled:cursor-not-allowed disabled:opacity-50"><CirclePlus size={22} /></button>
                    </div>
                ))
            }
        </div>
    )
}


const SkeletonLoader = () => {
    return (
        <>
            <div className="w-full min-h-[48px] bg-secondaryCHover rounded-lg">
                <Skeleton className="bg-skeletonColor w-full h-full" />
            </div>
            <div className="w-full min-h-[48px] bg-secondaryCHover rounded-lg">
                <Skeleton className="bg-skeletonColor w-full h-full" />
            </div>
            <div className="w-full min-h-[48px] bg-secondaryCHover rounded-lg">
                <Skeleton className="bg-skeletonColor w-full h-full" />
            </div>
            <div className="w-full min-h-[48px] bg-secondaryCHover rounded-lg">
                <Skeleton className="bg-skeletonColor w-full h-full" />
            </div>
            <div className="w-full min-h-[48px] bg-secondaryCHover rounded-lg">
                <Skeleton className="bg-skeletonColor w-full h-full" />
            </div>
            <div className="w-full min-h-[48px] bg-secondaryCHover rounded-lg">
                <Skeleton className="bg-skeletonColor w-full h-full" />
            </div>
            <div className="w-full min-h-[48px] bg-secondaryCHover rounded-lg">
                <Skeleton className="bg-skeletonColor w-full h-full" />
            </div>
            <div className="w-full min-h-[48px] bg-secondaryCHover rounded-lg">
                <Skeleton className="bg-skeletonColor w-full h-full" />
            </div>
        </>
    )
}