import React, {useEffect, useState} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {Button} from "@mui/material";
import api from "src/apis/api.js";
import {IoIosArrowBack} from "react-icons/io";

export default function BackgroundArea({ children }) {
    const location = useLocation();
    const [userInfo, setUserInfo] = useState([]);
    const user = async () => {
        try {
            const response = await api.get("/v1/auth/user-info");
            setUserInfo(response.data);
        } catch(err) {
            console.log(err.message);
        }
    }
    useEffect(() => {
        user();
    }, []);
    return (
        <div className="bg-arena relative">

            <div className='absolute right-8 top-8 flex items-center gap-8'>
                <span className='text-white'>{userInfo?.username}</span>
                <img src={userInfo?.avatar} alt="" width={60}
                     className="object-cover border border-solid rounded-xl"/>
            </div>
            <div className="flex flex-col">
                {location.pathname === '/' && (
                    <img src="/images/kn-arena/logo-arena.png" alt="logo" width={188} className="mt-8"/>
                )}
                <img src="/images/kn-arena/text-logo.png" alt="logo" width={188} className="mt-8"/>
            </div>
            {children}
        </div>

    )
}
