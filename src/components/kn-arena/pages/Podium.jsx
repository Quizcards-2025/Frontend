import {IoIosArrowForward} from "react-icons/io";
import BackgroundBlue from "src/components/kn-arena/background/background-blue.jsx";
import {Link} from "react-router-dom";

export default function Podium({list}) {
    return (
        <BackgroundBlue>
            <Link to='/user'>
                <div
                    className='text-white flex items-center gap-2 absolute right-8 bottom-8 border border-solid p-2.5 rounded-full blur-op'>
                    Finish the battle <IoIosArrowForward/>
                </div>
            </Link>

            <div className="w-full flex justify-between mt-20 ">
                <div className=''>
                    <img src="/images/kn-arena/image%2020.png" alt="" className='w-3/5 block mx-auto'/>
                </div>
                <div className='flex max-h-[28rem] flex-grow'>
                    <div className='bg-[#1525c2] w-[5vw] flex items-center flex-col gap-2 py-4'>
                        <b className='text-white transform -rotate-90 my-auto text-xl'>LEADERBOARD</b>
                    </div>
                    <div className='bg-white bg-ranking-list overflow-y-auto flex-grow max-w-[50vw]'>
                        {
                            list.map((item, index) => (
                                <div key={index}
                                     className='flex items-center justify-content-between min-w-[32rem] gap-4 p-4 border border-solid border-[#0e22e9]'>
                        <span className="flex items-center justify-center gap-5">
                            <img src={item.avatar} alt="" width={48} className="object-fit-contain rounded-3"/>
                            <strong>{item.user_name}</strong>
                        </span>
                                    <span>
                            Top {item.total_ranking}
                        </span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </BackgroundBlue>
    )
}
