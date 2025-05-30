
import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import {Link, useNavigate} from 'react-router-dom';
import BackgroundArea from "src/components/kn-arena/background/background-area.jsx";
import Frame_27 from "/images/kn-arena/Frame_27.png";
import Frame_29 from "/images/kn-arena/Frame_29.png";
import Frame_30 from "/images/kn-arena/Frame_30.png";
import Frame_28 from "/images/kn-arena/Frame_28.png";

export default function CountDown({ onStepComplete }) {
    const [timeLeft, setTimeLeft] = useState(3);
    const navigate = useNavigate();

    const getImageSrc = (timeLeft) => {
        if (timeLeft === 3) return Frame_27;
        if (timeLeft === 2) return Frame_29;
        if (timeLeft === 1) return Frame_30;
        return Frame_28;
    };

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else {
           onStepComplete(2);
        }
    }, [timeLeft, navigate]);

    return (
        <BackgroundArea>
            <Link to="/user">
                <div
                    className='text-white flex items-center gap-2 absolute left-8 top-8 border border-solid p-2.5 rounded-full blur-op'>
                    <IoIosArrowBack/> Leave the arena
                </div>
            </Link>
            <div className='w-full my-auto h-[54svh] relative flex flex-col'>
                <img src={getImageSrc(timeLeft)} className='h-full' alt="Countdown Frame" style={{ filter: `grayscale(${timeLeft === 3 ? 0 : 1})` }} />
                <b className="absolute text-8xl text-white top-1/2 left-1/2" style={{ transform: "translate(-50%, -50%)" }}>
                    {timeLeft || "START"}
                </b>
            </div>
        </BackgroundArea>
    );
}
