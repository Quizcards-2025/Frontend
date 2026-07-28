import React, {useEffect, useRef, useState} from "react";
import {Box, Button, Checkbox, Input, InputAdornment, ListItem, useMediaQuery, useTheme,} from "@mui/material";
import ParallelogramOverlay from "../../components/ParallelogramOverlay/ParallelogramOverlay.jsx";
import {Image} from "react-bootstrap";
import {BiCheck, BiPencil, BiReset, BiXCircle} from "react-icons/bi";
import {CheckCircle} from "@mui/icons-material";
import List from "@mui/material/List";
import {uploadToFirebase} from "../../utils/firebaseUtils.js";
import {storage} from "../../configs/firebaseConfig.js";
import {mapPlanByRole, Roles} from "src/roles/roles.js";
import ModalUpdateImage from "src/components/profile/ModalUpdateImage.jsx";
import api from "src/apis/api.js";
import {toast} from "react-toastify";
import ModalOtpConfirm from "src/components/profile/ModalOtpConfirm.jsx";
import ModalChangeEmail from "src/components/profile/ModalChangeEmail.jsx";
import ModalConfirmIdentity from "src/components/profile/ModalConfirmIdentity.jsx";
import {useNavigate} from "react-router-dom";
import ModalChangePassword from "src/components/profile/ModalChangePassword.jsx";
import ModalConfirmLogoutAll from "src/components/profile/ModalConfirmLogoutAll.jsx";
import {useStreakContext} from "@/context/StreakContext.jsx";


