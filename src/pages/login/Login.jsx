import {Box, IconButton, Input, InputAdornment} from "@mui/material";
import React, {useEffect, useState} from "react";
import {FcGoogle} from "react-icons/fc";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {Link, useNavigate} from "react-router-dom";
import ImgBackgroundLogin from "../../components/BackgroundImg/ImgBackgroundLogin.jsx";
import api, {setAccessToken, setRefreshToken} from "../../apis/api.js";
import {useGoogleLogin} from "@react-oauth/google";
import {toast} from "react-toastify";
import * as autheService from "src/services/AuthenticationService.js";
import * as deadlineService from "src/services/fetchDeadline.js";
import {FaBell} from "react-icons/fa";

function Login(props) {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [listDeadline, setListDeadline] = useState([]);
    const navigate = useNavigate();

    const validateEmail = (value) => {
        if (!value) return "* Field is required";
    };

    const validatePassword = (value) => {
        if (!value) return "* Field is required";
        return '';
    };

    const googleGmailLogin = useGoogleLogin({
        onSuccess: async (response) => {
            // const {code} = response;
            // console.log(response);
            const {access_token} = response;
            console.log(response);
            try {
                const res = await api.post("/v1/auth/oauth2-login", {accessToken: access_token}, {
                    headers: {
                        'Content-Type': 'application/json'
                    }, withCredentials: true,
                });
                console.log(res);
                await handleTaskSuccess(res);
            } catch (error) {
                toast.error("Đăng nhập thất bại!");
                console.error(error);
            }
        }, onError: (error) => {
            toast.error('Đăng nhập thất bại!');
        }, onNonOAuthError: (error) => {
            toast.error('Đăng nhập thất bại!');
        }, flow: 'implicit',
    });

    const fetchDeadline = async () => {
        try {
            const response = await deadlineService.fetchDataDeadline();
            console.log(response);
            if (response.status === 200) {
                setListDeadline(response.data);
            } else if (response.status === 404) {
                setListDeadline([]);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const handleTaskSuccess = async (res) => {
        if (res.status === 201) {
            localStorage.removeItem("starting_use");
            localStorage.removeItem("last_time_use");
            setAccessToken(res.data.accessToken);
            setRefreshToken(res.data.refreshToken);

            const user = await autheService.getYourProfile();
            localStorage.setItem("user", JSON.stringify(user));

            try {
                const response = await deadlineService.fetchDataDeadline();
                if (response.status === 200) {
                    setListDeadline(response.data);
                    response.data.forEach((item, index) => {
                        setTimeout(() => {
                            toast(
                                <div style={{display: "flex", alignItems: "center"}}>
                                    <FaBell style={{marginRight: "10px", color: "#ffd700", fontSize: "20px"}}/>
                                    <span>You have a deadline: <span style={{fontWeight: "bolder"}}>{item.title}</span></span>
                                </div>,
                                {
                                    position: "bottom-right",
                                    autoClose: 20000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    style: {
                                        background: "linear-gradient(to right, #f8f9fa, #e9ecef)",
                                        boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.9)",
                                        borderRadius: "20px",
                                        padding: "10px",
                                        fontFamily: "Wix Madefor Text",
                                        fontSize: "12px",
                                    },
                                    progressStyle: {
                                        display: "none"
                                    },
                                }
                            );
                        }, index * 1000);
                    });
                } else if (response.status === 404) {
                    setListDeadline([]);
                }
            } catch (err) {
                console.log(err);
            }

            toast.success("User login successfully");
            if (sessionStorage.getItem("redirectAfterAuth") != null) {
                const redirectPath = sessionStorage.getItem("redirectAfterAuth");
                sessionStorage.removeItem("redirectAfterAuth");
                window.location.href = redirectPath;
            } else {
                navigate("/user");
            }
        }
    };

    useEffect(() => {
        console.log("List Deadline updated:", listDeadline);
    }, [listDeadline]);

    const handleLogin = async (e) => {
        e.preventDefault();

        const emailErr = validateEmail(usernameOrEmail);
        const passwordErr = validatePassword(password);

        setEmailError(emailErr);
        setPasswordError(passwordErr);

        if (emailErr || passwordErr) return;

        try {
            const res = await api.post("/v1/auth/login", {usernameOrEmail, password}, {
                headers: {
                    'Content-Type': 'application/json'
                }, withCredentials: true,
            });
            await handleTaskSuccess(res);
        } catch (error) {
            if (error.status === 404) {
                toast.error("Đăng nhập thất bại!\nTên đăng nhập hoặc mật khẩu không hợp lệ.")
                return;
            }
            if (error.status === 403) {
                toast.error("Đăng nhập thất bại!\nTài khoản có thể bị cấm.")
                return;
            }
            console.error(error);
            if (error.status === 500) {
                toast.error("Đăng nhập thất bại!\nLỗi từ server.");
                return;
            }
            toast.error("Đăng nhập thất bại!\nLỗi không xác định.");
        }
    };

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    }
    const handleTest = () => {
        const result = localStorage.getItem("user");
        console.log("test: ", result);
    }

    return (
        <Box
            // Responsive container: chuyển layout từ column trên xs sang row trên md
            sx={{
                bgcolor: "#e0e0fe",
                display: "flex",
                flexDirection: {xs: "column", md: "row"},
                alignItems: "center",
                justifyContent: "space-around",
                height: "100vh",
                width: "100%",
                position: "relative",
                zIndex: 2,
            }}
        >
            <Box
                // Responsive Box cho background image: chiều cao và chiều rộng thay đổi theo breakpoint
                sx={{
                    height: {xs: "200px", md: "100vh"},
                    width: {xs: "100%", md: "fit-content"},
                    boxShadow: 20,
                }}
            >
                <ImgBackgroundLogin/>
            </Box>

            <Box
                // Responsive Box cho form login: điều chỉnh margin, padding và width theo breakpoint
                sx={{
                    width: {xs: "90%", md: "100%"},
                    p: {xs: 2, md: 2},
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    m: {xs: 2, md: 30},
                    bgcolor: "white",
                    height: "fit-content",
                    borderRadius: "15px",
                    pl: {xs: 2, md: 5},
                    pr: {xs: 2, md: 5},
                }}
            >
                <h1 style={{
                    fontWeight: "bolder",
                    fontSize: "40px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>Welcome back</h1>
                <button onClick={() => googleGmailLogin()}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "70px",
                            borderRadius: "15px",
                            borderTop: "0px",
                            borderRight: "0px",
                            borderLeft: "0px",
                            borderBottom: "4px solid",
                            borderColor: "#babefd",
                            gap: "40px",
                            fontSize: "20px",
                            fontWeight: "bold"
                        }}>
                    <FcGoogle size={32}/>
                    <span>Continue with Google</span>
                </button>

                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    width: "100%",
                    color: "blue"
                }}>
                    <span style={{backgroundColor: "#babefd", width: "100%", height: "2px", margin: "0px 7px"}}></span>
                    <span>or</span>
                    <span style={{backgroundColor: "#babefd", width: "100%", height: "2px", margin: "0px 7px"}}></span>
                </div>

                <form onSubmit={handleLogin}
                      style={{
                          display: "flex", flexDirection: "column", gap: "10px"
                      }}>
                    <span>Your username</span>
                    <Input disableUnderline={true}
                           type="text" placeholder="Enter your username"
                           style={{
                               backgroundColor: "#f0f0ff",
                               borderRadius: "15px",
                               height: "50px",
                               padding: "20px",
                               outline: "none",
                               border: "none"
                           }}
                           value={usernameOrEmail}
                           onChange={(e) => setUsernameOrEmail(e.target.value)}
                    />
                    {emailError && (
                        <span style={{color: 'red', fontSize: '12px'}}>{emailError}</span>
                    )}
                    <span style={{
                        display: "flex", justifyContent: "space-between"
                    }}>
                        Password
                        <span style={{color: "blue", cursor: "pointer"}}>
                            <a style={{textDecorationLine: "none"}} href="/forgot-password">Forgot password ?</a>
                        </span>
                    </span>
                    <Input disableUnderline={true}
                           type={showPassword ? 'text' : 'password'}
                           endAdornment={<InputAdornment position="end">
                               <IconButton onClick={handleShowPassword} edge="end">
                                   {showPassword ? <VisibilityOff/> : <Visibility/>}
                               </IconButton>
                           </InputAdornment>}
                           placeholder="Enter your password"
                           style={{
                               backgroundColor: "#f0f0ff",
                               borderRadius: "15px",
                               height: "50px",
                               padding: "20px",
                               outline: "none",
                               border: "none"
                           }}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}/>
                    {passwordError && (
                        <span style={{color: 'red', fontSize: '12px'}}>{passwordError}</span>
                    )}
                    <div style={{display: "flex", flexDirection: "column", marginTop: "100px", gap: "10px"}}>
                        <button type="submit" style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#0e22e9",
                            color: "white",
                            height: "50px",
                            width: "100%",
                            borderTop: "0px",
                            borderRight: "0px",
                            borderLeft: "0px",
                            borderBottom: "4px solid",
                            borderColor: "#020ec7",
                            borderRadius: "15px",
                            fontSize: "20px",
                            fontWeight: "bold"
                        }}>
                            Login
                        </button>

                        <Link to="/register" style={{textDecorationLine: "none"}}>
                            <button style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "white",
                                color: "#0e22e9",
                                height: "50px",
                                width: "100%",
                                border: "2px solid blue",
                                borderBottom: "4px solid blue",
                                borderRadius: "15px",
                                fontSize: "20px",
                                fontWeight: "bold",
                            }}>
                                I’m new to QuizCards, sign up
                            </button>
                        </Link>
                    </div>
                </form>
            </Box>
        </Box>
    );
}

export default Login;
