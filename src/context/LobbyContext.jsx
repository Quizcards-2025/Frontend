// context/LobbyContext.js
import React, {createContext, useState, useContext, useEffect} from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import api from "src/apis/api.js";
import {WS_Link} from "src/ws/WS.js";

const LobbyContext = createContext();

export const useLobby = () => useContext(LobbyContext);

export const LobbyProvider = ({children}) => {

    const connectSocket = (id, path, onMessageReceived) => {
        const socket = new SockJS(WS_Link);
        const client = Stomp.over(socket);

        client.connect(
            {},
            () => {
                // Subscribe to the given path
                client.subscribe(path.replace(":id", id), (message) => {
                    const data = JSON.parse(message.body);
                    console.log("Received data:", data); // Log dữ liệu nhận được
                    if (onMessageReceived) {
                        onMessageReceived(data);
                    }
                });
            },
            (error) => {
                console.error("WebSocket connection error:", error);
            }
        );
        return client;
    };
    return (
        <LobbyContext.Provider value={{connectSocket}}>
            {children}
        </LobbyContext.Provider>
    );
};