const UserProfile = () => {
    const theme = useTheme();
    const isChangeAvatarAbosuteDisplay = useMediaQuery(theme.breakpoints.up("sm"));
    const navigate = useNavigate();

    const {currentDateStreak} = useStreakContext();

    const [avatar, setAvatar] = useState(null); // Blob

    const [openModalUpdateAvatar, setOpenModalUpdateAvatar] = useState(false);

    const [openModalConfirm, setOpenModalConfirm] = useState(false);

    const [openOtpModalConfirm, setOpenOtpModalConfirm] = useState(false);

    const [nextFunctionOpen, setNextFunctionOpen] = useState(null);

    const [retrySendOtpSecs, setRetrySendOtpSecs] = useState(null);

    const [retrySendEmailSecs, setRetrySendEmailSecs] = useState(null);

    const [retryConfirmEmailHours, setRetryConfirmEmailHours] = useState(null);

    const [emailRetry, setEmailRetry] = useState(null);

    const [openModalChangeEmail, setOpenModalChangeEmail] = useState(false);

    const [openModalShowWaitingEmail, setOpenModalShowWaitingEmail] = useState(false);

    const [openModalChangePassword, setOpenModalChangePassword] = useState(false);

    const [openModalLogoutAllDevices, setOpenModalLogoutAllDevices] = useState(false);

    const [userInformation, setUserInformation] = useState({});

    const [editingUserInfo, setEditingUserInfo] = useState({
        gender: false,
    });

    const [analysisUser, setAnalysisUser] = useState({
        numberSets: 0,
        numberSetsPublic: 0,
        numberClasses: 0,
        numberStreakDays: 0,
    });

    const handleEditingUserInfoChange = (type, value) => {
        // console.log(`Type: ${type}, Value: ${value}`);
        setEditingUserInfo((prev) => ({...prev, [type]: value}));
    };

    const loadUserInfo = async () => {
        const resUserInfo = await api.get("/v1/auth/user-info");
        setUserInformation(resUserInfo.data);
        setEditingUserInfo(resUserInfo.data);
        // console.log(resUserInfo.data);
        localStorage.setItem("user", JSON.stringify(resUserInfo.data));
        return resUserInfo;
    };

    const loadAnalysisUser = async () => {
        try {
            const [resNumberOfSets,
                resNumberSetsPublic,
                resNumberOfClasses] = await Promise.all([
                    api.get("/v1/set/count-my-set"),
                    api.get("/v1/set/count-my-public-set"),
                    api.get("/v1/my-class/count-my-classes"),
                ]
            );
            setAnalysisUser((prev) => ({
                ...prev,
                numberSets: resNumberOfSets.data,
                numberClasses: resNumberOfClasses.data,
                numberSetsPublic: resNumberSetsPublic.data,
                numberStreakDays: currentDateStreak,
            }));
        } catch (err) {
            console.error(err);
            toast.error("Error: Cannot load analysis user data.");
        }
    };

    const inputRefs = useRef({
        firstname: null,
        lastname: null,
        phonenumber: null,
        address: null,
    });

    const handleUpdateImage = async () => {
        try {
            const downloadUrl = await uploadToFirebase(storage, avatar, "images", null, null);
            await api.put("/v1/users/change-basic-information", {avatar: downloadUrl});
            toast.success("Update avatar successfully.");
            await loadUserInfo();
        } catch (err) {
            console.log(err);
            toast.error("Update avatar failed.");
        }
    };

    const handleOpenModalChangeEmail = async () => {
        try {
            await api.get("/v1/users/try-change-email");
            setOpenModalChangeEmail(true);
        } catch (err) {
            console.error(err);
            if (err && err.response) {
                if (err.response.status > 499) {
                    toast.error("Server error when try change email");
                    return;
                }
                if (err.response.status === 425) {
                    const retryAfter = err.response.headers['x-retry-email-after'];
                    const emailRetry_ = err.response.headers['x-user-email'];
                    const isResendAgain = err.response.headers['x-is-resend-again'];
                    const resendAgainSecs = err.response.headers['x-resend-again'];
                    console.log(isResendAgain);
                    if (isResendAgain) {
                        setRetrySendEmailSecs(parseInt(resendAgainSecs, 10));
                    }
                    setRetryConfirmEmailHours(parseInt(retryAfter, 10));
                    setEmailRetry(emailRetry_);
                }
                if (err.response.status === 403) {
                    toast.error("You must confirm identity first before change email.");
                    return;
                }
                setOpenModalShowWaitingEmail(true)
            } else {
                toast.error("Error when try change email");
            }
        }
    };

    const handleOpenModalConfirm = async (nextFunctionOpenFn) => {
        // nextFunctionOpen();
        setNextFunctionOpen(() => nextFunctionOpenFn);
        if (sessionStorage.getItem(`confirm-critical-information-${userInformation.id}`)) {
            nextFunctionOpenFn();
            return;
        }
        if (sessionStorage.getItem(`is-opened-modal-confirm-${userInformation.id}`)) {
            setOpenOtpModalConfirm(true);
            return;
        }
        if (await confirmChangeInformation()) {
            sessionStorage.setItem(`confirm-critical-information-${userInformation.id}`, true);
            nextFunctionOpenFn();
        } else {
            setOpenModalConfirm(true);
        }
    };

    const confirmChangeInformation = async () => {
        try {
            await api.get("/v1/users/try-confirm-critical-information");
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const clickNextConfirm = async () => {
        sessionStorage.setItem(`is-opened-modal-confirm-${userInformation.id}`, true);
        setOpenOtpModalConfirm(true);
    };

    const onOtpModalConfirmModal = async () => {
        if (!retrySendOtpSecs) {
            await setupOtpCode();
        }
    };

    const setupOtpCode = async () => {
        try {
            await api.post("/v1/users/create-confirm-critical-information");
            setRetrySendOtpSecs(60);
        } catch (err) {
            console.error(err);
            console.log(err.response.headers);
            if (err && err.response && err.response.status === 425) {
                const retryAfter = parseInt(err.response.headers['retry-after'], 10);
                setRetrySendOtpSecs(retryAfter);
            } else {
                toast.error("Error when send otp code to email");
            }
        }
    };

    const validateOtp = async (otp) => {
        try {
            await api.post("/v1/users/confirm-critical-information", {otpCode: otp});
            sessionStorage.setItem(`confirm-critical-information-${userInformation.id}`, true);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const sendChangeEmail = async (email) => {
        try {
            await api.put("/v1/users/change-email", {
                newEmail: email
            });
            setRetryConfirmEmailHours(24);
            setRetrySendEmailSecs(300);
            setEmailRetry(email);
            toast.success("Send email to confirm successfully.");
        } catch (err) {
            console.error(err);
            if (err && err.response) {
                if (err.response.status === 409) {
                    toast.error("New email already in use.");
                } else {
                    toast.error("Send email to confirm failed.");
                }
            } else {
                toast.error("Send email to confirm failed.");
            }
            throw err;
        }
    };

    const handleChangePassword = async (oldPassword, newPassword) => {
        try {
            await api.put("/v1/users/change-password", {
                oldPassword, newPassword,
            });
            toast.success("Change password successfully.");
            setOpenModalLogoutAllDevices(true);
            handleEditingUserInfoChange("haspassword", true);
        } catch (err) {
            console.error(err);
            if (err && err.response) {
                if (err.response.status > 499) {
                    toast.error("Server give error when change password.");
                } else if (err.response.status === 403) {
                    toast.error("You should validate OTP first.");
                } else if (err.response.status === 400) {
                    toast.error("Old password is incorrect.");
                } else {
                    toast.error(err.response.data.message);
                }
            } else {
                toast.error("Error while changing password, maybe from server.");
            }
            throw err;
        }
    };

    const logoutAllDevices = async () => {
        try {
            await api.post("/v1/auth/logout-all");
            toast.success("Logout all devices successfully.");
        } catch (err) {
            console.error(err);
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            navigate("/logout");
        }
    };

    const sendUpdateBasicInformation = async (name, value) => {
        try {
            await api.put("/v1/users/change-basic-information", {[name]: value});
            toast.success("Update information successfully.");
            await loadUserInfo();
        } catch (err) {
            console.error(err);
            toast.error("Update information failed.");
        }
    };

    useEffect(() => {
        loadUserInfo().finally();
        loadAnalysisUser().finally();
    }, []);

    return (
        <>
            {/* Container chính */}
            <Box className="h-full m-5 flex flex-col">
                {/* Phần header có overlay & avatar */}
                <Box className="w-full relative overflow-hidden h-[180px] md:h-[220px] min-h-[180px] md:min-h-[220px]">
                    <Box className="w-full h-[150px] m-0 relative overflow-hidden">
                        <Box className="absolute top-0 left-0 w-[1000px] h-[1000px]">
                            <ParallelogramOverlay/>
                        </Box>
                    </Box>

                    <Box
                        className="absolute top-[50px] left-1/2 w-[120px] md:w-[150px] h-[120px] md:h-[150px] border-4 border-white rounded-full overflow-hidden z-[100] transform -translate-x-1/2"
                    >

                        <Image
                            src={userInformation.avatar || "https://static.vecteezy.com/system/resources/previews/009/890/457/non_2x/user-icon-for-web-site-login-head-sign-icon-design-free-vector.jpg"}
                            width="100%"
                            height="100%"
                            className="w-full h-full object-cover"
                            roundedCircle
                        />
                    </Box>

                    {isChangeAvatarAbosuteDisplay && (
                        <Box
                            // Dùng tailwind active: để mô phỏng hiệu ứng scale & shadow thay vì onMouse*
                            className="absolute top-[100px] right-[50px] bg-[#E0E0FE] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                            onClick={() => setOpenModalUpdateAvatar(true)}
                        >
                            <Box className="mx-[10px] text-base text-[#0E22E9] flex items-center">
                                <BiPencil className="mr-[10px]"/>
                                Change profile picture
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Phần nút thay đổi avatar khi màn hình nhỏ */}
                <Box className="mt-[0.2rem] w-full flex flex-col justify-center items-center">
                    {!isChangeAvatarAbosuteDisplay && (
                        <Box
                            className="bg-[#E0E0FE] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer mb-[0.5rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                            onClick={() => setOpenModalUpdateAvatar(true)}
                        >
                            <Box className="mx-[10px] text-base text-[#0E22E9] flex items-center">
                                <BiPencil className="mr-[10px]"/>
                                Change profile picture
                            </Box>
                        </Box>
                    )}

                    {/* Tên người dùng và icon xác nhận */}
                    <Box className="w-full flex justify-center items-center text-[2rem] font-black">
                        {`${userInformation.firstname} ${userInformation.lastname}`}
                        <CheckCircle className="ml-[0.5rem] text-blue-500" sx={{fontSize: 30}}/>
                    </Box>

                    {/* Thống kê */}
                    <Box
                        className="flex flex-col sm:flex-row justify-center items-center text-[1.2rem] font-bold gap-[1rem]">
                        <Box className="rounded-[1.5rem] bg-[#E0E0FE] px-[1.2rem] py-[0.6rem]">
                            {analysisUser.numberSets} sets
                        </Box>
                        <Box className="rounded-[1.5rem] bg-[#E0E0FE88] px-[1.2rem] py-[0.6rem]">
                            {analysisUser.numberSetsPublic} public sets
                        </Box>
                        <Box className="rounded-[1.5rem] bg-[#E0E0FE] px-[1.2rem] py-[0.6rem]">
                            {analysisUser.numberClasses} classes
                        </Box>
                        <Box className="rounded-[1.5rem] bg-[#E0E0FE88] px-[1.2rem] py-[0.6rem]">
                            {analysisUser.numberStreakDays} streak days
                        </Box>
                    </Box>
                </Box>

                {/* Account Information */}
                <Box className="text-[1.2rem] font-bold mt-4">Account information</Box>
                <Box className="flex flex-col w-full mt-2">
                    {/* Username */}
                    <Box className="flex flex-col md:flex-row w-full mb-2 gap-2">
                        <Box
                            className="!text-[1.05rem] rounded-[15px] sm:bg-[#E0E0FE] flex-shrink-0 basis-1/4 sm:flex block justify-center items-center text-base">
                            Username
                        </Box>
                        <Input
                            disableUnderline={true}
                            type="text"
                            disabled
                            className="!text-[1.05rem] bg-[#F8F8FF] rounded-[15px] p-[20px] outline-none w-full text-base"
                            value={userInformation.username}
                        />
                    </Box>

                    {/* Email */}
                    <Box className="flex flex-col md:flex-row w-full mb-2 gap-2">
                        <Box
                            className="!text-[1.05rem] rounded-[15px] sm:bg-[#E0E0FE] flex-shrink-0 basis-1/4 sm:flex block justify-center items-center text-base">
                            Email
                        </Box>
                        <Input
                            disableUnderline={true}
                            type="email"
                            disabled
                            value={userInformation.email}
                            placeholder="Enter your email"
                            className="!text-[1.05rem] bg-[#F8F8FF] rounded-[15px] p-[20px] outline-none w-full text-base "
                            sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                    color: 'white', // Giữ màu chữ nguyên bản
                                    mixBlendMode: 'difference',
                                    opacity: 1, // Ngăn mờ đi
                                    WebkitTextFillColor: 'inherit', // Đảm bảo màu chữ không bị ảnh hưởng trên Webkit
                                },
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <Box
                                        className="flex items-center text-base text-[#0E22E9] bg-[#E0E0FE] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                        onClick={() => {
                                            handleOpenModalConfirm(() => {
                                                handleOpenModalChangeEmail().then().catch();
                                            }).then().catch();
                                        }}
                                    >
                                        <BiPencil className="mr-[10px]"/>
                                        Edit
                                    </Box>
                                </InputAdornment>
                            }
                        />
                    </Box>

                    {/* Password */}
                    <Box className="flex flex-col md:flex-row w-full mb-2 gap-2">
                        <Box
                            className="!text-[1.05rem] rounded-[15px] sm:bg-[#E0E0FE] flex-shrink-0 basis-1/4 sm:flex block justify-center items-center text-base">
                            Password
                        </Box>
                        <Box className="relative w-full h-full">
                            <Input
                                disableUnderline={true}
                                type="password"
                                placeholder={editingUserInfo.haspassword ? "" : "Empty password"}
                                disabled
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        color: 'white', // Giữ màu chữ nguyên bản
                                        mixBlendMode: 'difference',
                                        opacity: 1, // Ngăn mờ đi
                                        WebkitTextFillColor: 'inherit', // Đảm bảo màu chữ không bị ảnh hưởng trên Webkit
                                    },
                                }}
                                value={editingUserInfo.haspassword ? "******" : undefined}
                                className="!text-[1.05rem] bg-[#F8F8FF] rounded-[15px] p-[20px] outline-none w-full text-base "
                                endAdornment={
                                    <InputAdornment position="end">
                                        <Box
                                            className="flex items-center text-base text-[#0E22E9] bg-[#E0E0FE] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                            onClick={() => {
                                                handleOpenModalConfirm(() => {
                                                    setOpenModalChangePassword(true);
                                                }).then().catch();
                                            }}
                                        >
                                            <BiPencil className="mr-[10px]"/>
                                            Change password
                                        </Box>
                                    </InputAdornment>
                                }
                            />
                        </Box>
                    </Box>
                </Box>

                {/* User Information */}
                <Box className="text-[1.2rem] font-bold mt-2">User information</Box>
                <Box className="flex flex-col w-full mt-2">
                    {/* First name */}
                    <Box className="flex flex-col md:flex-row w-full mb-2 gap-2">
                        <Box
                            className="!text-[1.05rem] rounded-[15px] sm:bg-[#E0E0FE] flex-shrink-0 basis-1/4 sm:flex block justify-center items-center text-base">
                            First name
                        </Box>
                        <Input
                            inputRef={(el) => (inputRefs.current["firstname"] = el)}
                            disableUnderline={true}
                            type="text"
                            readOnly={!(editingUserInfo.firstname_isEditing === true)}
                            value={editingUserInfo.firstname || ""}
                            onChange={(e) => {
                                handleEditingUserInfoChange("firstname", e.target.value);
                            }}
                            sx={{
                                '& .MuiInputBase-input': {
                                    cursor: `url('https://ssl.gstatic.com/ui/v1/icons/mail/images/2/openhand.cur'), text`, // Sử dụng URL của Google
                                },
                                '& .MuiInputBase-input:hover': {
                                    cursor: `url('https://ssl.gstatic.com/ui/v1/icons/mail/images/2/openhand.cur'), text`,
                                },
                            }}
                            placeholder="Enter your firstname"
                            className="!text-[1.05rem] bg-[#F8F8FF] rounded-[15px] p-[20px] outline-none w-full text-base"
                            endAdornment={
                                <InputAdornment position="end">
                                    {
                                        editingUserInfo.firstname_isEditing ?
                                            (
                                                <>
                                                    <Box
                                                        className="flex md:!flex-row flex-col gap-2"
                                                    >
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-red-300 rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                handleEditingUserInfoChange("firstname_isEditing", false);
                                                            }}
                                                        >
                                                            <BiXCircle className="mr-[10px]"/>
                                                            Cancel
                                                        </Box>
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-blue-300 rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                sendUpdateBasicInformation("firstName", editingUserInfo.firstname)
                                                                    .then()
                                                                    .catch();
                                                            }}
                                                        >
                                                            <BiCheck className="mr-[10px]"/>
                                                            Done
                                                        </Box>
                                                    </Box>
                                                </>
                                            ) :
                                            (
                                                <>
                                                    <Box
                                                        className="flex md:!flex-row flex-col gap-2"
                                                    >
                                                        {
                                                            editingUserInfo.firstname !== userInformation.firstname &&
                                                            (
                                                                <Box
                                                                    className="flex items-center text-base text-[#0E22E9] bg-[#E5E7EB] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                                    onClick={() => {
                                                                        handleEditingUserInfoChange("firstname", userInformation.firstname);
                                                                    }}
                                                                >
                                                                    <BiReset className="mr-[10px]"/>
                                                                    Reset
                                                                </Box>
                                                            )
                                                        }
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-[#E0E0FE] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                handleEditingUserInfoChange("firstname_isEditing", true);
                                                                inputRefs.current["firstname"] && inputRefs.current["firstname"].focus();
                                                            }}
                                                        >
                                                            <BiPencil className="mr-[10px]"/>
                                                            Edit
                                                        </Box>
                                                    </Box>
                                                </>
                                            )
                                    }
                                </InputAdornment>
                            }
                        />
                    </Box>

                    {/* Last name */}
                    <Box className="flex flex-col md:flex-row w-full mb-2 gap-2">
                        <Box
                            className="!text-[1.05rem] rounded-[15px] sm:bg-[#E0E0FE] flex-shrink-0 basis-1/4 sm:flex block justify-center items-center text-base"
                        >
                            Last name
                        </Box>
                        <Input
                            inputRef={(el) => (inputRefs.current["lastname"] = el)}
                            disableUnderline={true}
                            type="text"
                            readOnly={!(editingUserInfo.lastname_isEditing === true)}
                            value={editingUserInfo.lastname || ""}
                            onChange={(e) => {
                                handleEditingUserInfoChange("lastname", e.target.value);
                            }}
                            placeholder="Enter your lastname"
                            className="!text-[1.05rem] bg-[#F8F8FF] rounded-[15px] p-[20px] outline-none w-full text-base "
                            sx={{
                                '& .MuiInputBase-input': {
                                    cursor: `url('https://ssl.gstatic.com/ui/v1/icons/mail/images/2/openhand.cur'), text`, // Sử dụng URL của Google
                                },
                                '& .MuiInputBase-input:hover': {
                                    cursor: `url('https://ssl.gstatic.com/ui/v1/icons/mail/images/2/openhand.cur'), text`,
                                },
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    {
                                        editingUserInfo.lastname_isEditing ?
                                            (
                                                <>
                                                    <Box
                                                        className="flex md:!flex-row flex-col gap-2"
                                                    >
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-red-300 rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                handleEditingUserInfoChange("lastname_isEditing", false);
                                                            }}
                                                        >
                                                            <BiXCircle className="mr-[10px]"/>
                                                            Cancel
                                                        </Box>
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-blue-300 rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                sendUpdateBasicInformation("lastName", editingUserInfo.lastname)
                                                                    .then()
                                                                    .catch();
                                                            }}
                                                        >
                                                            <BiCheck className="mr-[10px]"/>
                                                            Done
                                                        </Box>
                                                    </Box>
                                                </>
                                            ) :
                                            (
                                                <>
                                                    <Box
                                                        className="flex md:!flex-row flex-col gap-2"
                                                    >
                                                        {
                                                            editingUserInfo.lastname !== userInformation.lastname &&
                                                            (
                                                                <Box
                                                                    className="flex items-center text-base text-[#0E22E9] bg-[#E5E7EB] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                                    onClick={() => {
                                                                        handleEditingUserInfoChange("lastname", userInformation.lastname);
                                                                    }}
                                                                >
                                                                    <BiReset className="mr-[10px]"/>
                                                                    Reset
                                                                </Box>
                                                            )
                                                        }
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-[#E0E0FE] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                handleEditingUserInfoChange("lastname_isEditing", true);
                                                                inputRefs.current["lastname"] && inputRefs.current["lastname"].focus();
                                                            }}
                                                        >
                                                            <BiPencil className="mr-[10px]"/>
                                                            Edit
                                                        </Box>
                                                    </Box>
                                                </>
                                            )
                                    }
                                </InputAdornment>
                            }
                        />
                    </Box>

                    {/* Gender */}
                    <Box className="flex flex-col md:flex-row w-full mb-2 gap-2">
                        <Box
                            className="!text-[1.05rem] rounded-[15px] sm:bg-[#E0E0FE] flex-shrink-0 basis-1/4 sm:flex block justify-center items-center text-base"
                        >
                            Gender
                        </Box>

                        {/*<Checkbox*/}
                        {/*    className="!bg-[#F8F8FF] !rounded-[15px] !p-[20px] !outline-none !w-full !text-base"*/}
                        {/*    checked={editingUserInfo.gender ?? false}*/}
                        {/*    onChange={(e) => {*/}
                        {/*        handleEditingUserInfoChange("gender", e.target.checked);*/}
                        {/*    }}*/}
                        {/*/>*/}

                        <Box className="flex items-center bg-[#F8F8FF] rounded-[15px] p-[20px] w-full">
                            <Checkbox
                                checked={editingUserInfo.gender ?? false}
                                onChange={(e) => {
                                    handleEditingUserInfoChange('gender', e.target.checked);
                                }}
                                sx={{
                                    padding: 0,
                                    '& .MuiSvgIcon-root': {
                                        fontSize: '1.5rem',
                                    },
                                }}
                            />
                            {/* Mô phỏng endAdornment */}
                            {
                                editingUserInfo.gender !== userInformation.gender && (
                                    <>
                                        <Box className="ml-auto flex md:!flex-row flex-col gap-2">
                                            <Box
                                                className="flex items-center text-base text-[#0E22E9] bg-[#E5E7EB] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                onClick={() => {
                                                    handleEditingUserInfoChange('gender', userInformation.gender);
                                                }}
                                            >
                                                <BiReset className="mr-[10px]"/>
                                                Reset
                                            </Box>
                                            <Box
                                                className="flex items-center text-base text-[#0E22E9] bg-blue-300 rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                onClick={() => {
                                                    sendUpdateBasicInformation("gender", editingUserInfo.gender)
                                                        .then()
                                                        .catch();
                                                }}
                                            >
                                                <BiCheck className="mr-[10px]"/>
                                                Done
                                            </Box>
                                        </Box>
                                    </>
                                )
                            }
                        </Box>
                    </Box>

                    {/* Birthday */}
                    <Box className="flex flex-col md:flex-row w-full mb-2 gap-2">
                        <Box
                            className="!text-[1.05rem] rounded-[15px] sm:bg-[#E0E0FE] flex-shrink-0 basis-1/4 sm:flex block justify-center items-center text-base">
                            Birthday
                        </Box>
                        <Input
                            disableUnderline={true}
                            type="date"
                            value={editingUserInfo.dateOfBirth || ""}
                            onChange={(e) => {
                                handleEditingUserInfoChange("dateOfBirth", e.target.value);
                            }}
                            className="!text-[1.05rem] bg-[#F8F8FF] rounded-[15px] p-[20px] outline-none w-full text-base"

                            endAdornment={
                                <InputAdornment position="end">
                                    {
                                        editingUserInfo.dateOfBirth !== userInformation.dateOfBirth && (
                                            <>
                                                <Box className="ml-auto flex md:!flex-row flex-col gap-2">
                                                    <Box
                                                        className="flex items-center text-base text-[#0E22E9] bg-[#E5E7EB] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                        onClick={() => {
                                                            handleEditingUserInfoChange('dateOfBirth', userInformation.dateOfBirth);
                                                        }}
                                                    >
                                                        <BiReset className="mr-[10px]"/>
                                                        Reset
                                                    </Box>
                                                    <Box
                                                        className="flex items-center text-base text-[#0E22E9] bg-blue-300 rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                        onClick={() => {
                                                            sendUpdateBasicInformation("dateOfBirth", editingUserInfo.dateOfBirth)
                                                                .then()
                                                                .catch();
                                                        }}
                                                    >
                                                        <BiCheck className="mr-[10px]"/>
                                                        Done
                                                    </Box>
                                                </Box>
                                            </>
                                        )
                                    }
                                </InputAdornment>
                            }
                        />
                    </Box>

                    {/* Phone number */}
                    <Box className="flex flex-col md:flex-row w-full mb-2 gap-2">
                        <Box
                            className="!text-[1.05rem] rounded-[15px] sm:bg-[#E0E0FE] flex-shrink-0 basis-1/4 sm:flex block justify-center items-center text-base">
                            Phone number
                        </Box>
                        <Input
                            inputRef={(el) => (inputRefs.current["phonenumber"] = el)}
                            disableUnderline={true}
                            type="tel"
                            readOnly={!(editingUserInfo.phonenumber_isEditing === true)}
                            value={editingUserInfo.phonenumber || ""}
                            onChange={(e) => {
                                handleEditingUserInfoChange("phonenumber", e.target.value);
                            }}
                            placeholder="Enter your phone number"
                            className="!text-[1.05rem] bg-[#F8F8FF] rounded-[15px] p-[20px] outline-none w-full text-base "
                            sx={{
                                '& .MuiInputBase-input': {
                                    cursor: `url('https://ssl.gstatic.com/ui/v1/icons/mail/images/2/openhand.cur'), text`, // Sử dụng URL của Google
                                },
                                '& .MuiInputBase-input:hover': {
                                    cursor: `url('https://ssl.gstatic.com/ui/v1/icons/mail/images/2/openhand.cur'), text`,
                                },
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    {
                                        editingUserInfo.phonenumber_isEditing ?
                                            (
                                                <>
                                                    <Box
                                                        className="flex md:!flex-row flex-col gap-2"
                                                    >
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-red-300 rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                handleEditingUserInfoChange("phonenumber_isEditing", false);
                                                            }}
                                                        >
                                                            <BiXCircle className="mr-[10px]"/>
                                                            Cancel
                                                        </Box>
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-blue-300 rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                sendUpdateBasicInformation("phoneNumber", editingUserInfo.phonenumber)
                                                                    .then()
                                                                    .catch();
                                                            }}
                                                        >
                                                            <BiCheck className="mr-[10px]"/>
                                                            Done
                                                        </Box>
                                                    </Box>
                                                </>
                                            ) :
                                            (
                                                <>
                                                    <Box
                                                        className="flex md:!flex-row flex-col gap-2"
                                                    >
                                                        {
                                                            editingUserInfo.phonenumber !== userInformation.phonenumber &&
                                                            (
                                                                <Box
                                                                    className="flex items-center text-base text-[#0E22E9] bg-[#E5E7EB] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                                    onClick={() => {
                                                                        handleEditingUserInfoChange("phonenumber", userInformation.phonenumber);
                                                                    }}
                                                                >
                                                                    <BiReset className="mr-[10px]"/>
                                                                    Reset
                                                                </Box>
                                                            )
                                                        }
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-[#E0E0FE] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                handleEditingUserInfoChange("phonenumber_isEditing", true);
                                                                inputRefs.current["phonenumber"] && inputRefs.current["phonenumber"].focus();
                                                            }}
                                                        >
                                                            <BiPencil className="mr-[10px]"/>
                                                            Edit
                                                        </Box>
                                                    </Box>
                                                </>
                                            )
                                    }
                                </InputAdornment>
                            }
                        />
                    </Box>

                    {/* Address */}
                    <Box className="flex flex-col md:flex-row w-full mb-2 gap-2">
                        <Box
                            className="!text-[1.05rem] rounded-[15px] sm:bg-[#E0E0FE] flex-shrink-0 basis-1/4 sm:flex block justify-center items-center text-base">
                            Address
                        </Box>
                        <Input
                            inputRef={(el) => (inputRefs.current["address"] = el)}
                            disableUnderline={true}
                            type="tel"
                            readOnly={!(editingUserInfo.address_isEditing === true)}
                            value={editingUserInfo.address || ""}
                            onChange={(e) => {
                                handleEditingUserInfoChange("address", e.target.value);
                            }}
                            placeholder="Enter your address"
                            className="!text-[1.05rem] bg-[#F8F8FF] rounded-[15px] p-[20px] outline-none w-full text-base "
                            sx={{
                                '& .MuiInputBase-input': {
                                    cursor: `url('https://ssl.gstatic.com/ui/v1/icons/mail/images/2/openhand.cur'), text`, // Sử dụng URL của Google
                                },
                                '& .MuiInputBase-input:hover': {
                                    cursor: `url('https://ssl.gstatic.com/ui/v1/icons/mail/images/2/openhand.cur'), text`,
                                },
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    {
                                        editingUserInfo.address_isEditing ?
                                            (
                                                <>
                                                    <Box
                                                        className="flex md:!flex-row flex-col gap-2"
                                                    >
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-red-300 rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                handleEditingUserInfoChange("address_isEditing", false);
                                                            }}
                                                        >
                                                            <BiXCircle className="mr-[10px]"/>
                                                            Cancel
                                                        </Box>
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-blue-300 rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                sendUpdateBasicInformation("address", editingUserInfo.address)
                                                                    .then()
                                                                    .catch();
                                                            }}
                                                        >
                                                            <BiCheck className="mr-[10px]"/>
                                                            Done
                                                        </Box>
                                                    </Box>
                                                </>
                                            ) :
                                            (
                                                <>
                                                    <Box
                                                        className="flex md:!flex-row flex-col gap-2"
                                                    >
                                                        {
                                                            editingUserInfo.address !== userInformation.address &&
                                                            (
                                                                <Box
                                                                    className="flex items-center text-base text-[#0E22E9] bg-[#E5E7EB] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                                    onClick={() => {
                                                                        handleEditingUserInfoChange("address", userInformation.address);
                                                                    }}
                                                                >
                                                                    <BiReset className="mr-[10px]"/>
                                                                    Reset
                                                                </Box>
                                                            )
                                                        }
                                                        <Box
                                                            className="flex items-center text-base text-[#0E22E9] bg-[#E0E0FE] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                                            onClick={() => {
                                                                handleEditingUserInfoChange("address_isEditing", true);
                                                                inputRefs.current["address"] && inputRefs.current["address"].focus();
                                                            }}
                                                        >
                                                            <BiPencil className="mr-[10px]"/>
                                                            Edit
                                                        </Box>
                                                    </Box>
                                                </>
                                            )
                                    }
                                </InputAdornment>
                            }
                        />
                    </Box>

                    {/* Subscription */}
                    <Box className="flex flex-col md:flex-row w-full mb-2 gap-2">
                        <Box
                            className="!text-[1.05rem] rounded-[15px] sm:bg-[#E0E0FE] flex-shrink-0 basis-1/4 sm:flex block justify-center items-center text-base">
                            Subscription
                        </Box>
                        <Input
                            disableUnderline={true}
                            type="text"
                            readOnly
                            sx={{
                                '& .MuiInputBase-input': {
                                    cursor: `url('https://ssl.gstatic.com/ui/v1/icons/mail/images/2/openhand.cur'), text`, // Sử dụng URL của Google
                                },
                                '& .MuiInputBase-input:hover': {
                                    cursor: `url('https://ssl.gstatic.com/ui/v1/icons/mail/images/2/openhand.cur'), text`,
                                },
                            }}
                            value={mapPlanByRole(userInformation.role, [Roles.FREE_USER, Roles.PREMIUM_USER, Roles.ADMIN])}
                            className="!text-[1.05rem] bg-[#F8F8FF] rounded-[15px] p-[20px] outline-none w-full text-base "
                            endAdornment={
                                <InputAdornment position="end">
                                    <Box
                                        className="flex items-center text-base text-[#0E22E9] bg-[#E0E0FE] rounded-[27px] shadow-[0_0_8px_#BABEFD] z-[100] cursor-pointer pl-[1.2rem] pr-[1.2rem] active:scale-95 active:shadow-[0_0_5px_rgba(165,181,207,0.1)] transition-transform"
                                        onClick={() => {
                                            navigate('/payment');
                                        }}
                                    >
                                        <BiPencil className="mr-[10px]"/>
                                        Choose other plans
                                    </Box>
                                </InputAdornment>
                            }
                        />
                    </Box>
                </Box>

                {/*/!* Payment Information *!/*/}
                {/*<Box className="text-[1.2rem] font-bold mt-2">Payment information</Box>*/}
                {/*<Box className="text-[1.2rem] font-bold mt-2 w-full text-center">*/}
                {/*    /!*Manage by Strip*!/*/}
                {/*    /!*<Elements*!/*/}
                {/*    /!*    stripe={stripePromise}*!/*/}
                {/*    /!*    options={{ clientSecret: "pi_3QbCheIGukEbv88M0Fco6apO" }}*!/*/}
                {/*    /!*>*!/*/}
                {/*    /!*    <PaymentElement id="payment-element" />*!/*/}
                {/*    /!*</Elements>*!/*/}
                {/*</Box>*/}

                <Box className="text-[1.2rem] font-bold mt-2 text-red-500">
                    Danger Zone
                </Box>

                <List className="rounded-[10px] border-2 border-red-500 max-w-full mt-[0.8rem]">
                    <ListItem className="p-[1.4rem] flex flex-col sm:flex-row flex-wrap items-center gap-2">
                        <Box className="text-[1.2rem] flex-1 whitespace-normal break-words flex flex-col">
                            <Box>Logout all devices</Box>
                            <Box className="font-normal text-base">
                                This will log you out from all devices. You’ll need to log in again.
                            </Box>
                        </Box>

                        <Button
                            sx={{
                                fontSize: "1rem",
                                fontFamily: "inherit",
                                border: "2px solid red",
                                color: "red",
                                borderRadius: "0.5rem",
                                textTransform: "none", // Ngăn viết hoa tự động
                            }}
                            onClick={() => {
                                setOpenModalLogoutAllDevices(true);
                            }}
                        >
                            Logout all devices
                        </Button>
                    </ListItem>
                    <ListItem className="p-[1.4rem] flex flex-col sm:flex-row flex-wrap items-center gap-2">
                        <Box className="text-[1.2rem] flex-1 whitespace-normal break-words flex flex-col">
                            <Box>Delete this account</Box>
                            <Box className="font-normal text-base">
                                Once you delete this account, there is no going back. Please be certain.
                            </Box>
                            <Box className="font-normal text-sm italic">
                                This action can take more time to complete.
                            </Box>
                        </Box>

                        <Button
                            sx={{
                                fontSize: "1rem",
                                fontFamily: "inherit",
                                border: "2px solid red",
                                color: "red",
                                borderRadius: "0.5rem",
                                textTransform: "none", // Ngăn viết hoa tự động
                            }}
                        >
                            Delete this account
                        </Button>
                    </ListItem>
                </List>
            </Box>

            <ModalUpdateImage
                isOpening={openModalUpdateAvatar}
                setIsOpening={setOpenModalUpdateAvatar}
                imagePreview={avatar}
                onAvatarChange={(data) => setAvatar(data)}
                onUserAgree={() => {
                    handleUpdateImage().then().catch();
                }}
            />

            <ModalOtpConfirm
                isOpening={openOtpModalConfirm}
                setIsOpening={setOpenOtpModalConfirm}
                retrySendEmailOtpSecs={retrySendOtpSecs}
                setRetrySendEmailOtpSecs={setRetrySendOtpSecs}
                validateOtpFunction={(otp, callbackFn, callbackError) => {
                    validateOtp(otp).then((r) => {
                        callbackFn(r);
                    }).catch((e) => {
                        callbackError(e);
                    });
                }}
                nextFunction={nextFunctionOpen}
                onModalOpen={() => {
                    onOtpModalConfirmModal().then().catch();
                }}
                sendOtpAgainFunction={() => {
                    setupOtpCode().then().catch();
                }}
            />

            <ModalChangeEmail
                isOpening={openModalChangeEmail}
                setIsOpening={setOpenModalChangeEmail}
                showModalWaiting={openModalShowWaitingEmail}
                setShowModalWaiting={setOpenModalShowWaitingEmail}
                retryAfterHours={retryConfirmEmailHours}
                emailRetry={emailRetry}
                resendAgainSeconds={retrySendEmailSecs}
                setResendAgainSeconds={setRetrySendEmailSecs}
                sendChangeEmail={(email, callbackFn, callbackError) => {
                    sendChangeEmail(email).then(r => {
                        callbackFn(r);
                    }).catch(e => {
                        callbackError(e);
                    });
                }}
            />

            <ModalConfirmIdentity
                isOpening={openModalConfirm}
                setIsOpening={setOpenModalConfirm}
                onClickNext={() => {
                    clickNextConfirm().then().catch();
                }}
            />

            <ModalChangePassword
                isOpening={openModalChangePassword}
                setIsOpening={setOpenModalChangePassword}
                changePassword={(oldPassword, newPassword, callbackFn, callbackError) => {
                    handleChangePassword(oldPassword, newPassword).then(r => {
                        callbackFn(r);
                    }).catch(e => {
                        callbackError(e);
                    });
                }}
                hasOldPassword={editingUserInfo.haspassword}
            />

            <ModalConfirmLogoutAll
                isOpening={openModalLogoutAllDevices}
                setIsOpening={setOpenModalLogoutAllDevices}
                onUserAgree={(callbackFn, callbackErrorFn) => {
                    logoutAllDevices().then(
                        r => {
                            callbackFn(r);
                        }
                    ).catch(
                        e => {
                            callbackErrorFn(e);
                        }
                    );
                }}
            />
        </>
    );
};

export default UserProfile;