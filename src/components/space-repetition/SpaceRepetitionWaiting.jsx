import React, {useEffect, useRef, useState} from "react";
import {ColorModeContext, useMode} from "src/theme.js";
import {Box, Chip, Container, CssBaseline, Grid2, ThemeProvider, Typography} from "@mui/material";
import dayjs from "dayjs";

const shadowBefore = {
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -12,
        left: -12,
        right: -12,
        bottom: -12,
        borderRadius: 'inherit',
        background: 'rgba(179,182,218,0.5)',  // màu glow
        filter: 'blur(12px)',              // độ mờ
        zIndex: -1,
    },
};


function ProgressBarItem({
                             label,
                             value,
                             max,
                             number,
                             color,
                             bgColor,
                             durationMillis = 2500,
                         }) {
    const [progress, setProgress] = useState(0);
    const [animatedValue, setAnimatedValue] = useState(0);
    const numberAnimationIntervalRef = useRef(null);

    useEffect(() => {
        const initialDelayTimer = setTimeout(() => {
            const pct = max > 0 ? (value / max) * 100 : 0;
            setProgress(pct);

            if (value === 0) {
                setAnimatedValue(0);
                return;
            }

            const animationDuration = durationMillis;
            const updateInterval = 50;
            const totalSteps = animationDuration / updateInterval;
            let currentStep = 0;

            if (numberAnimationIntervalRef.current) {
                clearInterval(numberAnimationIntervalRef.current);
            }

            numberAnimationIntervalRef.current = setInterval(() => {
                currentStep++;
                if (currentStep <= totalSteps) {
                    const display = Math.round((value / totalSteps) * currentStep);
                    setAnimatedValue(Math.min(display, value));
                } else {
                    setAnimatedValue(value);
                    clearInterval(numberAnimationIntervalRef.current);
                }
            }, updateInterval);
        }, 300);

        return () => {
            clearTimeout(initialDelayTimer);
            if (numberAnimationIntervalRef.current) {
                clearInterval(numberAnimationIntervalRef.current);
            }
        };
    }, [value, max]);

    return (
        <Box className="mb-3 relative">
            {/* track */}
            <Box className="
          h-[40px] rounded-[22.5px]
          flex items-center pl-[15px]
          relative overflow-hidden
          bg-[#eee]
        ">
                {/* progress fill */}
                <Box
                    className={`
                        absolute top-0 left-0 h-full
                        rounded-[22.5px]
                        transition-all ease-in-out
                    `}
                    style={{
                        width: `${progress}%`,
                        backgroundColor: bgColor,
                        transitionDuration: `${durationMillis}ms`
                    }}
                />

                {/* content */}
                <Box className="flex items-center relative z-10 w-full">
                    <Chip
                        label={number}
                        size="small"
                        className="
              w-[30px] h-[30px] rounded-full
              font-bold mr-1.5
            "
                        style={{
                            backgroundColor: color,
                            color: '#fff',
                        }}
                        sx={{
                            '& .MuiChip-label': {padding: 0},
                        }}
                    />
                    <Box
                        variant="body1"
                        className="font-bold text-base"
                        style={{color}}
                    >
                        {label}
                    </Box>
                    <Box
                        className="font-bold text-base absolute right-[15px]"
                        style={{color}}
                    >
                        {animatedValue}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

const ResultDetail = ({
                          numCardsKnown = 0,
                          numCardsUnknown = 0,
                          numCardsNext = 0,
                          reviewCardsNext = 0,
                          totalNewCards = 0,
                          totalStillLearningCards = 0,
                          totalAlmostLearnedCards = 0,
                          totalMasteredCards = 0,
                          onNavigateFlippingMode = () => {},
                      }) => {
    const initDurationMillis = 3000;

    const initIntervalsMillis = 50;

    const sumAllCards = totalNewCards + totalStillLearningCards + totalAlmostLearnedCards + totalMasteredCards;

    const progressData = [
        {
            label: 'New cards',
            value: totalNewCards,
            max: sumAllCards,
            number: 1,
            color: '#E73D3D',
            bgColor: '#F5B2B2'
        },
        {
            label: 'Still learning',
            value: totalStillLearningCards,
            max: sumAllCards,
            number: 2,
            color: '#FF9500',
            bgColor: '#FFD9A4'
        },
        {
            label: 'Almost learned',
            value: totalAlmostLearnedCards,
            max: sumAllCards,
            number: 3,
            color: '#00C310',
            bgColor: '#96F29E'
        },
        {
            label: 'Learned',
            value: totalMasteredCards,
            max: sumAllCards,
            number: 4,
            color: '#0E22E9',
            bgColor: '#BABEFD'
        },
    ];

    const intervalsRef = useRef([]);

    const [aniNumCardsKnown, setAniNumCardsKnown] = useState(0);
    const [aniNumCardsUnknown, setAniNumCardsUnknown] = useState(0);
    const [aniNumCardsNext, setAniNumCardsNext] = useState(0);
    const [aniReviewCardsNext, setAniReviewCardsNext] = useState(0);
    // const [aniTotalNewCards, setAniTotalNewCards] = useState(totalNewCards);
    // const [aniTotalStillLearningCards, setAniTotalStillLearningCards] = useState(totalStillLearningCards);
    // const [aniTotalAlmostLearnedCards, setAniTotalAlmostLearnedCards] = useState(totalAlmostLearnedCards);
    // const [aniTotalMasteredCards, setAniTotalMasteredCards] = useState(totalMasteredCards);

    const aniSetters = [
        [numCardsKnown, setAniNumCardsKnown],
        [numCardsUnknown, setAniNumCardsUnknown],
        [numCardsNext, setAniNumCardsNext],
        [reviewCardsNext, setAniReviewCardsNext],
    ];

    useEffect(() => {
        const delayInterval = setTimeout(() => {
            for (const pairData of aniSetters) {
                const [maxValue, setAniFn] = pairData;
                if (maxValue == null) {
                    continue;
                }
                const totalSteps = initDurationMillis / initIntervalsMillis;
                let currentStep = 0;
                const interval = setInterval(() => {
                    setAniFn((prev) => {
                        currentStep++;
                        if (currentStep <= totalSteps) {
                            const display = Math.round((maxValue / totalSteps) * currentStep);
                            return Math.min(display, maxValue);
                        } else {
                            clearInterval(interval);
                            return maxValue;
                        }
                    });
                }, initIntervalsMillis);
                intervalsRef.current.push(interval);
            }
        }, 300);

        return () => {
            clearTimeout(delayInterval);
            for (const interval of intervalsRef.current) {
                clearInterval(interval);
            }
            intervalsRef.current = [];
        };
    }, []);

    return (
        <>
            <Box className="max-w-full flex flex-col gap-2 justify-center items-center mt-[-2rem]">
                {
                    numCardsKnown != null && numCardsUnknown != null && <>
                        <Box className="flex justify-center items-center gap-0 bg-[#F8F8FF]
                                w-full py-3 mt-[0.5rem] rounded-3xl relative overflow-visible
                                "
                             sx={{
                                 ...shadowBefore,
                             }}
                        >
                            <Box className="flex-[0_0_50%] flex flex-col items-center justify-center gap-2">
                                <Box className="text-3xl">
                                    Known
                                </Box>
                                <Box className="text-xl">
                                    {aniNumCardsKnown}
                                </Box>
                            </Box>
                            <Box className="flex-1 flex flex-col items-center justify-center gap-2">
                                <Box className="text-3xl">
                                    Unknown
                                </Box>
                                <Box className="text-xl">
                                    {aniNumCardsUnknown}
                                </Box>
                            </Box>
                        </Box>
                    </>
                }
                <Box className="flex justify-between items-center bg-[#F8F8FF]
                                w-full py-2 mt-[0.5rem] rounded-2xl relative overflow-visible"
                     sx={{
                         ...shadowBefore,
                     }}
                >
                    <Box
                        className="text-2xl ml-6"
                    >
                        New cards next
                    </Box>
                    <Box
                        className="text-3xl mr-6"
                    >
                        {aniNumCardsNext}
                    </Box>
                </Box>
                <Box className="flex justify-between items-center bg-[#F8F8FF]
                                w-full py-2 mt-[0.5rem] rounded-2xl relative overflow-visible"
                     sx={{
                         ...shadowBefore,
                     }}
                >
                    <Box
                        className="text-2xl ml-6"
                    >
                        Review cards next
                    </Box>
                    <Box
                        className="text-3xl mr-6"
                    >
                        {aniReviewCardsNext}
                    </Box>
                </Box>

                <Box
                    className="flex flex-col w-full justify-center gap-2 bg-[#F8F8FF] p-6 mt-[0.5rem]
                        rounded-3xl relative overflow-visible
                    "
                    sx={{
                        ...shadowBefore,
                    }}
                >
                    <Box component="h1" className="text-2xl font-bold">
                        Studying progress
                    </Box>
                    <Box component="span"
                         className="text-base font-semibold"
                    >
                        These cards will move across the buckets as you learn them better.
                    </Box>

                    {progressData.map((item, index) => (
                        <ProgressBarItem
                            key={index}
                            label={item.label}
                            value={item.value}
                            max={item.max}
                            number={item.number}
                            color={item.color}
                            bgColor={item.bgColor}
                            durationMillis={initDurationMillis}
                        />
                    ))}
                </Box>
                <Box
                    className="flex flex-col w-full justify-center gap-0 bg-[#F8F8FF] p-6 mt-[0.5rem]
                        rounded-3xl relative overflow-visible
                    "
                    sx={{
                        ...shadowBefore,
                    }}
                    onClick={() => {
                        onNavigateFlippingMode();
                    }}
                >
                    <Box component="h1" className="text-2xl font-bold mt-[-0.25rem]">
                        Practice in flipping mode
                    </Box>
                    <Box component="span"
                         className="text-base font-semibold"
                    >
                        Learn this set with true flashcards.
                    </Box>
                    <Box className="flex justify-center items-center py-2 px-1 mt-3 rounded-3xl bg-[#E0E0FE] w-[100px]">
                        {totalNewCards + totalStillLearningCards + totalAlmostLearnedCards + totalMasteredCards} terms
                    </Box>
                </Box>
            </Box>
        </>
    );
};

const WaitingCount = ({seconds = 0}) => {
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [mins, setMins] = useState(0);
    const [secs, setSecs] = useState(0);

    useEffect(() => {
        // Logic to calculate days, hours, mins, secs from 'seconds'
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        setDays(d);
        setHours(h);
        setMins(m);
        setSecs(s);
    }, [seconds]);

    // Function to format numbers with 2 digits (e.g. 01, 05, 10)
    const formatTime = (time) => {
        return time < 10 ? `0${time}` : time;
    };

    return (
        <Box className="mt-4 bg-gray-50 rounded-3xl py-6 px-4 w-full">
            <Box className="flex justify-center items-center text-center min-h-[100px]">
                {/* Days */}
                <Box className="flex flex-col items-center">
                    <Box className="text-5xl font-bold">{formatTime(days)}</Box>
                    <Box className="text-base mt-1">days</Box>
                </Box>

                {/* Separator */}
                <Box className="text-4xl font-bold mx-2 mt-[-1.6rem]">:</Box>

                {/* Hours */}
                <Box className="flex flex-col items-center">
                    <Box className="text-5xl font-bold">{formatTime(hours)}</Box>
                    <Box className="text-base mt-1">hours</Box>
                </Box>

                {/* Separator */}
                <Box className="text-4xl font-bold mx-2 mt-[-1.6rem]">:</Box>

                {/* Minutes */}
                <Box className="flex flex-col items-center">
                    <Box className="text-5xl font-bold">{formatTime(mins)}</Box>
                    <Box className="text-base mt-1">mins</Box>
                </Box>

                {/* Separator */}
                <Box className="text-4xl font-bold mx-2 mt-[-1.6rem]">:</Box>

                {/* Seconds */}
                <Box className="flex flex-col items-center">
                    <Box className="text-5xl font-bold">{formatTime(secs)}</Box>
                    <Box className="text-base mt-1">secs</Box>
                </Box>
            </Box>
        </Box>
    );
};

const ResultSummary = ({
                           message = "",
                           navigate = () => {
                           },
                           onLearningAgain = () => {
                           },
                           onContinueRound = () => {
                           },
                           onNavigateFlippingMode = () => {
                           },
                           waitingSeconds = 0,
                       }) => {
    const [targetTs, setTargetTs] = useState(0);

    const [currentSeconds, setCurrentSeconds] = useState(waitingSeconds);

    const intervalRef = useRef(null);

    // 2. Mỗi giây countdown dựa trên UTC giờ này so với target
    useEffect(() => {
        if (targetTs === null) return;

        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            const nowUtcMs = dayjs().utc().valueOf();
            const diffMs = targetTs - nowUtcMs;
            const diffSec = Math.max(Math.ceil(diffMs / 1000), 0);
            setCurrentSeconds(diffSec);

            if (diffSec <= 0) {
                clearInterval(intervalRef.current);
            }
        }, 1000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, [targetTs])

    useEffect(() => {
        const nowUtcMs = dayjs().utc().valueOf();
        setTargetTs(nowUtcMs + waitingSeconds * 1000);
    }, [waitingSeconds])

    return (
        <>
            <Box className="flex flex-col w-full max-md:mt-7">
                <Box className="flex items-center min-h-[120px] relative">
                    <svg
                        className="absolute top-3/4"
                        width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M23 0C23 0 22.8909 12.8076 28.0417 17.9583C33.1924 23.1091 46 23 46 23C46 23 33.1924 22.8909 28.0417 28.0417C22.8909 33.1924 23 46 23 46C23 46 23.1091 33.1924 17.9583 28.0417C12.8076 22.8909 0 23 0 23C0 23 12.8076 23.1091 17.9583 17.9583C23.1091 12.8076 23 0 23 0Z"
                            fill="#BABEFD"/>
                    </svg>

                    <svg
                        className="absolute left-[90%] top-0"
                        width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M23 0C23 0 22.8909 12.8076 28.0417 17.9583C33.1924 23.1091 46 23 46 23C46 23 33.1924 22.8909 28.0417 28.0417C22.8909 33.1924 23 46 23 46C23 46 23.1091 33.1924 17.9583 28.0417C12.8076 22.8909 0 23 0 23C0 23 12.8076 23.1091 17.9583 17.9583C23.1091 12.8076 23 0 23 0Z"
                            fill="#BABEFD"/>
                    </svg>

                    <svg
                        className="absolute top-2"
                        width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M15 0C15 0 14.9288 8.35275 18.288 11.712C21.6472 15.0712 30 15 30 15C30 15 21.6472 14.9288 18.288 18.288C14.9288 21.6472 15 30 15 30C15 30 15.0712 21.6472 11.712 18.288C8.35275 14.9288 0 15 0 15C0 15 8.35275 15.0712 11.712 11.712C15.0712 8.35275 15 0 15 0Z"
                            fill="#BABEFD"/>
                    </svg>

                    <svg
                        className="absolute top-3/4 left-[92%]"
                        width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M15 0C15 0 14.9288 8.35275 18.288 11.712C21.6472 15.0712 30 15 30 15C30 15 21.6472 14.9288 18.288 18.288C14.9288 21.6472 15 30 15 30C15 30 15.0712 21.6472 11.712 18.288C8.35275 14.9288 0 15 0 15C0 15 8.35275 15.0712 11.712 11.712C15.0712 8.35275 15 0 15 0Z"
                            fill="#BABEFD"/>
                    </svg>
                    <Box
                        sx={{
                            width: "100%",
                            height: 20,
                            borderRadius: 20,
                            background:
                                "linear-gradient(to right, #ffacac 25%, #ffd6a5 25%, #ffd6a5 50%, #b1ffb1 50%, #b1ffb1 75%, #b8c0ff 75%)",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                            zIndex: 1,
                        }}
                    />
                </Box>
                <Typography variant="h2"
                            className="!self-start !mt-6 !text-3xl !font-extrabold !leading-10 !text-zinc-950">
                    {message}
                </Typography>
                <Typography variant="h5"
                            className="!self-start !mt-2 !leading-4 !text-zinc-950">
                    With Spaced-repetition, you will see your next round of flashcards after some time.
                </Typography>
                {
                    currentSeconds > 0 && <>
                        <WaitingCount
                            seconds={currentSeconds}
                        />
                    </>
                }
                <Box
                    component="button"
                    disabled={currentSeconds > 0}
                    className={`
                        w-full text-xl font-bold p-2 mt-6 rounded-3xl text-center transition-all duration-200 ease-in-out
                    
                        ${currentSeconds > 0
                        ? `
                            bg-gray-300 text-gray-400 cursor-not-allowed
                            !border-0 border-solid border-b-gray-400
                            !border-b-8
                            shadow-[0_4px_6px_rgba(156,163,175,0.5)]
                          `
                        : `
                            bg-blue-700 text-white
                            !border-0 border-solid border-b-blue-800
                            !border-b-8
                            shadow-[0_4px_6px_rgba(37,99,235,0.3)]
                            hover:bg-blue-600 hover:scale-[1.02] hover:shadow-[0_8px_16px_rgba(37,99,235,0.5)]
                            active:bg-blue-800 active:scale-[0.98] active:shadow-[inset_0_2px_4px_rgba(37,99,235,0.7)]
                          `
                    }
                      `}
                    onClick={() => {
                        if (currentSeconds <= 0) {
                            onContinueRound();
                        }
                    }}
                >
                    {currentSeconds > 0
                        ? "It's not time to learn yet!"
                        : "Continue to next round"
                    }
                </Box>
                {
                    currentSeconds > 0 && <>
                        <Box
                            className="flex flex-col items-center justify-center w-full"
                        >
                            <Box className="mt-3 text-base text-[#B6B7BF]">
                                Want to learn sooner ?
                            </Box>
                            <Box
                                component="button"
                                className={`
                                    w-full text-xl font-bold p-2 mt-3 rounded-3xl
                                    text-[#0E22E9] bg-[#FAF9FC]
                                                                    
                                    !border-2 border-solid border-[#0E22E9]
                                                                        
                                    !border-b-8
                                
                                    transition-transform transition-colors duration-200 ease-in-out
                                
                                    hover:bg-[#F4F2FF] hover:scale-[1.02]
                                    active:bg-[#EAE8FF] active:scale-[0.98] active:border-b-8
                                  `}
                                onClick={() => {
                                    onNavigateFlippingMode();
                                }}
                            >
                                Go to Flipping mode
                            </Box>
                        </Box>
                    </>
                }
            </Box>
        </>
    );
};

const SpaceRepetitionWaiting = ({
                                    nextNewCards = 0,
                                    nextReviewCards = 0,
                                    cardsKnown = 0,
                                    cardsUnknown = 0,
                                    waitingSeconds = 0,
                                    allNumNewCards = 0,
                                    allNumLearningCards = 0,
                                    allNumAlmostDoneCards = 0,
                                    allNumMasteredCards = 0,
                                    onLearningAgain = () => {
                                    },
                                    onContinueRound = () => {
                                    },
                                    onNavigateFlippingMode = () => {
                                    },
                                }) => {
    const [theme, colorMode] = useMode();

    return (
        <>
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <Box
                        className="w-full h-full overflow-none"
                    >
                        <Container className="pt-[6.5rem] !px-[3rem] self-center">
                            <Grid2
                                container
                                spacing={5}
                                direction="row"
                            >
                                <Grid2 item size={{xs: 12, md: 6}} className="!pl-0 max-md:!ml-0 md:!pl-[5rem]">
                                    <ResultSummary
                                        waitingSeconds={waitingSeconds}
                                        message="Let’s try again, you can do better than you did!"
                                        onLearningAgain={onLearningAgain}
                                        onContinueRound={onContinueRound}
                                        onNavigateFlippingMode={onNavigateFlippingMode}
                                    />
                                </Grid2>
                                <Grid2 item size={{xs: 12, md: 6}} className="!pr-0 max-md:!ml-0 md:!pr-[5rem]">
                                    <Box className="grow pb-36 mt-4 max-md:pb-24 max-md:mt-10">
                                        <ResultDetail
                                            numCardsKnown={cardsKnown}
                                            numCardsUnknown={cardsUnknown}
                                            numCardsNext={nextNewCards}
                                            reviewCardsNext={nextReviewCards}
                                            totalNewCards={allNumNewCards}
                                            totalStillLearningCards={allNumLearningCards}
                                            totalAlmostLearnedCards={allNumAlmostDoneCards}
                                            totalMasteredCards={allNumMasteredCards}
                                            onNavigateFlippingMode={onNavigateFlippingMode}
                                        />
                                    </Box>
                                </Grid2>
                            </Grid2>
                        </Container>
                    </Box>
                </ThemeProvider>
            </ColorModeContext.Provider>
        </>
    );
};

export default SpaceRepetitionWaiting;