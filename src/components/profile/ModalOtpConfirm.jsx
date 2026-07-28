import {
    Box,
    Button, CircularProgress,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    useMediaQuery,
    useTheme
} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import {MuiOtpInput} from 'mui-one-time-password-input';
import {toast} from "react-toastify";

const ModalOtpConfirm = ({
                             isOpening = false,
                             retrySendEmailOtpSecs = 0,
                             setRetrySendEmailOtpSecs = () => {},
                             sendOtpAgainFunction = () => {
                             },
                             setIsOpening = () => {
                             },
                             onModalOpen = () => {
                             },
                             onModalClose = () => {
                             },
                             validateOtpFunction = () => {},
                             nextFunction = () => {
                             },
                         }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [lastEndTime, setLastEndTime] = useState(null);

    const [isValidating, setIsValidating] = useState(false);

    const [retryAgain, setRetryAgain] = useState(0);

    const timerIntervalRef = useRef(null);

    const [otp, setOtp] = useState('');

    const handleChange = (newValue) => {
        setOtp(newValue);
    };

    const handleCloseModalConfirmOtp = () => {
        setIsOpening(false);
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        onModalClose();
    };

    const handleResendOtp = () => {
        sendOtpAgainFunction();
        setRetrySendEmailOtpSecs(60);
    };

    const handleCheckOtpValid = () => {
        // handleCloseModalConfirmOtp();
        const otpPattern = /^[0-9]{6}$/;

        if (!otpPattern.test(otp)) {
            toast.error("Invalid OTP Code.");
            return;
        }

        toast.dismiss();

        setIsValidating(true);

        validateOtpFunction(otp, (result) => {
            setIsValidating(false);
            if (result) {
                handleCloseModalConfirmOtp();
                setRetrySendEmailOtpSecs(0);
                nextFunction();
            } else {
                toast.error("Invalid OTP Code.");
            }
        }, (e) => {
            setIsValidating(false);
            console.error(e);
            toast.error("Error while handling OTP Code on server.");
        });
    };

    useEffect(() => {
        if (isOpening) {
            onModalOpen();
            if (lastEndTime != null && Date.now() < lastEndTime) {
                setRetrySendEmailOtpSecs(Math.max(0, Math.round((lastEndTime - Date.now()) / 1000)));
            }
        }
    }, [isOpening]);

    useEffect(() => {
        if (retryAgain <= 0 && timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            setRetrySendEmailOtpSecs(0);
        }
    }, [retryAgain]);

    useEffect(() => {
        clearInterval(timerIntervalRef.current);
        if ((retrySendEmailOtpSecs !== undefined && retrySendEmailOtpSecs !== null) && 0 < retrySendEmailOtpSecs) {
            const endTime = Date.now() + retrySendEmailOtpSecs * 1000;
            setLastEndTime(endTime);
            setRetryAgain(Math.max(0, Math.round((endTime - Date.now()) / 1000)));
            timerIntervalRef.current = setInterval(() => {
                setRetryAgain(Math.max(0, Math.round((endTime - Date.now()) / 1000)));
            }, 1000);
        }
    }, [retrySendEmailOtpSecs]);

    return (
        <>
            <Dialog
                fullScreen={fullScreen}
                open={isOpening}
                onClose={handleCloseModalConfirmOtp}
                slotProps={{
                    paper: {
                        component: 'form',
                        method: 'post',
                        onSubmit: (e) => {
                            e.preventDefault();
                            handleCheckOtpValid();
                        },
                    }
                }}
            >
                <DialogTitle id="responsive-dialog-title"
                             className="!text-[1.8rem] !font-[700]"
                >
                    Verify OTP Code
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className="!text-[1.2rem]">
                        Enter the six-digit code that was emailed to you below.
                    </DialogContentText>
                    <MuiOtpInput
                        value={otp}
                        onChange={handleChange}
                        length={6}
                        validateChar={(value, index) => {
                            const isNumber = typeof value === 'number';
                            return (isNumber || !isNaN(Number(value)));
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Box className="!w-full !mb-3 !flex !flex-col !justify-center !items-center">
                        <Box className="!w-full !mb-3 !flex !justify-center">
                            Haven&#39;t received the code? {retryAgain === 0 ? (
                            <>
                                <Button
                                    className="!m-0 !p-0 !pl-1 !text-cyan-500"
                                    sx={{textTransform: 'none'}}
                                    onClick={handleResendOtp}
                                >
                                    Resend again.
                                </Button>
                            </>
                        ) : (
                            <>
                                Resend after {retryAgain} seconds.
                            </>
                        )}
                        </Box>
                        <Box
                            className="!w-full !h-full !flex !justify-center !items-center"
                        >
                            {
                                isValidating ?
                                    <>
                                        <CircularProgress
                                            size={20}
                                            thickness={4}
                                            className="!mb-3"
                                            sx={{
                                                color: '#1976d2',
                                            }}
                                        />
                                    </> :
                                    <>
                                        <Button type="submit"
                                                sx={{
                                                    textTransform: 'none',
                                                }}
                                                className="!text-[1rem] !rounded !border !border-blue-500 !bg-transparent !hover:bg-blue-500 !text-blue-700 !font-semibold !py-2 !px-4 !hover:border-transparent"
                                        >
                                            Submit
                                        </Button>
                                    </>
                            }
                        </Box>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    )
};

export default ModalOtpConfirm;