import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Box, CircularProgress, Typography} from "@mui/material";
import {toast} from "react-toastify";
import api from "src/apis/api.js";

const ConfirmEmail = () => {
    const { key } = useParams();
    const [confirmStatus, setConfirmStatus] = useState(null);

    const checkKey = async () => {
        try {
            await api.post(`/v1/users/confirm-key/${key}`);
            toast.success("Email confirmed successfully");
            return true;
        } catch (err) {
            console.error(err);
            if (err && err.response) {
                if (err.response.status > 499) {
                    toast.error("Server error, please try again later");
                } else {
                    toast.error("Confirm email failed, please try again later");
                }
            }
            return false;
        }
    };

    useEffect(() => {
        checkKey().then((status) => {
            setConfirmStatus(status);
        });
    }, [key]); // chỉ chạy lại khi key thay đổi

    return (
        <>
            {confirmStatus === null ? (
                <div className="!w-[100vw] !h-[100vh] flex justify-center items-center">
                    <CircularProgress size={50} thickness={5} color="info" />
                </div>
            ) : (
                <div className="text-center">
                    {confirmStatus ? (
                        <Box className="!w-[100vw] !h-[100vh] flex justify-center items-center flex-col">
                            <Typography variant="h3" fontWeight={700}>
                                Email confirmed successfully
                            </Typography>
                            <p className="text-[1.8rem]">
                                Please go back to the previous page and refresh to update new data
                            </p>
                        </Box>
                    ) : (
                        <Box className="!w-[100vw] !h-[100vh] flex justify-center items-center flex-col">
                            <Typography variant="h3" fontWeight={700}>
                                Email confirmation failed
                            </Typography>
                            <p className="text-[1.8rem]">
                                Please go back to the previous page and try again
                            </p>
                        </Box>
                    )}
                </div>
            )}
        </>
    );
};

export default ConfirmEmail;