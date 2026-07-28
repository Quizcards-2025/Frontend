import React, {useEffect, useState} from 'react';
import {IoIosArrowBack} from "react-icons/io";
import {FaUser} from "react-icons/fa";
import BackgroundArea from "src/components/kn-arena/background/background-area.jsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useLobby} from "src/context/LobbyContext";
import NoAvatar from "../../../../public/images/no_avatar.png";
import api from "src/apis/api.js";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import {WS_Link} from "src/ws/WS.js";

export default function LobbyRoom() {
    const navigate = useNavigate();
    const [listPlayers, setListPlayers] = useState([]);
    const [isAuthor, setIsAuthor] = useState(false);
    const [stompClient, setStompClient] = useState(null);
    const {id} = useParams();
    const fetchPlayers = async (id) => {
        try {
            // const res = await api.get(`http://localhost:8080/api/v1/ka/room/players/${id}`);
            const res = await api.get(`/v1/ka/room/players/${id}`);
            setListPlayers(res.data);
        } catch (error) {
            console.error("Failed to fetch players:", error);
        }
    };
    useEffect(() => {
        const socket = new SockJS(WS_Link);
        const client = Stomp.over(socket);
        client.connect(
            {},
            () => {
                // client.subscribe(`/topic/players/${id}`, (message) => {
                //     const data = JSON.parse(message.body);
                //     setListPlayers(data);
                // });
                client.subscribe(`/topic/players/${id}`, (message) => {
                    const data = JSON.parse(message.body);
                    setListPlayers(data);
                });
                client.subscribe(`/topic/start-battle/${id}`, () => {
                    navigate(`/arena/room-game/${id}`);
                });
            },
            (error) => {
                console.error("WebSocket connection error:", error);
            }
        );
        setStompClient(client);
        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }, [id]);

    const fetchAuthor = async () => {
        try {
            // const res = await api.get(`http://localhost:8080/api/v1/ka/room/isAuthor/${id}`);
            const res = await api.get(`/v1/ka/room/isAuthor/${id}`);
            setIsAuthor(res.data);
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        fetchAuthor();
        fetchPlayers(id);
    }, [id]);
    const handleStartBattle = () => {
        if (stompClient) {
            stompClient.send(`/app/start-battle/${id}`, {}, JSON.stringify({ roomId: id }));
        }
    };
    // const handleStartBattle = () => {
    //     // const socket = new SockJS(WS_Link);
    //     // const stompClient = over(socket);
    //     stompClient.connect({}, () => {
    //         stompClient.send(`/app/room-game/${id}`, {},JSON.stringify(id));
    //     });
    //     navigate(`/arena/room-game/${id}`);
    // };
    // useEffect(() => {
    //     if (listPlayers.length > 0) {
    //         console.log("Updated listPlayers:", listPlayers);
    //     }
    // }, [listPlayers]);
    return (
        <>
            <BackgroundArea>
                <Link to="/user">
                    <div
                        className='text-white flex items-center gap-2 absolute left-8 top-8 border border-solid p-2.5 rounded-full blur-op'>
                        <IoIosArrowBack/> Leave the arena
                    </div>
                </Link>
                <div className="w-full flex justify-between mt-20">
                        <div className='flex flex-col items-center text-center w-1/3 pl-16'>
                            <strong className='bg-[#0e22e9] text-white p-2 text-2xl w-1/2 '>Arena code</strong>
                            <strong className='bg-[#0e22e9] text-white p-2 text-2xl w-2/3'>{id}</strong>
                            {
                                isAuthor &&
                                <button onClick={handleStartBattle}
                                    className="w-full cursor-pointer mt-auto border-none p-5 rounded-lg bg-[#0e22e9] text-white font-bold hover:bg-blue-700 transition-colors text-base">
                                    START BATTLE
                                </button>
                            }
                        </div>

                    <div className='flex'>
                        <div className='bg-[#1525c2] w-16 flex items-center flex-col gap-2 py-4'>
                            <FaUser color='white'/>
                            <b className='text-white'>{listPlayers?.length}</b>
                        </div>
                        <div className='bg-white max-h-80 overflow-y-auto p-2'>
                            {
                                listPlayers?.map((item) => (
                                    <div key={item.userId}
                                         className='flex items-center min-w-[32rem] gap-4 p-4 border border-solid border-[#0e22e9]'>
                                        <img src={item.avatar || NoAvatar} alt="" width={48} className="rounded-4"/>
                                        <strong>{item.userName}</strong>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </BackgroundArea>
        </>
    );
}
