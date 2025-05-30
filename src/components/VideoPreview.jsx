import React, {useEffect, useState} from "react";
import {Dialog, DialogContent} from "@mui/material";

export const VideoPreview = ({ videoPreview,
                                showVideoPreview = true,  // Default to true
                                setShowVideoPreview = () => {}, // Function to set the visibility
                                 id }) => {
    const [open, setOpen] = useState(showVideoPreview);

    const handleClose = () => {
        setOpen(false);
        setShowVideoPreview(false);
    };

    useEffect(() => {
        if (showVideoPreview) {
            setOpen(showVideoPreview);
        }
    }, [showVideoPreview]);

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={false}
                PaperProps={{
                    style: {
                        width: '500px',
                        height: '400px',
                        margin: 0
                    }
                }}
            >
                <DialogContent style={{ padding: 0, width: '100%', height: '100%' }}>
                    <video
                        width="100%"
                        height="100%"
                        controls
                        autoPlay
                        muted
                        src={videoPreview || ""}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};