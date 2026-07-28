import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useSetCardPassword} from "src/context/SetPasswordContext.jsx";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const durationOptions = [
    {value: 0, label: "Don't remember"},
    {value: 5 * 60, label: '5 minutes'},
    {value: 15 * 60, label: '15 minutes'},
    {value: 30 * 60, label: '30 minutes'},
    {value: 60 * 60, label: '1 hour'},
    {value: 3 * 60 * 60, label: '3 hours'},
    {value: 6 * 60 * 60, label: '6 hours'},
    {value: 12 * 60 * 60, label: '12 hours'},
    {value: 24 * 60 * 60, label: '1 day'},
    {value: 2 * 24 * 60 * 60, label: '2 days'},
    {value: 3 * 24 * 60 * 60, label: '3 days'},
    {value: 4 * 24 * 60 * 60, label: '4 days'},
    {value: 5 * 24 * 60 * 60, label: '5 days'},
    {value: 6 * 24 * 60 * 60, label: '6 days'},
    {value: 7 * 24 * 60 * 60, label: '7 days'},
];

const PasswordChecking = ({
                              setId,
                              changePassword = () => {},
                              changeExpiredAt = () => {},
                              onClose = (setId, validating, password, expiredAt) => {
                              },
                          }) => {
    const {modalConfirmOpen, setModalConfirmOpen} = useSetCardPassword();
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [selectedDuration, setSelectedDuration] = React.useState(durationOptions[0].value);

    React.useEffect(() => {
    }, [modalConfirmOpen]);


    const handleClose = () => {
        setModalConfirmOpen(false);
        onClose(setId, false, "", "");
    };

    const handleConfirm = () => {
        setModalConfirmOpen(false);
        onClose(setId, true, password, selectedDuration);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
        changePassword(event.target.value);
    };

    const handleClickShowPassword = () => {
        setShowPassword((show) => !show);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleDurationChange = (event) => {
        setSelectedDuration(event.target.value);
        changeExpiredAt(event.target.value);
    };

    return (
        <React.Fragment>
            <Dialog
                open={modalConfirmOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="password-checking-dialog-description"
                PaperProps={{
                    style: {
                        borderRadius: '12px',
                        padding: '10px',
                        minWidth: '400px'
                    }
                }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    paddingBottom: '8px'
                }}>{"Enter Password"}</DialogTitle>
                <DialogContent sx={{paddingTop: '8px !important'}}>
                    <DialogContentText id="password-checking-dialog-description"
                                       sx={{marginBottom: 2, textAlign: 'center', fontSize: '0.9rem'}}>
                        Please enter this set password to proceed.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={handlePasswordChange}
                        sx={{
                            marginBottom: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{display: 'flex', alignItems: 'center', marginTop: 1, marginBottom: 1}}>
                        <Typography variant="body2" sx={{marginRight: 2, whiteSpace: 'nowrap'}}>
                            Don&#39;t ask again for:
                        </Typography>
                        <FormControl fullWidth margin="dense" variant="outlined"
                                     sx={{'& .MuiOutlinedInput-root': {borderRadius: '8px'}, flexGrow: 1}}>
                            <Select
                                labelId="dont-ask-again-select-label"
                                id="dont-ask-again-select"
                                value={selectedDuration}
                                onChange={handleDurationChange}
                                displayEmpty
                            >
                                {durationOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{
                    paddingRight: '24px',
                    paddingLeft: '24px',
                    paddingBottom: '16px',
                    paddingTop: '16px',
                    justifyContent: 'center'
                }}>
                    <Button
                        onClick={handleClose}
                        sx={{
                            color: 'grey.700',
                            borderColor: 'grey.400',
                            borderRadius: '8px',
                            textTransform: 'none',
                            padding: '8px 24px',
                            marginRight: '8px',
                            flexGrow: 1,
                            '&:hover': {
                                backgroundColor: 'grey.100',
                                borderColor: 'grey.500',
                            }
                        }}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="contained"
                        sx={{
                            backgroundColor: '#1976d2',
                            color: 'white',
                            borderRadius: '8px',
                            textTransform: 'none',
                            padding: '8px 24px',
                            flexGrow: 1,
                            '&:hover': {
                                backgroundColor: '#1565c0',
                            }
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default PasswordChecking;
