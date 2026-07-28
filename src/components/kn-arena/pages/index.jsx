import React, { useState } from 'react'
import { IoIosArrowBack } from "react-icons/io";
import BackgroundArea from '../components/background/background-area';


export default function Arena() {
  const [typeShow, setTypeShow] = useState(1);
  return (
    <>
      <BackgroundArea>
        <div className='text-white flex items-center gap-2 absolute left-8 top-8 border border-solid p-2.5 rounded-full blur-op'><IoIosArrowBack /> Back to Quizcards</div>
        {
          typeShow === 1 && (
            <div className="w-1/3 space-y-4 my-auto">
              <input
                type="text"
                placeholder="Enter 6-digit arena code"
                className="w-full px-4 border-none py-3 rounded-lg bg-white/90 backdrop-blur-sm text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
              />
              <button className="w-full border-none p-5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-base">
                Enter arena
              </button>
            </div>
          )
        }
        {
          typeShow === 2 && (
            <div className="w-1/3 space-y-4 my-auto">
              <div className='flex flex-col w-1/2 items-center mx-auto text-center'>
                <strong className='bg-[#0e22e9] text-white p-2 text-2xl w-11/12 '>Arena code</strong>
                <strong className='bg-[#0e22e9] text-white p-2 text-2xl w-full'>#061224</strong>
                <svg className='-mt-4 -mb-12' width="248" height="180" viewBox="0 0 328 197" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M164 197L0.321184 0.5L327.679 0.500028L164 197Z" fill="#2128CC" />
                </svg>

              </div>
              <button className="w-full cursor-pointer border-none p-5 rounded-lg bg-[#0e22e9] text-white font-bold hover:bg-blue-700 transition-colors text-base">
                Refresh code
              </button>
            </div>
          )
        }
        <div className='absolute right-8 top-8 flex items-center gap-8'>
          <span className='text-white'>N’kosazana</span>
          <img src="/Rectangle 1.png" alt="" width={60} />
        </div>
      </BackgroundArea>
    </>
  )
}
