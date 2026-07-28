import {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {useTabId} from "src/context/TabIdContext.jsx";
import api from "src/apis/api.js";
import {toast} from "react-toastify";

const SpeakTextContext = createContext();

export const SpeakTextProvider = ({children}) => {
    const {tabId} = useTabId();

    const stopSpeakingChannel = 'STOP_SPEAKING_CHANNEL';

    const audioRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === stopSpeakingChannel && e.newValue) {
                try {
                    const { from } = JSON.parse(e.newValue);
                    if (from !== tabId) {
                        audioRef.current?.pause();
                        audioRef.current = null;
                    }
                } catch (_) {
                    // Nothing to do
                }
            }
        };
        window.addEventListener('storage', handler);
        return () => {
            window.removeEventListener('storage', handler);
        };
    }, [tabId]);

    const onPlaySound = useCallback(async (text) => {
        try {
            // const res = await api.get(
            //     "/v2/speech/synthesize-stream?" +
            //     new URLSearchParams({
            //         text,
            //     }),
            //     {
            //         responseType: "blob",
            //     }
            // );
            //
            // const audioUrl = URL.createObjectURL(res.data);
            //
            // audioRef.current?.pause();
            // audioRef.current.src = audioUrl;
            //
            // // // Thêm event listener để reload source
            // audioRef.current.load();
            //
            // const msg = JSON.stringify({from: tabId});
            // localStorage.setItem(stopSpeakingChannel, msg);
            // localStorage.removeItem(stopSpeakingChannel);
            //
            // audioRef.current
            //     .play()
            //     .then((r) => {
            //     })
            //     .catch((err) => {
            //         console.error("Play error:", err.message);
            //         toast.info("Error when playing sound");
            //     });

            const params = new URLSearchParams({ text });
            const url = `${api.defaults.baseURL}/v2/speech/synthesize-stream-chunk?${params}`;

            // dừng audio cũ
            audioRef.current?.pause();
            audioRef.current.src = url;
            audioRef.current.load();

            // thông báo cho các tab khác
            const msg = JSON.stringify({ from: tabId });
            localStorage.setItem(stopSpeakingChannel, msg);
            localStorage.removeItem(stopSpeakingChannel);

            // play
            audioRef.current
                .play()
                .catch((err) => {
                    console.error("Play error:", err.message);
                    toast.info("Error when playing sound");
                });
        } catch (err) {
            console.error("Data setup error: ", err);
            toast.info("Error when playing sound");
        }
    }, [tabId]);

    return (
        <SpeakTextContext.Provider value={{
            audioRef,
            onPlaySound,
        }}>
            {children}
        </SpeakTextContext.Provider>
    )
};

export const useSpeakText = () => useContext(SpeakTextContext);