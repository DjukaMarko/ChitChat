import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import "react-loading-skeleton/dist/skeleton.css";

export const SkeletonLoader = () => {
    return (
        <SkeletonTheme color="#ededed" highlightColor="#d6d6d6">
              <section className='p-6 w-full h-[calc(100dvh)] overflow-hidden'>

                <div className="flex justify-between">
                  <Skeleton className="hover:border-[2px] border-[#bababa]" circle={true} height={30} width={30} />
                  <Skeleton className="hover:border-[2px] border-[#bababa]" circle={true} height={30} width={30} />
                </div>

                <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={15} height={40} />

                <div className="flex items-center flex space-x-4 mt-4 overflow-hidden">
                  <div className="flex flex-col items-center">
                    <Skeleton className="hover:border-[2px] border-[#bababa]" circle={true} height={70} width={70} />
                    <Skeleton className="hover:border-[2px] border-[#bababa]" width={50} />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton className="hover:border-[2px] border-[#bababa]" circle={true} height={70} width={70} />
                    <Skeleton className="hover:border-[2px] border-[#bababa]" width={50} />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton className="hover:border-[2px] border-[#bababa]" circle={true} height={70} width={70} />
                    <Skeleton className="hover:border-[2px] border-[#bababa]" width={50} />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton className="hover:border-[2px] border-[#bababa]" circle={true} height={70} width={70} />
                    <Skeleton className="hover:border-[2px] border-[#bababa]" width={50} />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton className="hover:border-[2px] border-[#bababa]" circle={true} height={70} width={70} />
                    <Skeleton className="hover:border-[2px] border-[#bababa]" width={50} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b-[1px] pb-6">
                  <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={10} height={40} />
                  <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={10} height={40} />
                </div>

                <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={15} height={60} />
                <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={15} height={60} />
                <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={15} height={60} />
                <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={15} height={60} />
                <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={15} height={60} />
                <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={15} height={60} />
                <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={15} height={60} />
                <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={15} height={60} />
                <Skeleton className="hover:border-[2px] border-[#bababa] mt-4" borderRadius={15} height={60} />
              </section>
            </SkeletonTheme>
    )
}