import {Box, Button, Dialog, DialogActions, DialogContent, Typography, useMediaQuery, useTheme} from "@mui/material";
import {tokens, useMode} from "../../theme.js";
import React, {useEffect, useState} from "react";
import {getClientLanguageCode} from "../../utils/timeLanguageUtils.js";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import {useStreakContext} from "../../context/StreakContext.jsx";
import {useStreakBackgroundContext} from "../../context/StreakBackgroundContext.jsx";
import SvgStreakLearnedIcon from "../icon/StreakLearnedIcon.jsx";
import dayjs from "dayjs";

const StreakBackgroundModal = () => {
    const theme = useTheme();
    const [customTheme, colorMode] = useMode();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const colors = tokens(customTheme.palette.mode);

    const {
        currentDateStreak,
        streakOneWeek,
    } = useStreakContext();

    const {
        streakBgModalState,
        setStreakBgModalState,
    } = useStreakBackgroundContext();

    const streakCompleteMessageExample = [
        "Awesome job! Your streak just got longer!",
        "Well done! You’ve kept the streak alive and thriving!",
        "Fantastic effort! Your streak is growing stronger every day!",
        "Great going! You’ve pushed your streak to new heights!",
        "Impressive work! Your streak keeps getting better!",
        "Way to go! You’re building an unstoppable streak!",
        "Brilliant! Your streak is proof of your dedication!",
        "Keep it up! Your streak is on fire now!",
        "Superb! You’ve added another win to your streak!",
        "Outstanding! Your streak is a testament to your grit!",
        "Terrific job! Your streak just leveled up!",
        "Amazing! You’re stacking up an epic streak!",
        "Solid work! Your streak is unstoppable now!",
        "Incredible! You’ve extended your streak like a champ!",
        "Wow! Your streak is blazing a trail of success!",
        "Top-notch! Your streak keeps soaring higher!",
    ];

    const localDateFormatter = new Intl.DateTimeFormat('en-CA');

    const streakCompleteMessage = streakCompleteMessageExample[Math.floor(Math.random() * streakCompleteMessageExample.length)];

    const [showingAnimationFire, setShowingAnimationFire] = useState(false);

    const currentLocalDate = localDateFormatter.format(new Date());

    const [weekDays, setWeekDays] = useState([]);

    const initDaysInWeekByClientLanguage = () => {
        const clientLanguageCode = getClientLanguageCode();
        const now = dayjs();
        const startOfWeek = now.startOf("week");
        const firstDateOfWeek = startOfWeek.day();

        const formatter = new Intl.DateTimeFormat("en-US", {weekday: 'narrow'});

        const days = [];

        for (let i = 0; i < 7; i++) {
            const dayDate = startOfWeek.add(i, 'day').toDate();

            days.push({
                index: (firstDateOfWeek + i) % 7,
                name: formatter.format(dayDate),
                date: localDateFormatter.format(dayDate),
            });
        }

        setWeekDays(days);
    };

    useEffect(() => {
        let timer = null;

        if (streakBgModalState) {
            timer = setTimeout(() => {
                setShowingAnimationFire(true);
            }, 400);
        }

        return () => {
            if (streakBgModalState && timer) {
                clearTimeout(timer);
            }
            if (!streakBgModalState) {
                setShowingAnimationFire(false);
            }
        }
    }, [streakBgModalState]);

    useEffect(() => {
        initDaysInWeekByClientLanguage();
    }, []);

    return (
        <>
            <Dialog
                fullScreen={fullScreen}
                open={streakBgModalState}
                onClose={() => setStreakBgModalState(false)}
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
                <DialogContent
                    className="!min-w-[500px] !max-w-[500px]"
                >
                    <Box
                        width="100%"
                        height="100%"
                        paddingY={4}
                        paddingTop={2}
                        paddingBottom={0}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        {/* Streak Header */}
                        <Box
                            display="flex"
                        >
                            <Box
                                display="flex"
                                justifyContent="right"
                                alignItems="center"
                                width="100%"
                            >
                                {
                                    showingAnimationFire && (
                                        <DotLottieReact
                                            src="https://lottie.host/59f47339-761a-45e1-a8b7-2843035740fd/yoll651GpK.lottie"
                                            loop
                                            autoplay
                                        />
                                    )
                                }
                            </Box>
                            <Box
                                display="flex"
                                flexDirection="column"
                                justifyContent="center"
                                alignItems="center"
                                width="100%"
                                gap={0}
                            >
                                <Typography sx={{
                                    fontSize: "2.5rem",
                                    color: '#ff6f00',
                                    fontWeight: '700',
                                    width: "100%",
                                }}>
                                    {
                                        currentDateStreak
                                    }
                                </Typography>
                                <Typography sx={{
                                    fontSize: "2.2rem",
                                    color: '#ff6f00',
                                    fontWeight: '800',
                                    width: "100%",
                                }}>
                                    Days streak
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            border="2px solid black"
                            display="flex"
                            borderRadius="1.2rem"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                            paddingY={4}
                            paddingX={2}
                            marginTop={4}
                        >
                            {
                                weekDays.map((day, index) => {
                                    // console.log("streakOneWeek", streakOneWeek);
                                    // console.log("day.date", day.date);
                                    return (
                                        <>
                                            <Box
                                                display="flex"
                                                flexDirection="column"
                                                justifyContent="center"
                                                alignItems="center"
                                                width="100%"
                                                height="100%"
                                            >
                                                <Box
                                                    key={"icon_key_" + index}
                                                    sx={{
                                                        width: day.date === currentLocalDate ? 40 : 35,
                                                        height: day.date === currentLocalDate ? 35 : 35,
                                                        borderRadius: '50%',
                                                        backgroundColor:
                                                            streakOneWeek.some(data => data.date === day.date) ||
                                                                day.date === currentLocalDate ? 'inherit' :
                                                                colors.dateMark.bgColor,
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    {
                                                        day.date === currentLocalDate ? (
                                                            <>
                                                                <DotLottieReact
                                                                    src="https://lottie.host/1922a03d-1982-4512-befd-3379dea8b5a9/5ANZ90iPj5.lottie"
                                                                    loop
                                                                    autoplay
                                                                />
                                                            </>
                                                        ) : (
                                                            new Date(currentLocalDate).getTime() >= new Date(day.date).getTime() && (
                                                                <>
                                                                    {
                                                                        streakOneWeek.some(data => data.date === day.date) && (
                                                                            <SvgStreakLearnedIcon />
                                                                        )
                                                                    }
                                                                </>
                                                            )
                                                        )
                                                    }
                                                </Box>
                                                <Typography
                                                    key={"text_key_" + index}
                                                    sx={{
                                                        fontSize: 14,
                                                        width: 30,
                                                        textAlign: 'center',
                                                        marginTop: '4px',
                                                        textTransform: 'none',
                                                    }}
                                                >
                                                    {day.name}
                                                </Typography>
                                            </Box>
                                        </>
                                    )
                                })
                            }
                        </Box>
                        <Typography sx={{
                            marginTop: '1rem',
                            textAlign: 'center',
                            mb: 2,
                            fontSize: 18,
                            fontWeight: 700,
                            textWrap: "wrap",
                        }}>
                            {streakCompleteMessage}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions
                    sx={{
                        width: '100%',
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "4px",
                            marginX: "4rem",
                        }}
                    >
                        <Button
                            variant="outlined"
                            sx={{
                                flexGrow: 1,
                                backgroundColor: 'inherit',
                                borderColor: '#3a3a3a',
                                borderRadius: '1rem',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                '&:hover': {
                                    opacity: 0.9,
                                    backgroundColor: '#81acd7',
                                },
                                textTransform: 'none',
                                paddingY: '0.6rem',
                            }}
                        >
                            What&#39;s a streak?
                        </Button>
                    </Box>

                </DialogActions>
            </Dialog>
        </>
    );
};

export default StreakBackgroundModal;