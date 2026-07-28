import * as React from "react";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {StaticDateTimePicker} from "@mui/x-date-pickers/StaticDateTimePicker";
import {ThemeProvider, createTheme} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {Switch, FormControlLabel, Modal, Button, Box} from "@mui/material";
import dayjs from "dayjs";


const SetDeadline = function ({
                                  id = null,
                                  originDeadline,
                                  onSubmitTime = () => {
                                  },
                                  isOpen = null,
                              }) {
    const [deadlineId, setDeadlineId] = React.useState(id);
    const [darkMode, setDarkMode] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    const [localDayjs, setLocalDayjs] = React.useState(null);

    const [canEdit, setCanEdit] = React.useState(true);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    React.useEffect(() => {
        setLocalDayjs(dayjs);

        console.log(id);

        return () => {
            setLocalDayjs(null);
        };
    }, []);

    React.useEffect(() => {
        if (isOpen) {
            checkDeadlineValid();
        }
        isOpen ? handleOpen() : handleClose();
    }, [isOpen]);

    React.useEffect(() => {
        setDeadlineId(id);
    }, [id]);

    const lightTheme = createTheme({
        palette: {
            mode: "light",
            primary: {
                main: "#1976d2",
            },
            background: {
                default: "#ffffff",
                paper: "#ffffff",
            },
        },
        components: {
            MuiPickersLayout: {
                styleOverrides: {
                    root: {
                        gridTemplateColumns: "1fr minmax(0, 1fr) !important", // Điều chỉnh tỉ lệ hai cột
                    },
                },
            },
        },
    });

    const darkTheme = createTheme({
        palette: {
            mode: "dark",
            primary: {
                main: "#90caf9",
            },
            background: {
                default: "#303030",
                paper: "#424242",
            },
        },
        components: {
            MuiPickersLayout: {
                styleOverrides: {
                    root: {
                        gridTemplateColumns: "1fr minmax(0, 1fr) !important", // Điều chỉnh tỉ lệ hai cột
                    },
                },
            },
            MuiPickersDay: {
                styleOverrides: {
                    root: {
                        "&.Mui-selected": {
                            backgroundColor: "#90caf9",
                        },
                    },
                },
            },
        },
    });

    const checkDeadlineValid = () => {
        if (originDeadline) {
            try {
                const deadlineTime = dayjs(originDeadline).tz(getSystemTimezone());
                const currentTime = dayjs().tz(getSystemTimezone());

                // console.log(deadlineTime);
                // console.log(currentTime);
                if (deadlineTime.isBefore(currentTime)) {
                    setCanEdit(false);
                }
            } catch (err) {
                setCanEdit(false);
                console.error("Error to check:", err);
            }
        }
    };

    const handleThemeChange = () => {
        setDarkMode(!darkMode);
    };

    const getSystemTimezone = () => {
        return dayjs.tz.guess(); // Lấy múi giờ của hệ thống
    };

    const getEndpointTime = () => {
        if (!originDeadline) {
            return dayjs(getSystemTimezone());
        }
        try {
            return dayjs(originDeadline).tz(getSystemTimezone());
        } catch {
            return dayjs(getSystemTimezone());
        }
    };

    const modalStyle = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        outline: "none",
        borderRadius: "8px",
        width: "80%", // Chiều rộng theo phần trăm màn hình
        maxWidth: "45rem", // Giới hạn chiều rộng tối đa
    };

    if (!localDayjs) {
        return null; // hoặc return một loading spinner
    }

    return (
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <CssBaseline/>
            {/*<Button onClick={handleOpen} variant="contained">*/}
            {/*    Open Date Time Picker*/}
            {/*</Button>*/}

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-date-time-picker"
                aria-describedby="modal-date-time-picker"
                sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // làm mờ nền
                    backdropFilter: "blur(5px)", // hiệu ứng blur
                }}
            >
                <Box sx={modalStyle}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={darkMode}
                                onChange={handleThemeChange}
                                color="primary"
                            />
                        }
                        label={darkMode ? "Dark Mode" : "Light Mode"}
                        sx={{m: 2}}
                    />
                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale={localDayjs.locale()}
                    >
                        <StaticDateTimePicker
                            orientation="landscape"
                            timezone={getSystemTimezone()}
                            onAccept={(newValue) => {
                                if (newValue) {
                                    // chuyển đổi về UTC +0 để thống nhất múi giờ
                                    const formatDateTime = newValue
                                        .tz("UTC")
                                        .format("YYYY-MM-DD HH:mm:ss.SSSSSS+00:00");

                                    // console.log("Accept:", formatDateTime);
                                    onSubmitTime(formatDateTime, originDeadline, deadlineId);
                                }
                            }}
                            onChange={(newValue) => {
                                if (newValue) {
                                    const formatDateTime = newValue.format(
                                        "YYYY-MM-DD HH:mm:ss.SSSSSS"
                                    );
                                    // console.log(formatDateTime);
                                }
                            }}
                            onClose={handleClose}
                            localeText={{
                                toolbarTitle: "Select a deadline reminder time", // Thay đổi tiêu đề ở đây
                            }}
                            defaultValue={getEndpointTime()}
                            minDateTime={dayjs().tz(getSystemTimezone()).add(canEdit ? 0 : 99999, "year")}
                            sx={{
                                bgcolor: "background.paper",
                                "& .MuiPickersToolbar-root": {
                                    color: darkMode ? "white" : "inherit",
                                    "& .MuiTypography-root": {
                                        textTransform: "none", // Bỏ viết hoa
                                    },
                                },
                                "& .MuiDateTimePickerToolbar-root": {
                                    maxWidth: "100%",
                                },
                                "& .MuiTypography-overline": {
                                    textAlign: "left", // Canh giữa
                                    lineHeight: 1.2, // Khoảng cách dòng
                                    whiteSpace: "normal", // Giữ các dòng sát
                                    width: "100%",
                                    fontSize: "1.2rem",
                                    paddingBottom: "1.1rem",
                                },
                                "& .MuiClock-pin": {
                                    backgroundColor: darkMode ? "#90caf9" : "#1976d2",
                                },
                                "& .MuiClockPointer-root": {
                                    backgroundColor: darkMode ? "#90caf9" : "#1976d2",
                                },
                                "& .MuiClockPointer-thumb": {
                                    backgroundColor: darkMode ? "#90caf9" : "#1976d2",
                                    borderColor: darkMode ? "#90caf9" : "#1976d2",
                                },
                                "& .MuiPickersLayout-actionBar": {
                                    gridColumn: "1 / 4",
                                    gridRow: 3,
                                    display: "flex",
                                    justifyContent: "flex-end",
                                },
                            }}
                            slots={{
                                actionBar: ({onCancel, onAccept}) =>
                                    canEdit ? (
                                        <>
                                            <Box className="MuiPickersLayout-actionBar">
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={(event) => {
                                                        handleClose();
                                                        onCancel();
                                                    }}
                                                    sx={{
                                                        marginRight: "1rem",
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={(event) => {
                                                        // handleAcceptClick();
                                                        onAccept();
                                                    }}
                                                >
                                                    OK
                                                </Button>
                                            </Box>
                                        </>
                                    ) : (
                                        <></>
                                    ),
                            }}
                        />
                    </LocalizationProvider>
                </Box>
            </Modal>
        </ThemeProvider>
    );
};

export default SetDeadline;

// import React, { useEffect, useState } from "react";

// const TimeRemaining = ({ seconds }) => {
//   const [text, setText] = useState("");

//   useEffect(() => {
//     const calculateTimeRemaining = () => {
//       const intl = new Intl.RelativeTimeFormat(navigator.language || "en", {
//         numeric: "auto", // Hiển thị dạng "in 3 days" hoặc "3 days ago"
//       });

//       if (seconds >= 86400) {
//         // Nếu >= 1 ngày
//         const days = Math.floor(seconds / 86400);
//         setText(intl.format(days, "day"));
//       } else if (seconds >= 3600) {
//         // Nếu >= 1 giờ
//         const hours = Math.floor(seconds / 3600);
//         setText(intl.format(hours, "hour"));
//       } else {
//         setText(intl.format(0, "hour")); // Mặc định là "remaining 0 hours"
//       }
//     };

//     calculateTimeRemaining();
//   }, [seconds]);

//   return (
//     <>
//       <div style={{
//         fontSize: "30px",
//         color: "black",
//         border: "10px solid black",
//         padding: "10rem"
//       }}>
//         <span>{text}</span>
//       </div>
//     </>
//   );
// };

// export default TimeRemaining;
