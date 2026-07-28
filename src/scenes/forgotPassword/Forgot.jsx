import {Box, Input, InputBase} from "@mui/material";
import SvgImageBackground from "../../components/icon/HomeImageBackground.jsx";
import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import axios from "axios";
import * as validate from "../../utils/validate.js"
import Loading from "src/components/Loading.jsx";
import {useNavigate} from "react-router-dom";
import {base_api} from "src/apis/api.js";

function Forgot(props) {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code, 3: Reset password
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        console.log(email)
    }, [email]);
    const handleSendEmail = async () => {
        setIsLoading(true);
        try {
            // const response = await axios.post("http://localhost:8080/api/auth/forgot-password", {email});
            const response = await base_api.post("/auth/forgot-password", {email});
            console.log(email);
            console.log(response);
            if (response.status === 200) {
                toast.success(response.data)
            }
            setStep(2);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                toast.error("Email không tồn tại trong hệ thống.");
            } else {
                toast.error("Đã xảy ra lỗi khi gửi mã xác thực.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        try {
            // await axios.post("http://localhost:8080/api/auth/verify-code", {email, code});
            await base_api.post("/auth/verify-code", {email, code});
            setStep(3);
        } catch (error) {
            console.log(error);
            setError(error.response?.data || "Invalid verification code.");
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        const result = validate.validatePassword(newPassword)
        if (result) {
            setError(result);
            return;
        }
        console.log(result);
        try {
            // await axios.post("http://localhost:8080/api/auth/reset-password", {email, newPassword});
            await base_api.post("/auth/reset-password", {email, newPassword});
            toast("Password updated successfully.");
            navigate("/login");
        } catch (error) {
            setError(error.response?.data || "Failed to reset password.");
        }
    };

    const [showPassword, setShowPassword] = useState(false);
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    }
    if (error) {
        toast.error(error);
        setError(null);
    }

    return (
        <>
            <Box bgcolor="#e0e0fe" display="flex" alignItems="center" justifyContent="space-between" height="100vh"
                 pr={5}>
                <Box height="100%" width="100%" p={10} display="flex" flexDirection="column">
                    {step === 1 && (
                        <div>
                            <h1 style={{fontWeight: "bolder", fontSize: "40px"}}>Enter your email</h1>
                            <span>To reset your password</span>
                            <form style={{display: "flex", flexDirection: "column", width: "100%", marginTop: "20px"}}>
                                <span>Your email</span>
                                <Input
                                    disableUnderline={true}
                                    disabled={isLoading}
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        backgroundColor: "#f0f0ff",
                                        borderRadius: "15px",
                                        height: "60px",
                                        padding: "20px",
                                        outline: "none",
                                        border: "none",
                                    }}
                                />
                                {isLoading && <div style={{display: "flex", justifyContent: "center", margin: "10px"}}>
                                    <Loading/>
                                </div>}
                                <button
                                    type="button"
                                    onClick={handleSendEmail}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#0e22e9",
                                        color: "white",
                                        height: "70px",
                                        width: "100%",
                                        borderTop: "0px",
                                        borderRight: "0px",
                                        borderLeft: "0px",
                                        borderBottom: "4px solid",
                                        borderColor: "#020ec7",
                                        borderRadius: "15px",
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        marginTop: "40px",
                                    }}
                                >
                                    Next
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h1 style={{fontWeight: "bolder", fontSize: "40px"}}>Enter Verification Code</h1>
                            <span>Check your email for the code</span>
                            <form style={{display: "flex", flexDirection: "column", width: "100%", marginTop: "20px"}}>
                                <span>Verification code</span>
                                <Input
                                    disableUnderline={true}
                                    type="text"
                                    placeholder="Enter code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    style={{
                                        backgroundColor: "#f0f0ff",
                                        borderRadius: "15px",
                                        height: "60px",
                                        padding: "20px",
                                        outline: "none",
                                        border: "none",
                                    }}
                                />
                                {error && <div>{error}</div>}
                                <button
                                    type="button"
                                    onClick={handleVerifyCode}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#0e22e9",
                                        color: "white",
                                        height: "70px",
                                        width: "100%",
                                        borderTop: "0px",
                                        borderRight: "0px",
                                        borderLeft: "0px",
                                        borderBottom: "4px solid",
                                        borderColor: "#020ec7",
                                        borderRadius: "15px",
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        marginTop: "40px",
                                    }}
                                >
                                    Verify Code
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h1 style={{fontWeight: "bolder", fontSize: "40px"}}>Reset Password</h1>
                            <span>Enter your new password</span>
                            <form style={{display: "flex", flexDirection: "column", width: "100%", marginTop: "20px"}}>
                                <span>New password</span>
                                <Input
                                    disableUnderline={true}
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{
                                        backgroundColor: "#f0f0ff",
                                        borderRadius: "15px",
                                        height: "60px",
                                        padding: "20px",
                                        outline: "none",
                                        border: "none",
                                    }}
                                />
                                <span>Confirm new password</span>
                                <Input
                                    disableUnderline={true}
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{
                                        backgroundColor: "#f0f0ff",
                                        borderRadius: "15px",
                                        height: "60px",
                                        padding: "20px",
                                        outline: "none",
                                        border: "none",
                                    }}
                                />
                                {error && <div>{error}</div>}
                                <button
                                    type="button"
                                    onClick={handleResetPassword}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#0e22e9",
                                        color: "white",
                                        height: "70px",
                                        width: "100%",
                                        borderTop: "0px",
                                        borderRight: "0px",
                                        borderLeft: "0px",
                                        borderBottom: "4px solid",
                                        borderColor: "#020ec7",
                                        borderRadius: "15px",
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        marginTop: "40px",
                                    }}
                                >
                                    Reset Password
                                </button>
                            </form>
                        </div>
                    )}


                </Box>

                <Box height="100vh" width="100%">
                    {/* Image or SVG Background */}
                    <SvgImageBackground height="100vh" width="100%"/>
                </Box>
            </Box>
        </>
    )
}

export default Forgot;