import {createContext, useContext, useState} from "react";
import {VideoPreview} from "@/components/VideoPreview.jsx";

const VideoDisplayContext = createContext(null);

export const VideoDisplayProvider = ({children}) => {
    const [videoSrc, setVideoSrc] = useState('');
    const [open, setOpen] = useState(false);

    const showVideo = (src) => {
        setVideoSrc(src);
        setOpen(true);
    };

    const hideVideo = () => {
        setOpen(false);
        // setVideoSrc('');
    };

    return (
        <VideoDisplayContext.Provider value={{
            videoSrc,
            open,
            showVideo,
            hideVideo
        }}>
            {children}
            <VideoPreview
                videoPreview={videoSrc}
                showVideoPreview={open}
                setShowVideoPreview={hideVideo}
            />
        </VideoDisplayContext.Provider>
    );
}

export const useVideoDisplay = () => {
    const context = useContext(VideoDisplayContext);
    if (!context) {
        throw new Error('useVideoDisplay must be used within a VideoDisplayProvider');
    }
    return context;
};