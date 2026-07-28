import {useEffect, useState} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControl, FormHelperText, IconButton,
    InputAdornment, InputLabel,
    OutlinedInput,
} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import * as validate from "../../utils/validate.js";

const ModalChangePassword = ({
                                 isOpening = false,
                                 setIsOpening = () => {
                                 },
                                 onModalClose = () => {
                                 },
                                 onModalOpen = () => {
                                 },
                                 onUserCancel = () => {
                                 },
                                 changePassword = () => {
                                 },
                                 hasOldPassword = false,
                             }) => {
    const [oldPassword, setOldPassword] = useState("");

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errorPassword, setErrorPassword] = useState("");

    const [errorConfirmPassword, setErrorConfirmPassword] = useState("");

    useEffect(() => {
        if (isOpening) {
            onModalOpen();
        }
    }, [isOpening]);

    const handleCloseChangePassword = () => {
        setIsOpening(false);
        onModalClose();
    };

    const handleUserCancel = () => {
        onUserCancel();
        handleCloseChangePassword();
    };

    const handleUserChangePassword = () => {
        const errorPassword = validate.validatePassword(password);
        const errorConfirmPassword = password !== confirmPassword ? "Password and confirm password do not match" : "";

        setErrorPassword(errorPassword);
        setErrorConfirmPassword(errorConfirmPassword);

        if (errorPassword || errorConfirmPassword) {
            return;
        }

        changePassword(oldPassword, password, (r) => {
            handleCloseChangePassword();
        }, (e) => {
            console.error(e);
        });
    };

    return (
        <>
            <Dialog
                open={isOpening}
                onClose={handleCloseChangePassword}
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (event) => {
                            event.preventDefault();
                            // console.log(password);
                            handleUserChangePassword();
                        },
                    },
                }}
            >
                <DialogTitle id="responsive-dialog-title"
                             className="!text-[1.8rem] !font-[700]"
                >
                    Change password
                </DialogTitle>
                <DialogContent>
                    {
                        hasOldPassword && (
                            <>
                                <FormControl sx={{mt: 2, width: '100%'}} variant="outlined">
                                    <InputLabel htmlFor="outlined-old-password">Old password</InputLabel>
                                    <OutlinedInput
                                        id="outlined-old-password"
                                        type={showOldPassword ? 'text' : 'password'}
                                        fullWidth
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={
                                                        showOldPassword ? 'hide the password' : 'display the password'
                                                    }
                                                    onClick={() => setShowOldPassword((show) => !show)}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onMouseUp={(e) => e.preventDefault()}
                                                    edge="end"
                                                >
                                                    {showOldPassword ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        label="New password"
                                    />
                                </FormControl>
                            </>
                        )
                    }
                    <FormControl sx={{mt: 2, width: '100%'}} variant="outlined">
                        <InputLabel htmlFor="outlined-new-password">New password</InputLabel>
                        <OutlinedInput
                            error={errorPassword !== ""}
                            id="outlined-new-password"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={
                                            showPassword ? 'hide the password' : 'display the password'
                                        }
                                        onClick={() => setShowPassword((show) => !show)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onMouseUp={(e) => e.preventDefault()}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="New password"
                        />
                        <FormHelperText
                            className="!text-red-700 !text-[1.2rem] !whitespace-normal !break-words !max-w-full"
                            sx={{
                                wordBreak: 'break-word', // Ngắt từ nếu cần
                            }}
                        >
                            {errorPassword}
                        </FormHelperText>
                    </FormControl>
                    <FormControl sx={{mt: 2, width: '100%'}} variant="outlined">
                        <InputLabel htmlFor="outlined-confirm-new-password">Confirm new password</InputLabel>
                        <OutlinedInput
                            error={errorConfirmPassword !== ""}
                            id="outlined-confirm-new-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={
                                            showConfirmPassword ? 'hide the password' : 'display the password'
                                        }
                                        onClick={() => setShowConfirmPassword((show) => !show)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onMouseUp={(e) => e.preventDefault()}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Confirm new password"
                        />
                        <FormHelperText
                            className="!text-red-700 !text-[1.2rem] !whitespace-normal !break-words !max-w-full"
                            sx={{
                                wordBreak: 'break-word', // Ngắt từ nếu cần
                            }}
                        >
                            {errorConfirmPassword}
                        </FormHelperText>
                    </FormControl>
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
                        Change
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ModalChangePassword;