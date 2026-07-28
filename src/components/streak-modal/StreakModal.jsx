import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Grid, Grid2, IconButton,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import "../../../public/styles/common/streak/streak-week-mark-style.css";
import CloseIcon from '@mui/icons-material/Close';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import starDropStreakGif from "../../../public/gif/star_drop_streak.gif";
import firePlaceStreakGif from "../../../public/gif/fireplace_streak.gif";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DateCalendar} from '@mui/x-date-pickers/DateCalendar';
import dayjs from "dayjs";
import {useStreakContext} from "../../context/StreakContext.jsx";
import SvgStreakLearnedIcon from "../icon/StreakLearnedIcon.jsx";
import {useMode} from "../../theme.js";
import StreakCalendarContainer from "../streak-calendar-container/StreakCalendarContainer.jsx";
import StreakCustomDay from "../streak-custom-day/StreakCustomDay.jsx";
import {transformDataToMarkDays as transformDataUtil} from "../../utils/streakCalendarUtils.jsx";
import {changeBgAndApplyEffects, cleanupEffects} from "../../utils/sparkleEffectsUtils.jsx";
import {toast} from "react-toastify";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from "../../apis/api.js";
import {getStreakByMonthYear, getStreakData} from "../../services/StreakService.js";

const StreakModal = () => {
    const {
        streakModalState,
        setStreakModalState,
        isLearnedCurrentDay,
        markDaysLearned,
        dayLearned,
        currentDateStreak,
        setMarkDaysLearned,
    } = useStreakContext();

    const theme = useTheme();
    const [customTheme, colorMode] = useMode();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const highlightedRowRefs = useRef({});
    const particleIntervalsRef = useRef({});
    const sparkleIntervalsRef = useRef({});

    const [selectMonth, setSelectMonth] = useState(dayjs().month() + 1);
    const [selectYear, setSelectYear] = useState(dayjs().year());

    const prevMonthRef = useRef(null);
    const prevYearRef = useRef(null);

    const transformDataToMarkDays = (data) => {
        transformDataUtil(
            data,
            setMarkDaysLearned,
            changeBgAndApplyEffects,
            highlightedRowRefs,
            particleIntervalsRef,
            sparkleIntervalsRef,
        );
    };

    const handleMonthChange = (dateData) => {
        cleanupEffects(highlightedRowRefs, particleIntervalsRef, sparkleIntervalsRef);
        setSelectMonth(dateData.month() + 1);
        setSelectYear(dateData.year());

        getStreakByMonthYear(dateData.month() + 1, dateData.year())
            .then(data => {
                transformDataToMarkDays(data);
            })
            .catch(e => {
                console.error("Error:", e);
                toast.error("fetch data failed!");
            });
    };


    useEffect(() => {
        if (streakModalState) {
            const monthChanged = !prevMonthRef.current || prevMonthRef.current !== selectMonth;
            const yearChanged = !prevYearRef.current || prevYearRef.current !== selectYear;

            if (monthChanged || yearChanged) {
                getStreakByMonthYear(selectMonth, selectYear)
                    .then(data => {
                        transformDataToMarkDays(data);
                    })
                    .catch(e => {
                        console.error("Error:", e);
                        toast.error("fetch data failed!");
                    });
            }

            prevMonthRef.current = selectMonth;
            prevYearRef.current = selectYear;
        }

        return () => {
            if (streakModalState) {
                cleanupEffects(highlightedRowRefs, particleIntervalsRef, sparkleIntervalsRef);
            }
        };
    }, [streakModalState, selectMonth, selectYear]);

    // Memoize referenceDate
    const referenceDate = useMemo(() => {
        return dayjs().year(selectYear).month(selectMonth - 1);
    }, [selectMonth, selectYear]);

    // Memoize slotProps.day
    const daySlotProps = useMemo(() => {
        return {
            day: ({day}) => ({
                isCurrentDay: dayjs(day).isSame(dayjs(), "day"),
                isMarkDay: markDaysLearned.some((d) => d.isSame(day, "day")),
                isCurrentDayLearned: isLearnedCurrentDay,
            }),
        };
    }, [markDaysLearned, isLearnedCurrentDay]);

    return (
        <>
            <StreakCalendarContainer>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Dialog
                        fullScreen={fullScreen}
                        open={streakModalState}
                        onClose={() => setStreakModalState(false)}
                        aria-labelledby="responsive-dialog-title"
                        slotProps={{
                            paper: {
                                sx: {
                                    borderRadius: "20px",
                                    overflow: "hidden",
                                }
                            }
                        }}
                    >
                        <DialogTitle id="responsive-dialog-title"
                                     className="!text-[1.8rem] !font-[700]"
                                     sx={{
                                         ...(isLearnedCurrentDay ? {
                                             backgroundImage: `url(${firePlaceStreakGif})`,
                                             backgroundSize: "cover",    // Đảm bảo ảnh cover toàn bộ kích thước
                                             backgroundPosition: "center", // Căn giữa ảnh
                                             backgroundRepeat: "no-repeat",
                                         } : {
                                             backgroundColor: "#9accd5",
                                         })
                                     }}
                        >
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                width="100%"
                                height="100%"
                                flexDirection="column"
                                marginTop={2}
                                sx={{
                                    color: "white",
                                }}
                            >
                                <Box
                                    className="flex gap-1 justify-between items-center"
                                >
                                    <Box
                                        className={!isLearnedCurrentDay ? 'text-black' : 'text-gray-300'}
                                    >
                                        {currentDateStreak} day streak
                                    </Box>
                                    {
                                        isLearnedCurrentDay && (
                                            <SvgStreakLearnedIcon size={40}/>
                                        )
                                    }
                                </Box>

                                <Box
                                    className={`
                                        cursor-pointer
                                        transition-all duration-200 ease-in-out
                                        ${
                                            !isLearnedCurrentDay ? 
                                                'hover:bg-neutral-200 hover:text-black ' +
                                                'active:scale-95 active:bg-blue-400 active:text-white ' +
                                                'text-black' 
                                                :
                                                'hover:bg-neutral-200 hover:!text-black ' +
                                                'active:scale-95 active:bg-blue-400 active:text-black ' +
                                                'text-white bg-sky-400'
                                    }                                         
                                      `}
                                    marginTop={2}
                                    fontWeight="600"
                                    fontSize="1.4rem"
                                    border="3px solid #000"
                                    padding="0.2rem 1.2rem"
                                    borderRadius="20px"
                                >
                                    How to earn a streak?
                                    <LocalFireDepartmentIcon
                                        sx={{
                                            color: "orange",
                                            marginLeft: "0.5rem",
                                        }}
                                        fontSize="medium"
                                    />
                                </Box>
                            </Box>
                        </DialogTitle>
                        <IconButton
                            aria-label="close"
                            onClick={() => setStreakModalState(false)}
                            sx={(theme) => ({
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: theme.palette.grey[500],
                            })}
                        >
                            <CloseIcon/>
                        </IconButton>
                        <DialogContent
                            className="!min-w-[400px]"
                            dividers
                        >
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                color="text.secondary"
                            >
                                Calendar
                            </Typography>
                            <DateCalendar
                                readOnly
                                onMonthChange={handleMonthChange}
                                referenceDate={referenceDate}
                                views={["day"]}
                                slots={{
                                    day: StreakCustomDay,
                                }}
                                slotProps={daySlotProps}
                            />
                            <Grid2
                                container
                                spacing={2}
                                sx={{
                                    width: "100%",
                                    margin: 0,
                                    marginBottom: "0.6rem",
                                }}
                            >
                                <Grid2 size={12}>
                                    <Box
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            minHeight: "60px",
                                            border: "2px solid #000",
                                            borderRadius: "20px",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <CheckCircleIcon
                                            sx={{
                                                color: 'grey',
                                                '& path': {
                                                    fill: 'orange',
                                                },
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                marginLeft: "0.8rem",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "1.2rem",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {dayLearned}
                                            </Typography>
                                            <Typography>
                                                Days studied
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid2>
                            </Grid2>
                        </DialogContent>
                    </Dialog>
                </LocalizationProvider>
            </StreakCalendarContainer>
        </>
    );
};

export default StreakModal;