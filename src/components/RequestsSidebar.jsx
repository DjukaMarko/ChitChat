import hamburger from "../../public/hamburger.png"
import emptyrequests from "../../public/emptyrequests.svg"
import acceptrequest from "../../public/acceptrequest.png"
import removerequest from "../../public/removerequest.png"

export const RequestsSidebar = ({ myUserData, acceptRequest, removeRequest}) => {

    const handleAccept = (display_name) => {
        acceptRequest(display_name);
    }

    const handleReject = (display_name) => {
        removeRequest(display_name);
    }
    return (
        <>
            <div className="flex flex-col space-y-8 p-5">
                <div className="w-full flex justify-between">
                    <p className="text-lg md:text-2xl font-[500]">Requests</p>
                    <div className="cursor-pointer bg-[#f7f7f7] lg:hidden block hover:bg-[#f0f0f0] rounded-full p-2"><img src={hamburger} className="w-[20px] h-[20px]" /></div>
                </div>
                {myUserData?.f_requests?.length == 0 ?
                
                    <div className="w-full h-full flex justify-center items-center">
                        <div className="flex flex-col space-y-4 items-center justify-center">
                            <img src={emptyrequests} className="w-[100px] h-[100px]" />
                            <p className="text-sm">You have no friend requests.</p>
                        </div>
                    </div>
                :
                <div className="w-full h-full flex flex-col space-y-4 min-h-screen overflow-y-auto">
                    {myUserData?.f_requests?.map(e => {
                        return (
                            <div key={e?.id} className="w-full flex items-center justify-between p-4 rounded-full border-[1px] shadow-sm">
                                <div className="flex space-x-4 items-center">
                                    <img src={e?.photoUrl} className="rounded-full w-[32px] h-[32px]" />
                                    <p>{e?.display_name}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <img onClick={() => handleAccept(e?.display_name)} src={acceptrequest} className="w-[32px] cursor-pointer h-[32px]" />
                                    <img onClick={() => handleReject(e?.display_name)} src={removerequest} className="w-[32px] cursor-pointer h-[32px]" />
                                </div>
                            </div>
                        )
                    })}
                </div>
                }
            </div>
        </>
    )
}