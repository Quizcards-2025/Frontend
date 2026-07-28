import {Box, IconButton, Input, InputAdornment, useTheme} from "@mui/material";
import SvgImageBackground from "../../components/icon/HomeImageBackground.jsx";
import React, {useContext, useEffect, useState} from "react";
import {FcGoogle} from "react-icons/fc";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {Link, useNavigate} from "react-router-dom";
import {ColorModeContext, tokens} from "../../theme.js";
import api, {base_api} from "../../apis/api.js";
import {canAccess, Roles} from "../../roles/roles.js";
import {useGoogleLogin} from "@react-oauth/google";
import {v4 as uuidv4} from "uuid";
import {toast} from "react-toastify";
import ImgBackgroundLogin from "../../components/BackgroundImg/ImgBackgroundLogin.jsx";
import * as autheService from "src/services/AuthenticationService.js";
import * as validate from "../../utils/validate.js";

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthdate, setBirthDate] = useState(new Date());
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [birthdateError, setBirthDateError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const theme = useTheme();

    const navigate = useNavigate();

    const colorMode = useContext(ColorModeContext);
    const colors = tokens(theme.palette.mode);

    const googleGmailLogin = useGoogleLogin({
        onSuccess: async (response) => {
            const {code} = response;
            console.log(code);
            try {
                const res = await api.post("/v1/auth/oauth2-login", {code}, {
                    headers: {
                        'Content-Type': 'application/json'
                    }, withCredentials: true,
                });
                localStorage.removeItem("last_time_use");
                localStorage.removeItem("starting_use");
                localStorage.setItem("access_token", res.data.accessToken);
                localStorage.setItem("refresh_token", res.data.refreshToken);
                const user = await autheService.getYourProfile();
                localStorage.setItem("user", JSON.stringify(user));
                // navigate("/user");
                toast.success("Đăng nhập thành công!");
                if (sessionStorage.getItem("redirectAfterAuth") != null) {
                    const redirectPath = sessionStorage.getItem("redirectAfterAuth");
                    sessionStorage.removeItem("redirectAfterAuth");
                    window.location.href = redirectPath;
                } else {
                    navigate("/user");
                }
            } catch (error) {
                toast.error("Đăng nhập thất bại!");
                console.error(error);
            }
        }, onError: (error) => {
            toast.error('Đăng nhập thất bại!');
        }, onNonOAuthError: (error) => {
            toast.error('Đăng nhập thất bại!');
        }, flow: 'popup',
    });

    const handleBirthDateChange = (e) => {
        setBirthDateError("");
        const now = new Date();
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate)) {
            if (newDate < now) {
                setBirthDate(newDate);
            } else {
                setBirthDateError("* Date cannot be greater than or equal to current date.")
            }
        } else {
            setBirthDateError("* Invalid date:" + e.target.value)
            console.error("* Invalid date:", e.target.value);
        }
    };

    const handleErrorRegister = (error) => {
        console.error(error);
        if (!error) {
            return;
        }
        if (error.status === 405) {
            console.error("Method not allow");
            return;
        }
        if (error.status === 500) {
            console.error("Lỗi từ server", error);
            console.log(error);
            return;
        }
        const response = error.response;
        if (response && response.data && response.data.errors) {
            const errors = response.data.errors;
            if (errors.hasOwnProperty("dateOfBirth")) {
                setBirthDateError(errors.dateOfBirth);
            }
            if (errors.hasOwnProperty("username")) {
                setUsernameError(errors.username);
            }
            if (errors.hasOwnProperty("email")) {
                setEmailError(errors.email);
            }
            if (errors.hasOwnProperty("password")) {
                setPasswordError(errors.password);
            }
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLastNameError("");
        setFirstNameError("");

        let ok = true;

        const usernameErr = validate.validateUsername(username);
        setUsernameError(usernameErr);
        ok = ok && !usernameErr?.trim();
        const emailErr = validate.validateEmail(email);
        setEmailError(emailErr);
        ok = ok && !emailErr?.trim();

        const passwordErr = validate.validatePassword(password);
        setPasswordError(passwordErr);
        ok = ok && !passwordErr?.trim();

        const firstNameError = validate.validateName(firstName);
        setFirstNameError(firstNameError);
        ok = ok && !firstNameError?.trim();
        const lastNameError = validate.validateName(lastName);
        ok = ok && !lastNameError?.trim();
        setLastNameError(lastNameError);

        if (!ok) {
            return;
        }

        const firstNameSignUp = firstName && firstName.trim().length !== 0 ? firstName : 'Annoymous';
        const lastNameSignUp = lastName && lastName.trim().length !== 0 ? lastName : uuidv4().toLowerCase();

        try {
            const res = await base_api.post("/v1/auth/signup", {
                firstName: firstNameSignUp,
                lastName: lastNameSignUp,
                dateOfBirth: birthdate,
                username,
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
            });
            localStorage.setItem("refresh_token", res.data.refreshToken);
            localStorage.setItem("access_token", res.data.accessToken);
            const user = await autheService.getYourProfile();
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/user");
            toast.success("Đăng nhập thành công!")
        } catch (error) {
            toast("Đăng ký thất bại !");
            handleErrorRegister(error);
        }
    };

    const handleLoginRedirect = () => {
        console.log("Redirecting to login page...");
        window.location.href = "/login";
    };
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box
            // Responsive container: chuyển layout từ column trên xs sang row trên md
            sx={{
                bgcolor: "#e0e0fe",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-around",
                height: "100vh",
                width: "100%",
                position: "relative",
                zIndex: 2,
            }}
        >
            <Box
                // Responsive Box cho background image
                sx={{
                    height: { xs: "200px", md: "100vh" },
                    width: { xs: "100%", md: "fit-content" },
                    boxShadow: 20,
                }}
            >
                <ImgBackgroundLogin />
            </Box>
            <Box
                // Responsive Box cho form signup
                sx={{
                    width: { xs: "90%", md: "100%" },
                    p: { xs: 2, md: 2 },
                    display: "flex",
                    flexDirection: "column",
                    m: { xs: 2, md: 20 },
                    bgcolor: "white",
                    height: "fit-content",
                    borderRadius: "15px",
                    pl: { xs: 2, md: 5 },
                    pr: { xs: 2, md: 5 },
                }}
            >
                <h1 style={{
                    fontWeight: "bolder",
                    fontSize: "40px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>Welcome aboard, rookie!</h1>
                <button onClick={() => googleGmailLogin()} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "50px",
                    borderRadius: "15px",
                    borderTop: "0px",
                    borderRight: "0px",
                    borderLeft: "0px",
                    borderBottom: "4px solid",
                    borderColor: "#babefd",
                    gap: "40px",
                    fontSize: "15px",
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
                <form style={{display: "flex", flexDirection: "column", gap: "5px", fontSize: "14px"}}
                      onSubmit={handleSignup}>
                    <div style={{display: "flex", justifyContent: "space-between", gap: "10px"}}>
                        <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                            <span>First name</span>
                            <Input
                                disableUnderline={true}
                                type="text"
                                placeholder="E.g: John"
                                sx={{
                                    backgroundColor: "#f0f0ff",
                                    borderRadius: "15px",
                                    height: "40px",
                                    padding: "20px",
                                    outline: "none",
                                    border: "none"
                                }}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            {firstNameError && (
                                <span style={{color: 'red', fontSize: '12px'}}>{firstNameError}</span>
                            )}
                        </Box>
                        <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                            <span>Last name</span>
                            <Input
                                disableUnderline={true}
                                type="text"
                                placeholder="E.g: Doe"
                                sx={{
                                    backgroundColor: "#f0f0ff",
                                    borderRadius: "15px",
                                    height: "40px",
                                    padding: "20px",
                                    outline: "none",
                                    border: "none"
                                }}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            {lastNameError && (
                                <span style={{color: 'red', fontSize: '12px'}}>{lastNameError}</span>
                            )}
                        </Box>
                    </div>
                    <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                        <span>Birthday</span>
                        <Input
                            disableUnderline={true}
                            type="date"
                            placeholder="DD-MM-YYYY"
                            sx={{
                                backgroundColor: "#f0f0ff",
                                borderRadius: "15px",
                                height: "40px",
                                padding: "20px",
                                outline: "none",
                                border: "none",
                                cursor: "pointer"
                            }}
                            max={new Date().toISOString().split('T')[0]}
                            value={birthdate.toISOString().split('T')[0]}
                            onChange={handleBirthDateChange}
                        />
                        {birthdateError && (
                            <span style={{color: 'red', fontSize: '12px'}}>{birthdateError}</span>
                        )}
                    </Box>
                    <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                        <span>Username</span>
                        <Input
                            disableUnderline={true}
                            type="text"
                            placeholder="Enter your username"
                            sx={{
                                backgroundColor: "#f0f0ff",
                                borderRadius: "15px",
                                height: "40px",
                                padding: "20px",
                                outline: "none",
                                border: "none"
                            }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {usernameError && (
                            <span style={{color: 'red', fontSize: '12px'}}>{usernameError}</span>
                        )}
                    </Box>
                    <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                        <span>Email</span>
                        <Input
                            disableUnderline={true}
                            type="email"
                            placeholder="Enter your email"
                            sx={{
                                backgroundColor: "#f0f0ff",
                                borderRadius: "15px",
                                height: "40px",
                                padding: "20px",
                                outline: "none",
                                border: "none"
                            }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {emailError && (
                            <span style={{color: 'red', fontSize: '12px'}}>{emailError}</span>
                        )}
                    </Box>
                    <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                        <span style={{display: "flex", justifyContent: "space-between"}}>Password</span>
                        <Input
                            disableUnderline={true}
                            type={showPassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton onClick={handleShowPassword} edge="end">
                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            }
                            placeholder="Enter your password"
                            sx={{
                                backgroundColor: "#f0f0ff",
                                borderRadius: "15px",
                                height: "40px",
                                padding: "20px",
                                outline: "none",
                                border: "none"
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {passwordError && (
                            <span style={{color: 'red', fontSize: '12px'}}>{passwordError}</span>
                        )}
                    </Box>
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
                        Sign up
                    </button>
                    <Link to="/login" style={{textDecoration: "none"}}>
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
                            fontWeight: "bold"
                        }}>
                            Already joined QuizCards, login
                        </button>
                    </Link>
                </form>
            </Box>
        </Box>
    );
}

export default SignUp;
