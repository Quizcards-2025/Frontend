import React, {useEffect, useState} from 'react'
import {IoIosArrowBack} from "react-icons/io";
import BackgroundArea from "src/components/kn-arena/background/background-area.jsx";
import {Link, useLocation, useNavigate} from "react-router-dom";
import api from "src/apis/api.js";
import SettingRoom from "src/pages/kn-arena/SettingRoom.jsx";
import {toast} from "react-toastify";
import {over} from 'stompjs';
import SockJS from 'sockjs-client';
import {WS_Link} from "src/ws/WS.js";

export default function RoomCode() {
    const [formData, setFormData] = useState('');
    const navigate = useNavigate();
    const [pinCode, setPinCode] = useState('');
    const [typeShow, setTypeShow] = useState(1);

    let location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const setID = queryParams.get('setId');
    console.log(setID);

    useEffect(() => {
        if (id === "1") {
            setTypeShow(1);
        } else if (id === "2") {
            setTypeShow(2);
        } else if (id === "3") {
            setTypeShow(3);
            const roomCode = queryParams.get('room-code');
            setPinCode(roomCode);
        } else {
            console.warn("Invalid id in query params");
        }
    }, [id]);
    const handleCopy = () => {
        navigator.clipboard.writeText(pinCode).then(() => {
            toast.success("Copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy to clipboard!");
        })
    }
    const handleRefreshCode = async () => {
        try {
            // const response = await api.post(`http://localhost:8080/api/v1/ka/room/refresh-code`, pinCode);
            const response = await api.post(`/v1/ka/room/refresh-code`, pinCode);
            console.log(response.data);
            if (response.status == 201) {
                setPinCode(response.data.data.pin_code);
                queryParams.set('room-code', response.data.data.pin_code);
                navigate(`?${queryParams.toString()}`, {replace: true});
            }
        } catch (err) {
            console.log(err.message);
        }
    }
    const handleInputChange = (e) => {
        setFormData(() => e.target.value);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // const response = await api.post(`http://localhost:8080/api/v1/ka/room/join-room/${formData}`);
            const response = await api.post(`/v1/ka/room/join-room/${formData}`);
            if(response.status == 201||response.status===200) {
                const socket = new SockJS(WS_Link);
                const stompClient = over(socket);
                stompClient.connect({}, () => {
                    stompClient.send(`/app/list-players/${formData}`, {},JSON.stringify(formData));
                });
                toast.success(response.data.message||response.data,{autoClose:200});
                navigate(`/arena/lobby-room/${formData}`);
            }
            console.log(response);
        } catch (err){
            toast.error(err.response.data.message);
        }
    }
    return (
        <>
            <BackgroundArea>
                <Link to="/arena">
                    <div
                        className='text-white flex items-center gap-2 absolute left-8 top-8 border border-solid p-2.5 rounded-full blur-op'>
                        <IoIosArrowBack/> Back to menu
                    </div>
                </Link>
                {
                    typeShow === 1 && (
                        <div className="w-1/3 space-y-4 my-auto">
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col items-center gap-2">
                                    <input
                                        onChange={handleInputChange}
                                        name='room-code'
                                        type="text"
                                        placeholder="Enter 6-digit arena code"
                                        className="w-full px-4 border-none py-3 rounded-lg bg-white/90 backdrop-blur-sm text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        maxLength={6}
                                    />
                                    <button type="submit"
                                            className="w-full border-none p-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-base">
                                        Enter arena
                                    </button>
                                </div>

                            </form>
                        </div>
                    )
                }
                {
                    typeShow === 2 && (
                        <SettingRoom/>
                    )
                }
                {
                    typeShow === 3 && (
                        <div className="w-1/3 space-y-4 my-auto">
                            <div className='flex flex-col w-1/2 items-center mx-auto text-center'>
                                <strong className='bg-[#0e22e9] text-white p-2 text-2xl w-11/12 '>Arena code</strong>
                                <strong
                                    className="bg-[#3facf2] text-white p-2 text-2xl w-full flex justify-around items-center cursor-pointer
          transition-transform transform hover:scale-105 hover:bg-[#359bd9] rounded-3"
                                    onClick={handleCopy}>
                                    {pinCode}
                                </strong>
                                <svg className='-mt-4 -mb-12' width="248" height="180" viewBox="0 0 328 197" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M164 197L0.321184 0.5L327.679 0.500028L164 197Z" fill="#2128CC"/>
                                </svg>

                            </div>
                            <button onClick={handleRefreshCode}
                                    className="w-full cursor-pointer border-none p-3 rounded-lg bg-[#0e22e9] text-white font-bold hover:bg-blue-700 transition-colors text-base">
                                Refresh code
                            </button>
                        </div>
                    )
                }

            </BackgroundArea>
        </>
    )
}
