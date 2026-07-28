import {Button} from "@mui/material";
import BackgroundArea from "src/components/kn-arena/background/background-area.jsx";
import {Link, useNavigate} from "react-router-dom";
import React from "react";
import {IoIosArrowBack} from "react-icons/io";

function KickOff() {
    const navigate = useNavigate();
    const handleRedirectHomepage = (e) => {
        e.stopPropagation();
        navigate('/user');
    }
    return (
        <BackgroundArea className="relative h-screen w-full bg-cover bg-center">
            <div className="absolute inset-0 flex justify-center items-center">
                <div onClick={(e)=>handleRedirectHomepage(e)}
                     className='text-white flex items-center gap-2 absolute left-8 top-8 border border-solid p-2.5 rounded-full blur-op cursor-pointer'>
                    <IoIosArrowBack/> Back to Quizcards
                </div>
                <div className="flex flex-col items-center gap-4 bg-white bg-opacity-50 p-6 rounded-lg shadow-lg">
                    <h1 className="text-xl font-bold text-gray-800">WELCOME TO THE KNOWLEDGE ARENA</h1>
                    <Link to="/arena/room-code?id=1">
                        <Button variant="contained" color="primary">Join room with code</Button>
                    </Link>
                    {/*<Link to="/arena/room-code?id=2">*/}
                    {/*    <Button variant="contained" color="secondary">Create room arena</Button>*/}
                    {/*</Link>*/}
                </div>
            </div>
        </BackgroundArea>
    );
}

export default KickOff;
