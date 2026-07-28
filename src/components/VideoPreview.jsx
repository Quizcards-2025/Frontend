import React, {useEffect, useState} from "react";
import {Dialog, DialogContent} from "@mui/material";
import {toast} from "react-toastify";

export const VideoPreview = ({ videoPreview,
                                showVideoPreview = true,  // Default to true
                                setShowVideoPreview = b => {}, // Function to set the visibility
                                 id }) => {
    const [open, setOpen] = useState(showVideoPreview);
    const [hasError, setHasError] = useState(false);

    const handleClose = () => {
        setOpen(false);
        setShowVideoPreview(false);
        setHasError(false);
    };

    useEffect(() => {
        if (showVideoPreview) {
            setOpen(showVideoPreview);
            setHasError(false);
        }
    }, [showVideoPreview]);

    const handleError = () => {
        toast.error('Video not available');
        setHasError(true);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={false}
                PaperProps={{
                    style: {
                        width: '850px',
                        height: '700px',
                        margin: 0
                    }
                }}
            >
                {/*<DialogContent style={{ padding: 0, width: '100%', height: '100%' }}>*/}
                {/*    <video*/}
                {/*        width="100%"*/}
                {/*        height="100%"*/}
                {/*        controls*/}
                {/*        preload={"auto"}*/}
                {/*        playsInline*/}
                {/*        src={videoPreview || ""}*/}
                {/*    />*/}
                {/*</DialogContent>*/}
                <DialogContent className="p-0 w-full h-full flex items-center justify-center">
                    {!hasError ? (
                        <video
                            src={videoPreview || ''}
                            controls
                            preload="auto"
                            playsInline
                            onError={handleError}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-center text-gray-500">
                            <p>Video not available</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};