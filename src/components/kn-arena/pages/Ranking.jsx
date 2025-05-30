import React, { useState } from 'react'
import { IoIosArrowBack } from 'react-icons/io'
import BackgroundBlue from "src/components/kn-arena/background/background-blue.jsx";

export default function Ranking() {
    const [typeShow, setTypeShow] = useState(1)
    return (
        <BackgroundBlue>
            <div className='absolute left-8 top-8 flex justify-center items-center gap-4'>
                <button className='border-none rounded-full size-12 flex justify-center items-center blur-op text-white'><IoIosArrowBack size={24} /></button>
            </div>
            <div className='absolute right-8 top-8 flex justify-center items-center gap-4'>
                <strong className='text-white font-bold text-2xl' >5</strong>
                <p className='text-white m-0' >answer</p>
            </div>
            {
                typeShow === 1 && (
                    <div className='w-full flex flex-col gap-12 mt-20'>
                        <strong className='text-white block text-center text-2xl'>You are on the podium!</strong>
                        <div className='bg-gradient-ranking w-full p-8 flex items-center gap-8'>
                            <img src="/images/kn-arena/Rectangle_1.png" alt="" width={144} height={144} />
                            <b>Black Rose</b>
                            <b className='ml-auto'>1000pts</b>
                        </div>
                    </div>
                )
            }
            {
                typeShow === 2 && (
                    <div className="w-full flex justify-between mt-20">
                        <div className=''>
                            <img src="/images/kn-arena/image%2020.png" alt="" className='w-2/5 block mx-auto' />
                        </div>
                        <div className='flex max-h-[28rem]'>
                            <div className='bg-[#1525c2] w-16 flex items-center flex-col gap-2 py-4'>
                                <b className='text-white transform -rotate-90 my-auto text-xl'>LEADERBOARD</b>
                            </div>
                            <div className='bg-white bg-ranking-list overflow-y-auto'>
                                <div className='flex items-center min-w-[32rem]  gap-4 p-4 border border-solid border-[#0e22e9]'>
                                    <img src="/images/kn-arena/Rectangle_1.png" alt="" width={48} />
                                    <strong>Dianne Russell</strong>
                                </div>
                                <div className='flex items-center min-w-[32rem]  gap-4 p-4 border border-solid border-[#0e22e9]'>
                                    <img src="/images/kn-arena/Rectangle_1.png" alt="" width={48} />
                                    <strong>Dianne Russell</strong>
                                </div>
                                <div className='flex items-center min-w-[32rem]  gap-4 p-4 border border-solid border-[#0e22e9]'>
                                    <img src="/images/kn-arena/Rectangle_1.png" alt="" width={48} />
                                    <strong>Dianne Russell</strong>
                                </div>
                                <div className='flex items-center min-w-[32rem]  gap-4 p-4 border border-solid border-[#0e22e9]'>
                                    <img src="/images/kn-arena/Rectangle_1.png" alt="" width={48} />
                                    <strong>Dianne Russell</strong>
                                </div>
                                <div className='flex items-center min-w-[32rem]  gap-4 p-4 border border-solid border-[#0e22e9]'>
                                    <img src="/images/kn-arena/Rectangle_1.png" alt="" width={48} />
                                    <strong>Dianne Russell</strong>
                                </div>
                                <div className='flex items-center min-w-[32rem]  gap-4 p-4 border border-solid border-[#0e22e9]'>
                                    <img src="/images/kn-arena/Rectangle_1.png" alt="" width={48} />
                                    <strong>Dianne Russell</strong>
                                </div>
                                <div className='flex items-center min-w-[32rem]  gap-4 p-4 border border-solid border-[#0e22e9]'>
                                    <img src="/images/kn-arena/Rectangle_1.png" alt="" width={48} />
                                    <strong>Dianne Russell</strong>
                                </div>
                                <div className='flex items-center min-w-[32rem]  gap-4 p-4 border border-solid border-[#0e22e9]'>
                                    <img src="/images/kn-arena/Rectangle_1.png" alt="" width={48} />
                                    <strong>Dianne Russell</strong>
                                </div>
                                <div className='flex items-center min-w-[32rem]  gap-4 p-4 border border-solid border-[#0e22e9]'>
                                    <img src="/images/kn-arena/Rectangle_1.png" alt="" width={48} />
                                    <strong>Dianne Russell</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </BackgroundBlue>
    )
}
