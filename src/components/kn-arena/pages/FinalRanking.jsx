import React from 'react'
import { IoIosArrowForward } from "react-icons/io";
import BackgroundBlue from "src/components/kn-arena/background/background-blue.jsx";


export default function FinalRanking() {
    return (
        <BackgroundBlue>
            <div className='absolute right-8 top-8 flex justify-center items-center gap-4'>
                <button className='border-none rounded-full p-4 font-bold gap-2 flex justify-center items-center blur-op text-white'><span>Finish the battle</span><IoIosArrowForward /></button>
            </div>
            <div className='w-full flex flex-col gap-12 mt-20'>
                <strong className='text-white block text-center text-2xl'>Congratulations!</strong>
                <img src="/images/kn-arena/Rectangle_1.png" alt="" width={144} height={144} className='block mx-auto' />
                <strong className='text-white block text-center text-2xl'>You are ranked 1st</strong>
            </div>
        </BackgroundBlue>
    )
}
