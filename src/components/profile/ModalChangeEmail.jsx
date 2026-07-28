import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import {toast} from "react-toastify";

const ModalChangeEmail = ({
                              isOpening = false,
                              setIsOpening = () => {
                              },
                              showModalWaiting = false,
                              setShowModalWaiting = () => {
                              },
                              onModalClose = () => {
                              },
                              onModalOpen = () => {
                              },
                              onUserCancel = () => {
                              },
                              sendChangeEmail = () => {
                              },
                              resendAgainSeconds = 0,
                              setResendAgainSeconds = () => {
                              },
                              retryAfterHours = null,
                              emailRetry = null,
                          }) => {
    const [email, setEmail] = useState("");

    const [lastEndTime, setLastEndTime] = useState(null);

    const [resendAgainAfterSecs, setResendAgainAfterSeconds] = useState(0);

    const timerIntervalRef = useRef(null);

    useEffect(() => {
        if (isOpening) {
            onModalOpen();
            if (lastEndTime != null && Date.now() < lastEndTime) {
                setResendAgainSeconds(Math.max(0, Math.round((lastEndTime - Date.now()) / 1000)));
            }
        }
    }, [isOpening]);

    useEffect(() => {
        if (resendAgainAfterSecs <= 0 && timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            setResendAgainSeconds(0);
        }
    }, [resendAgainAfterSecs]);

    useEffect(() => {
        clearInterval(timerIntervalRef.current);
        if (resendAgainSeconds !== undefined && resendAgainSeconds !== null && 0 < resendAgainSeconds) {
            const endTime = Date.now() + resendAgainSeconds * 1000;
            setLastEndTime(endTime);
            setResendAgainAfterSeconds(Math.max(0, Math.round((endTime - Date.now()) / 1000)));
            timerIntervalRef.current = setInterval(() => {
                setResendAgainAfterSeconds(Math.max(0, Math.round((endTime - Date.now()) / 1000)));
            }, 1000);
        }
    }, [resendAgainSeconds]);

    const handleCloseChangeEmail = () => {
        setIsOpening(false);
        setShowModalWaiting(false);
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        onModalClose();
    };

    const handleUserCancel = () => {
        onUserCancel();
        handleCloseChangeEmail();
    };

    const handleUserSendEmail = () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        sendChangeEmail(email, (r) => {
            setShowModalWaiting(true);
            setIsOpening(false);
        }, (e) => {
            console.error(e);
            toast.error("Cannot change email, please try again later");
        });
    };

    return (
        <>
            {
                showModalWaiting ? (
                    <>
                        <Dialog
                            open={showModalWaiting}
                            onClose={handleCloseChangeEmail}
                            slotProps={{
                                paper: {
                                    component: 'form',
                                    onSubmit: (event) => {
                                        event.preventDefault();
                                    },
                                },
                            }}
                        >
                            <DialogTitle id="responsive-dialog-title"
                                         className="!text-[1.8rem] !font-[700]"
                            >
                                Waiting for email confirmation
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText className="!text-[1.2rem]">
                                    {emailRetry ? (
                                        <>
                                            Please confirm this email: <strong>{emailRetry}</strong>
                                            {retryAfterHours && (
                                                <> or try again after <strong>{retryAfterHours}</strong> hours to send
                                                    email
                                                    again</>
                                            )}
                                            <div style={{
                                                marginTop: '1rem',
                                            }}>
                                                Cannot get email confirm ?
                                                <button
                                                    onClick={() => {
                                                        if (resendAgainAfterSecs === 0) {
                                                            handleUserSendEmail();
                                                        }
                                                    }}
                                                    style={{
                                                        marginLeft: '0.5rem',
                                                        backgroundColor: 'inherit',
                                                        border: '0px solid black',
                                                        cursor: 'inherit',
                                                    }}>
                                                    Resend again {
                                                    (
                                                        resendAgainAfterSecs > 0 && (
                                                            <>
                                                                after {resendAgainAfterSecs} seconds
                                                            </>
                                                        )
                                                    )
                                                }
                                                </button>
                                            </div>
                                        </>
                                    ) : retryAfterHours ? (
                                        <>Please try again after <strong>{retryAfterHours}</strong> hours to send email
                                            again</>
                                    ) : (
                                        "Please wait, the server may be occupied"
                                    )}
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => {
                                    handleUserCancel();
                                }}
                                        sx={{
                                            textTransform: 'none',
                                        }}
                                        className="!text-[1.2rem]"
                                >
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                ) : (
                    <>
                        <Dialog
                            open={isOpening}
                            onClose={handleCloseChangeEmail}
                            slotProps={{
                                paper: {
                                    component: 'form',
                                    onSubmit: (event) => {
                                        event.preventDefault();
                                        console.log(email);
                                        handleUserSendEmail();
                                    },
                                },
                            }}
                        >
                            <DialogTitle id="responsive-dialog-title"
                                         className="!text-[1.8rem] !font-[700]"
                            >
                                Enter the email to change
                            </DialogTitle>
                            <DialogContent>
                                <TextField
                                    slotProps={{
                                        input: {
                                            style: {
                                                fontSize: '1.2rem', // Tăng kích thước chữ
                                            },
                                        },
                                    }}
                                    autoFocus
                                    required
                                    margin="dense"
                                    id="name"
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    fullWidth
                                    variant="standard"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                    }}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => {
                                    handleUserCancel();
                                }}
                                        sx={{
                                            textTransform: 'none',
                                        }}
                                        className="!text-[1.2rem]"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit"
                                        sx={{
                                            textTransform: 'none',
                                        }}
                                        className="!text-[1.2rem]"
                                >
                                    Send
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )
            }


        </>
    );
};

export default ModalChangeEmail;