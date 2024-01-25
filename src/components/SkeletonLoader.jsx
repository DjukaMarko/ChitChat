import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import "react-loading-skeleton/dist/skeleton.css";

export const SkeletonLoader = () => {
    return (
        <SkeletonTheme color="#ededed" highlightColor="#d6d6d6">
              <section className='p-6'>

                <div className="flex justify-between">
                  <Skeleton circle={true} height={30} width={30} />
                  <Skeleton circle={true} height={30} width={30} />
                </div>

                <Skeleton borderRadius={15} height={40} className="mt-4" />

                <div className="flex items-center flex space-x-4 mt-4">
                  <div className="flex flex-col items-center">
                    <Skeleton circle={true} height={70} width={70} />
                    <Skeleton width={50} />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton circle={true} height={70} width={70} />
                    <Skeleton width={50} />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton circle={true} height={70} width={70} />
                    <Skeleton width={50} />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton circle={true} height={70} width={70} />
                    <Skeleton width={50} />
                  </div>
                  <div className="flex flex-col items-center">
                    <Skeleton circle={true} height={70} width={70} />
                    <Skeleton width={50} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b-[1px] pb-6">
                  <Skeleton borderRadius={10} height={40} className="mt-4" />
                  <Skeleton borderRadius={10} height={40} className="mt-4" />
                </div>

                <Skeleton borderRadius={15} height={60} className="mt-4" />
                <Skeleton borderRadius={15} height={60} className="mt-4" />
                <Skeleton borderRadius={15} height={60} className="mt-4" />
                <Skeleton borderRadius={15} height={60} className="mt-4" />
                <Skeleton borderRadius={15} height={60} className="mt-4" />
                <Skeleton borderRadius={15} height={60} className="mt-4" />
                <Skeleton borderRadius={15} height={60} className="mt-4" />
                <Skeleton borderRadius={15} height={60} className="mt-4" />
                <Skeleton borderRadius={15} height={60} className="mt-4" />
              </section>
            </SkeletonTheme>
    )
}