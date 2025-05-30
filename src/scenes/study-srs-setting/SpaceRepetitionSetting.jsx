import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {
    Box,
    Button,
    Checkbox, CssBaseline,
    FormControlLabel,
    InputLabel,
    ListItem,
    Paper,
    TextField, ThemeProvider,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import api from "src/apis/api.js";
import {toast} from "react-toastify";
import {CircleHelp} from "lucide-react";
import Stack from "@mui/material/Stack";
import {convertDateTimeToSeconds, convertSecondsToDateTime} from "src/utils/timeLanguageUtils.js";
import List from "@mui/material/List";
import * as settingService from "src/services/SrsSettingService.js";
import {ColorModeContext, themeSettings, useMode} from "src/theme.js";
import {useSetCardPassword} from "src/context/SetPasswordContext.jsx";
import PasswordChecking from "src/components/password-checking/PasswordChecking.jsx";

const SpaceRepetitionSetting = () => {
    const {id} = useParams();
    const theme = useTheme();

    const colors = themeSettings(theme.palette.mode);

    const {modalConfirmOpen, setModalConfirmOpen} = useSetCardPassword();

    const navigate = useNavigate();
    const backOnceRef = useRef(false);

    const [password, setPassword] = useState("");
    const [expiredAt, setExpiredAt] = useState(0);

    const isMobile = useMediaQuery('(max-width:768px)');
    const isCustomWidth = useMediaQuery('(max-width: 1500px)');

    const CONSTANTS = {
        MIN_SECONDS_INTERVAL_BUTTON: 60,
        SECONDS_IN_MINUTE: 60,
        SECONDS_IN_HOUR: 3600,
        SECONDS_IN_DAY: 86400,
        MAX_NEW_CARDS_PER_DAY: 256,
        MAX_CARDS_PER_ROUND: 256,
        MIN_INTERVAL_GAP_SECONDS: 20,
        MAX_DAYS: 2999,
        MAX_HOURS: 23,
        MAX_MINUTES_SECONDS: 59,
        MAX_SKIP_INTERVAL_MINUTES: 20,
        MAX_MIN_INTERVAL_GAPS: 10000,
        MIN_RATIO_CARDS: 5,
        MAX_RATIO_CARDS: 95,
    };

    // Define the INITIAL preset time values for each button
    // Đây là giá trị khởi tạo hoặc giá trị mặc định khi nhấn nút
    const initialButtonTimePresets = {
        Again: {days: 0, hours: 0, minutes: 1, seconds: 0},
        Hard: {days: 0, hours: 0, minutes: 5, seconds: 0},
        Good: {days: 0, hours: 0, minutes: 10, seconds: 0},
        Easy: {days: 1, hours: 0, minutes: 0, seconds: 0},
    };

    // Input configurations (giữ nguyên)
    const timeInputsConfig = [
        // Thêm thuộc tính max cho từng đơn vị thời gian
        {name: 'days', singular: 'Day', plural: 'Days', max: CONSTANTS.MAX_DAYS},
        {name: 'hours', singular: 'Hour', plural: 'Hours', max: CONSTANTS.MAX_HOURS},
        {name: 'minutes', singular: 'Minute', plural: 'Minutes', max: CONSTANTS.MAX_MINUTES_SECONDS},
        {name: 'seconds', singular: 'Second', plural: 'Seconds', max: CONSTANTS.MAX_MINUTES_SECONDS},
    ];

    const minIntervalsGapConfig = [
        {name: 'minutes', singular: 'Minute', plural: 'Minutes', max: CONSTANTS.MAX_MIN_INTERVAL_GAPS}, // Tối đa 59 phút
        {name: 'seconds', singular: 'Second', plural: 'Seconds', max: CONSTANTS.MAX_MINUTES_SECONDS}, // Tối đa 59 giây
    ];

    const skipInputsConfig = [
        {name: 'minutes', singular: 'Minute', plural: 'Minutes', max: CONSTANTS.MAX_SKIP_INTERVAL_MINUTES}, // Tối đa 59 phút
        {name: 'seconds', singular: 'Second', plural: 'Seconds', max: CONSTANTS.MAX_MINUTES_SECONDS}, // Tối đa 59 giây
    ];

    const buttonsConfig = [
        {name: 'Again', activeColor: '!bg-[#F5B2B2] !border-red-300 !text-[#E73D3D]', color: '!bg-gray-400 hover:!bg-gray-600', textColor: 'text-white'},
        {name: 'Hard', activeColor: '!bg-[#FFDFB1] !border-yellow-300 !text-[#FF9500]', color: '!bg-gray-400 hover:!bg-gray-600', textColor: 'text-white'},
        {name: 'Good', activeColor: '!bg-[#B8FFBE] !border-green-300 !text-[#00C310]', color: '!bg-gray-400 hover:!bg-gray-600', textColor: 'text-white'},
        {name: 'Easy', activeColor: '!bg-[#BABEFD] !border-blue-300 !text-[#0E22E9]', color: '!bg-gray-400 hover:!bg-gray-600', textColor: 'text-white'},
    ];

    const getTimeLabel = (value, singular, plural) => {
        const numValue = parseInt(value) || 0;
        return numValue === 1 ? singular : plural;
    };

    const [buttonTimes, setButtonTimes] = useState(initialButtonTimePresets);

    const [minIntervalGaps, setMinIntervalGaps] = useState({
        minutes: 0,
        seconds: CONSTANTS.MIN_INTERVAL_GAP_SECONDS,
    });

    const [skipIntervalData, setSkipIntervalData] = useState({
        minutes: 0,
        seconds: 0,
    });

    const [activeButton, setActiveButton] = useState("Again");

    const [displayTimeValues, setDisplayTimeValues] = useState({
        days: 0, hours: 0, minutes: 0, seconds: 0
    });

    useEffect(() => {
        if (activeButton && buttonTimes[activeButton]) {
            setDisplayTimeValues(buttonTimes[activeButton]);
        } else {
            setDisplayTimeValues({days: 0, hours: 0, minutes: 0, seconds: 0});
        }
    }, [activeButton, buttonTimes]);

    const handleButtonClick = (buttonName) => {
        setActiveButton(buttonName);
    };

    const returnValidValue = (value, name, inputConfigs) => {
        const inputConfig = inputConfigs.find(input => input.name === name);
        const maxValue = inputConfig ? inputConfig.max : Infinity;

        let intValue = Math.max(0, parseInt(value) || 0);

        if (intValue > maxValue) {
            intValue = maxValue;
        }

        return intValue;
    }

    const handleInputChange = (event) => {
        const {name, value} = event.target;

        const intValue = parseInt(value) || 0;

        const newDisplayValues = {
            ...displayTimeValues,
            [name]: intValue,
        };

        const newMinutes = newDisplayValues.days === 0
        && newDisplayValues.hours === 0
        && newDisplayValues.minutes === 0
        && newDisplayValues.seconds < CONSTANTS.MIN_SECONDS_INTERVAL_BUTTON ? 1 : newDisplayValues.minutes;
        const newSeconds = newDisplayValues.days === 0
        && newDisplayValues.hours === 0
        && newDisplayValues.minutes === 0
        && newDisplayValues.seconds < CONSTANTS.MIN_SECONDS_INTERVAL_BUTTON ? 0 : newDisplayValues.seconds;

        const lastDisplayValues = {
            ...newDisplayValues,
            minutes: newMinutes,
            seconds: newSeconds,
        };

        setDisplayTimeValues(newDisplayValues);

        if (activeButton) {
            setButtonTimes(prevButtonTimes => ({
                ...prevButtonTimes,
                [activeButton]: newDisplayValues,
            }));
            // console.log(`Updated time for ${activeButton}:`, {...buttonTimes[activeButton], [name]: intValue});
        } else {
            console.warn("Input changed while no button is active. Change only affects display until a button is selected.");
        }
        // const returnButton = fixEachIntervalButton({
        //     ...buttonTimes,
        //     [activeButton]: lastDisplayValues,
        // }, minIntervalGaps);
        // setButtonTimes(returnButton);
        // setDisplayTimeValues(returnButton[activeButton]);
    };

    const handleBlurInput = (event) => {
        const returnButton = fixEachIntervalButton(buttonTimes, minIntervalGaps);
        setButtonTimes(returnButton);
        setDisplayTimeValues(returnButton[activeButton]);
    }

    const handleSkipIntervalInputChange = (event) => {
        const {name, value} = event.target;

        const intValue = returnValidValue(value, name, skipInputsConfig);

        const maxValMins = skipInputsConfig.find(input => input.name === 'minutes').max || Infinity;

        if (name === 'minutes' && intValue === maxValMins) {
            setSkipIntervalData((prevData) => ({
                ...prevData,
                seconds: 0,
            }));
        }

        setSkipIntervalData((prevData) => ({
            ...prevData,
            [name]: intValue,
        }));
    };

    const handleMinIntervalsGapInputChange = (event) => {
        const {name, value} = event.target;

        const intValue = returnValidValue(value, name, minIntervalsGapConfig);

        const maxValMins = minIntervalsGapConfig.find(input => input.name === 'minutes').max || Infinity;

        let result = {
            minutes: 0,
            seconds: 0,
        };

        if (name === 'minutes') {
            if (intValue === maxValMins) {
                result = {
                    seconds: 0,
                    minutes: maxValMins,
                };
            } else if (intValue === 0) {
                result = {
                    minutes: 0,
                    seconds: Math.max(CONSTANTS.MIN_INTERVAL_GAP_SECONDS, minIntervalGaps.seconds),
                }
            } else {
                result = {
                    minutes: intValue,
                    seconds: minIntervalGaps.seconds,
                };
            }
        } else if (name === 'seconds') {
            if (minIntervalGaps['minutes'] === 0) {
                result = {
                    seconds: Math.max(CONSTANTS.MIN_INTERVAL_GAP_SECONDS, intValue),
                    minutes: 0,
                };
            } else if (minIntervalGaps['minutes'] === maxValMins) {
                result = {
                    seconds: 0,
                    minutes: maxValMins,
                }
            } else {
                result = {
                    seconds: intValue,
                    minutes: minIntervalGaps.minutes,
                };
            }
        }
        const resultButton = fixEachIntervalButton(buttonTimes, result);
        setButtonTimes(resultButton);
        setMinIntervalGaps(result);
    };

    const fixEachIntervalButton = (buttonTimes, minIntervalGaps) => {
        const rankingButton = ['Again', 'Hard', 'Good', 'Easy'];
        let buttonTimesClone = {...buttonTimes};
        const minIntervalGapSeconds = convertDateTimeToSeconds(minIntervalGaps);

        const maxLimitsSeconds = convertDateTimeToSeconds({
            days: CONSTANTS.MAX_DAYS,
            hours: CONSTANTS.MAX_HOURS,
            minutes: CONSTANTS.MAX_MINUTES_SECONDS,
            seconds: CONSTANTS.MAX_MINUTES_SECONDS,
        });

        const minSeconds = 60;

        for (let i = 0; i < rankingButton.length - 1; i++) {
            const currentButton = rankingButton[i];
            const nextButton = rankingButton[i + 1];

            const currentButtonTime = buttonTimesClone[currentButton];
            const nextButtonTime = buttonTimesClone[nextButton];

            const rawCurBtnSecs = convertDateTimeToSeconds(currentButtonTime);
            let curBtnSecs = Math.max(rawCurBtnSecs, minSeconds);
            const rawNextBtnSecs = convertDateTimeToSeconds(nextButtonTime);

            let nextBtnSecs = Math.max(curBtnSecs + minIntervalGapSeconds,
                rawNextBtnSecs);

            let curBtnSecsDateTime = convertSecondsToDateTime(curBtnSecs);
            let nextBtnSecsDateTime = convertSecondsToDateTime(nextBtnSecs);

            buttonTimesClone[currentButton] = {
                days: curBtnSecsDateTime.days,
                hours: curBtnSecsDateTime.hours,
                minutes: curBtnSecsDateTime.minutes,
                seconds: curBtnSecsDateTime.seconds,
            };

            buttonTimesClone[nextButton] = {
                days: nextBtnSecsDateTime.days,
                hours: nextBtnSecsDateTime.hours,
                minutes: nextBtnSecsDateTime.minutes,
                seconds: nextBtnSecsDateTime.seconds,
            };
        }

        if (
            convertDateTimeToSeconds(buttonTimesClone.Easy) >= maxLimitsSeconds
        ) {
            buttonTimesClone['Easy'] = {
                days: CONSTANTS.MAX_DAYS,
                hours: CONSTANTS.MAX_HOURS,
                minutes: CONSTANTS.MAX_MINUTES_SECONDS,
                seconds: CONSTANTS.MAX_MINUTES_SECONDS,
            };

            for (let i = rankingButton.length - 2; i >= 0; i--) {
                const currentButton = rankingButton[i];
                const nextButton = rankingButton[i + 1];

                const nextButtonTime = buttonTimesClone[nextButton];

                const rawNextBtnSecs = convertDateTimeToSeconds(nextButtonTime);

                let nextBtnSecs = Math.max(rawNextBtnSecs - minIntervalGapSeconds,
                    minSeconds);

                let nextBtnSecsDateTime = convertSecondsToDateTime(nextBtnSecs);

                buttonTimesClone[currentButton] = {
                    days: nextBtnSecsDateTime.days,
                    hours: nextBtnSecsDateTime.hours,
                    minutes: nextBtnSecsDateTime.minutes,
                    seconds: nextBtnSecsDateTime.seconds,
                };
            }
        }

        return buttonTimesClone;
    };

    const handleSetButtonTimes = (name, intervals) => {
        setButtonTimes((prev) => ({
            ...prev,
            [name]: intervals
        }));
    };

    const [hoverTooltip, setHoverTooltip] = useState({
        numberCardsPerDay: false,
        cardsPerRound: false,
        intervalHeader: false,
        intervalAgain: false,
        intervalHard: false,
        intervalGood: false,
        intervalEasy: false,
        minIntervalGap: false,
        skipInterval: false,
        ratioCardsPerDay: false,
        ratioDueDateCards: false,
    });

    const changeStateHoverTooltip = (key, value) => {
        setHoverTooltip((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    }

    const [titleSet, setTitleSet] = useState("");
    const [maxCards, setMaxCards] = useState(0);
    const [maxNewCardsPerDay, setMaxNewCardsPerDay] = useState(CONSTANTS.MAX_NEW_CARDS_PER_DAY);
    const [cardsPerRound, setCardsPerRound] = useState(CONSTANTS.MAX_CARDS_PER_ROUND);
    const [maxCardsPerRound, setMaxCardsPerRound] = useState(CONSTANTS.MAX_CARDS_PER_ROUND);
    const [numberNewCardsPerDay, setNumberNewCardsPerDay] = useState(1);
    const [autoSelectCards, setAutoSelectCards] = useState(false);

    const [ratioCards, setRatioCards] = useState({
        newCards: 50,
        dueDateCards: 50,
    });

    const handleCardsPerRoundChange = (event) => {
        setCardsPerRound(Math.max(1, Math.min(event.target.value, maxCardsPerRound)));
    };

    const handleNumberOfNewCardsPerDayChange = (event) => {
        setNumberNewCardsPerDay(Math.max(1, Math.min(event.target.value, maxNewCardsPerDay)));
    };


    const handleRatioChange = (name, value) => {
        setRatioCards((prevRatio) => ({
            ...prevRatio,
            [name]: value,
        }));
    };

    const fixedRatioCards = (name) => {
        if (name === 'newCards') {
            const intValue = Math.max(CONSTANTS.MIN_RATIO_CARDS, Math.min(CONSTANTS.MAX_RATIO_CARDS,
                ratioCards.newCards));
            setRatioCards((prevRatio) => ({
                ...prevRatio,
                newCards: intValue,
                dueDateCards: 100 - intValue,
            }));
        } else if (name === 'dueDateCards') {
            const intValue = Math.max(CONSTANTS.MIN_RATIO_CARDS, Math.min(CONSTANTS.MAX_RATIO_CARDS,
                ratioCards.dueDateCards));
            setRatioCards((prevRatio) => ({
                ...prevRatio,
                dueDateCards: intValue,
                newCards: 100 - intValue,
            }));
        }
    };

    const handleAssignSetProgressSetting = (data, estimateData) => {
        console.log("Insight handleAssignSetting, data: ", data);
        setNumberNewCardsPerDay(Math.min(data.newCardsPerDay, estimateData.estimateNumberNewCardsPerDay));
        setCardsPerRound(Math.min(data.cardsPerRound, estimateData.estimateCardsPerRound));
        setRatioCards((prevState) => ({
            ...prevState,
            newCards: data.newCardsRatio,
            dueDateCards: data.dueCardsRatio,
        }));
        setAutoSelectCards(data.isAutomaticSelectCard);

        let skipIntervals = convertSecondsToDateTime(data.intervalSecondsCanSkip, true, true);
        let minIntervalsGap = convertSecondsToDateTime(data.minIntervalGap, true, true);
        let againButtonIntervals = convertSecondsToDateTime(data.customIntervalAgainSeconds);
        let hardButtonIntervals = convertSecondsToDateTime(data.customIntervalHardSeconds);
        let goodButtonIntervals = convertSecondsToDateTime(data.customIntervalGoodSeconds);
        let easyButtonIntervals = convertSecondsToDateTime(data.customIntervalEasySeconds);

        setSkipIntervalData({
            minutes: skipIntervals.minutes,
            seconds: skipIntervals.seconds,
        });

        setMinIntervalGaps({
            minutes: minIntervalsGap.minutes,
            seconds: minIntervalsGap.seconds,
        });

        handleSetButtonTimes("Again", againButtonIntervals);
        handleSetButtonTimes("Hard", hardButtonIntervals);
        handleSetButtonTimes("Good", goodButtonIntervals);
        handleSetButtonTimes("Easy", easyButtonIntervals);
    };

    const fetchEffectiveSetting = async (id, estimateData) => {
        try {
            const resEffectSetting = await api.get(`/v1/setting-progress/get-effective-setting?setId=${id}`, {
                headers: {
                    "X-Set-Password": password,
                    "X-Set-Password-Valid-At": expiredAt,
                }
            });
            handleAssignSetProgressSetting(resEffectSetting.data, estimateData);
        } catch (e) {
            if (e && e.response && e.response.status === 403) {
                if (e.response.data && e.response.data.detail) {
                    const jsonData = JSON.parse(e.response.data.detail);
                    const {type} = jsonData;
                    if (type === "Password") {
                        setModalConfirmOpen(true);
                    }
                } else {
                    toast.error("Error forbidden: " + e.response.data);
                    if (!backOnceRef.current) {
                        backOnceRef.current = true;
                        navigate(-1);
                    }
                }
            } else {
                console.error(e);
            }
        }
    };

    const fetchSetting = async (id, estimateData) => {
        try {
            const resSetting = await api.get(`/v1/setting-progress/get-setting?setId=${id}`, {
                headers: {
                    "X-Set-Password": password,
                    "X-Set-Password-Valid-At": expiredAt,
                }
            });
            handleAssignSetProgressSetting(resSetting.data, estimateData);
        } catch (e) {
            // toast.error(`Cannot find setting of set id ${id}`);
            if (e && e.response && e.response.status === 403) {
                if (e.response.data && e.response.data.detail) {
                    const jsonData = JSON.parse(e.response.data.detail);
                    const {type} = jsonData;
                    if (type === "Password") {
                        setModalConfirmOpen(true);
                    }
                } else {
                    toast.error("Error forbidden: " + e.response.data);
                    if (!backOnceRef.current) {
                        backOnceRef.current = true;
                        navigate(-1);
                    }
                }
            }
            if (e.response && e.response.status === 404) {
                await fetchEffectiveSetting(id, estimateData);
            }
        }
    };

    const fetchSetInformation = async (id) => {
        try {
            const resSetData = await api.get(`/v1/set/set-detail/${id}`);
            setMaxCards(resSetData.data.data.totalCard);
            setTitleSet(resSetData.data.data.title);
            setMaxNewCardsPerDay(Math.min(resSetData.data.data.totalCard, CONSTANTS.MAX_NEW_CARDS_PER_DAY));
            setMaxCardsPerRound(Math.min(resSetData.data.data.totalCard, CONSTANTS.MAX_CARDS_PER_ROUND));
            setNumberNewCardsPerDay(Math.min(resSetData.data.data.totalCard, CONSTANTS.MAX_NEW_CARDS_PER_DAY));
            setCardsPerRound(Math.min(resSetData.data.data.totalCard, CONSTANTS.MAX_CARDS_PER_ROUND));
            return {
                maxNewCardsPerDay: Math.min(resSetData.data.data.totalCard, CONSTANTS.MAX_NEW_CARDS_PER_DAY),
                maxCardsPerRound: Math.min(resSetData.data.data.totalCard, CONSTANTS.MAX_NEW_CARDS_PER_DAY),
                estimateNumberNewCardsPerDay: Math.min(resSetData.data.data.totalCard, CONSTANTS.MAX_NEW_CARDS_PER_DAY),
                estimateCardsPerRound: Math.min(resSetData.data.data.totalCard, CONSTANTS.MAX_NEW_CARDS_PER_DAY),
            };
        } catch (err) {
            console.error(err);
            toast.error(`Error in set id: ${id}`);
            throw Error("Error while fetching set");
        }
    };

    const initData = () => {
        fetchSetInformation(id).then(data => {
            fetchSetting(id, data).catch();
        }).catch();
    };

    useEffect(() => {
        initData();
    }, []);


    const handleSubmitSetting = async () => {
        try {
            const newCardsPerDay = Math.min(numberNewCardsPerDay, maxNewCardsPerDay);
            const cardsPerRoundValue = Math.min(cardsPerRound, CONSTANTS.MAX_CARDS_PER_ROUND);

            const data = {
                setId: id,
                newCardsPerDay: newCardsPerDay,
                cardsPerRound: cardsPerRoundValue,
                isAutomaticSelectCard: autoSelectCards,
                newCardsRatio: ratioCards.newCards,
                dueCardsRatio: ratioCards.dueDateCards,
                customIntervalAgainSeconds: convertDateTimeToSeconds(buttonTimes.Again),
                customIntervalHardSeconds: convertDateTimeToSeconds(buttonTimes.Hard),
                customIntervalGoodSeconds: convertDateTimeToSeconds(buttonTimes.Good),
                customIntervalEasySeconds: convertDateTimeToSeconds(buttonTimes.Easy),
                minIntervalGap: convertDateTimeToSeconds(minIntervalGaps),
                intervalSecondsCanSkip: convertDateTimeToSeconds(skipIntervalData),
            };

            await api.post("/v1/setting-progress/save-setting", data);
            toast.success("Setting set progress successfully");
            countdownToGoToSRS(5);
            // navigate(`/study-srs/${id}`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to send setting set progress");
        }
    };

    const [intervalCountdown, setIntervalCountdown] = useState(null);

    const countdownToGoToSRS = (seconds) => {
        setIntervalCountdown(seconds);

        const id = setInterval(() => {
            setIntervalCountdown(prev => {
                if (!prev || prev <= 1) {
                    clearInterval(id);
                    navigateToSrsReview();
                    return 0;      // reset về null nếu bạn muốn hiện lại nút Go
                }
                return prev - 1;
            });
        }, 1000);
    };

    const navigateToSrsReview = () => {
        navigate(`/user/space-repetition/${id}`);
    };

    const handleResetSrsProgress = async () => {
        try {
            await settingService.resetSrsProgresses(id);
            toast.success("Reset SRS progress successfully");
        } catch (err) {
            throw err;
        }
    };

    const onResetSrsProgress = () => {
        // NOTHING TODO
    };

    if (modalConfirmOpen) {
        return (
            <ColorModeContext.Provider value={colors}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <PasswordChecking
                        setId={id}
                        changePassword={setPassword}
                        changeExpiredAt={setExpiredAt}
                        onClose={(setId, validating, password, expiredAt) => {
                            if (validating) {
                                initData();
                            } else {
                                if (!backOnceRef.current) {
                                    backOnceRef.current = true;
                                    navigate(-1);
                                }
                            }
                        }}
                    />
                </ThemeProvider>
            </ColorModeContext.Provider>
        );
    }

    return (
        <>
            {/* Thay thế sử dụng styles.module.scss bằng các lớp Tailwind */}
                <Box
                    className="flex flex-col gap-[15px] relative mx-5 p-8 sm:mx-[50px] sm:p-20 lg:mx-[150px] xl:mx-[250px]"
                    sx={{
                        paddingTop: '2.2rem !important',
                    }}
                >
                    <Box
                        className="flex flex-col md:flex-row justify-between items-center mb-3"
                    >
                        <h3
                            style={{
                                flex: isMobile ? '1' : '0 0 60%',
                                wordWrap: 'break-word',
                            }}
                        >
                            <b>Setup SRS Learning for Set: <i>{titleSet}</i></b>
                        </h3>

                        {
                            intervalCountdown !== null && (
                                <>
                                <span className="text-[1.8rem] max-w-[60px] text-right flex-1 pr-4">
                                    {intervalCountdown > 0 ? intervalCountdown : ""}
                                </span>
                                </>
                            )
                        }
                        {
                            intervalCountdown === null && (
                                <Button
                                    className="!rounded-3xl !bg-blue-500 hover:!bg-blue-600 text-white font-bold py-2 px-4"
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '1.2rem',
                                        maxWidth: {xs: '240px', md: '120px'},
                                        flex: "1",
                                    }}
                                    onClick={handleSubmitSetting}
                                >
                                    Go
                                </Button>
                            )
                        }
                    </Box>

                    <Typography variant="h4" className="text-gray-700 mt-2 !text-[1.4rem] w-100 text-center">
                        <b>
                            Setup number cards
                        </b>
                    </Typography>

                    <Box className="flex flex-col md:flex-row gap-4 w-full"> {/* Changed gap-5 to gap-4 (1rem) */}
                        <Box className="w-full p-4 rounded-lg shadow">
                            {/* Label */}
                            <div className="flex items-center mb-4">
                                <p className="text-base text-gray-700 mb-0"> {/* Added margin-bottom */}
                                    Number of cards per day (MAX: {maxNewCardsPerDay} cards):
                                </p>
                                <div
                                    className="relative flex items-center ml-2"
                                    onMouseEnter={() => changeStateHoverTooltip('numberCardsPerDay', true)}
                                    onMouseLeave={() => changeStateHoverTooltip('numberCardsPerDay', false)}
                                >
                                    <CircleHelp className="w-4 h-4 text-gray-500 cursor-help"/>

                                    {/* Tooltip Text */}
                                    <div
                                        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 px-3 py-2 
                                          bg-gray-800 text-white text-md rounded-md shadow-lg z-10 pointer-events-none
                                          transition-opacity duration-300 ${hoverTooltip.numberCardsPerDay ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        This is the maximum number of new cards you want to learn each day.
                                    </div>
                                </div>
                            </div>
                            {/* Input field */}
                            <input
                                type="number"
                                // Inline styles for padding
                                style={{
                                    padding: "0.75rem 1rem",
                                }}
                                // Tailwind classes for styling - kept existing styles
                                className="border-2 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10 w-full font-medium text-sm rounded-lg outline-none"
                                value={numberNewCardsPerDay}
                                onChange={handleNumberOfNewCardsPerDayChange}
                                placeholder="Max number of cards per day"
                                // Set max based on totalQuestion if it's a number
                                max={maxNewCardsPerDay}
                                min={1} // Cannot have negative score
                            />
                        </Box>

                        <Box className="w-full p-4 rounded-lg shadow">
                            {/* Label */}
                            <div className="flex items-center mb-4">
                                <p className="text-base text-gray-700 mb-0"> {/* Added margin-bottom */}
                                    Card per round (MAX: {maxCardsPerRound} cards):
                                </p>
                                <div
                                    className="relative flex items-center ml-2"
                                    onMouseEnter={() => changeStateHoverTooltip('cardsPerRound', true)}
                                    onMouseLeave={() => changeStateHoverTooltip('cardsPerRound', false)}
                                >
                                    <CircleHelp className="w-4 h-4 text-gray-500 cursor-help"/>

                                    {/* Tooltip Text */}
                                    <div
                                        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 px-3 py-2 
                                          bg-gray-800 text-white text-md rounded-md shadow-lg z-10 pointer-events-none
                                          transition-opacity duration-300 ${hoverTooltip.cardsPerRound ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        Due to system constraints, each round is capped at 256 cards.
                                        <br/>
                                        This setting, combined with your pending due cards and the new:due ratio below,
                                        determines your final daily counts of new and review cards.
                                    </div>
                                </div>
                            </div>
                            {/* Input field */}
                            <input
                                type="number"
                                // Inline styles for padding
                                style={{
                                    padding: "0.75rem 1rem",
                                }}
                                // Tailwind classes for styling - kept existing styles
                                className="border-2 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10 w-full font-medium text-sm rounded-lg outline-none"
                                value={cardsPerRound}
                                onChange={handleCardsPerRoundChange}
                                placeholder="Max cards per round"
                                max={CONSTANTS.MAX_CARDS_PER_ROUND}
                                min={1} // Cannot have negative score
                            />
                        </Box>
                    </Box>

                    <div className="flex items-center mb-2 w-100 mt-4 justify-center">
                        <Typography variant="h4" className="text-gray-700 m-0 !text-[1.4rem] text-center">
                            <b>
                                Setup intervals each buttons
                            </b>
                        </Typography>
                        <div
                            className="relative flex items-center ml-2"
                            onMouseEnter={() => changeStateHoverTooltip('intervalHeader', true)}
                            onMouseLeave={() => changeStateHoverTooltip('intervalHeader', false)}
                        >
                            <CircleHelp className="w-4 h-4 text-gray-500 cursor-help"/>

                            {/* Tooltip Text */}
                            <div
                                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 px-3 py-2 
                                          bg-gray-800 text-white text-md rounded-md shadow-lg z-10 pointer-events-none
                                          transition-opacity duration-300 ${hoverTooltip.intervalHeader ? 'opacity-100' : 'opacity-0'}`}
                            >
                                Changing the time intervals allows you to modify how soon you see a card each time you
                                select that button. We recommend sticking to our suggested intervals if you’re a
                                beginner. If you do choose to customize the intervals, we recommend going in ascending
                                order with “Again” having the shortest interval and “Easy” having the longest.
                            </div>
                        </div>
                    </div>

                    <Paper
                        elevation={3} // Controls the shadow depth
                        className="flex
                    flex-col items-center gap-8 p-8 rounded-2xl
                     w-full mx-auto !bg-inherit shadow"
                    >
                        <Stack
                            direction={{xs: 'column', sm: 'row'}}
                            spacing={{xs: 2, md: -10 + (!isCustomWidth ? -15 : 15)}}
                            justifyContent={{sm: 'center', md: (!isCustomWidth ? 'space-around' : 'center')}}
                            className="w-full"
                        >
                            {buttonsConfig.map((button) => (
                                <Button
                                    key={button.name}
                                    sx={{
                                        textTransform: "none",
                                        minWidth: {xs: '50px', sm: '100px', md: '110px', lg: '160px'},
                                    }}
                                    variant="contained"
                                    onClick={() => handleButtonClick(button.name)}
                                    className={`                                                                      
                                    font-bold py-2 px-5 rounded-full
                                    !text-xl
                                    transition-transform duration-300 ease-out
                                    hover:-translate-y-1 hover:shadow-lg                
                                    ${activeButton === button.name ?
                                        'translate-y-px shadow-inner ring-2 ring-offset-2' +
                                        ` ring-indigo-500 ${button.activeColor} !font-[750] !border-8 !border-solid px-6 py-8` +
                                        ' !text-3xl'
                                        : ` ${button.color} ${button.textColor}`}
                                  `}
                                    disableElevation
                                >
                                    {/*{button.name + ` (Name: ${button.name}, Active button: ${activeButton})`}*/}
                                    {button.name}
                                </Button>
                            ))}
                        </Stack>

                        <Stack
                            direction={{xs: 'column', sm: 'row'}}
                            spacing={{xs: 4, sm: 3}}
                            justifyContent="center"
                            alignItems="center"
                            className="w-full"
                        >
                            {timeInputsConfig.map((input) => (
                                <Box
                                    key={input.name}
                                    className="flex flex-col items-center min-w-[100px] w-4/5 sm:w-auto max-w-[250px] sm:max-w-none"
                                >
                                    <InputLabel
                                        htmlFor={`${input.name}-input`}
                                        className="mb-2 font-bold !text-[0.9rem]"
                                    >
                                        {/* Label now uses displayTimeValues */}
                                        {getTimeLabel(displayTimeValues[input.name], input.singular, input.plural)}
                                    </InputLabel>
                                    <TextField
                                        id={`${input.name}-input`}
                                        name={input.name}
                                        type="number"
                                        // Value now comes from displayTimeValues state
                                        value={displayTimeValues[input.name]}
                                        onChange={handleInputChange}
                                        onBlur={handleBlurInput}
                                        inputProps={{
                                            min: 0
                                        }}
                                        variant="outlined"
                                        size="small"
                                        className="w-full"
                                        InputProps={{
                                            className: "rounded-lg text-center bg-white",
                                        }}
                                        // Optional: Disable input if no button is active
                                        // disabled={!activeButton}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>

                    <Typography variant="h4" className="text-gray-700 mt-4 !text-[1.4rem] w-100 text-center">
                        <b>
                            Setup other intervals
                        </b>
                    </Typography>

                    <Box className="flex flex-col md:flex-row gap-4 w-full"> {/* Changed gap-5 to gap-4 (1rem) */}
                        <Box className="w-full p-4 rounded-lg shadow flex flex-col justify-between">
                            {/* Label */}
                            <div className="flex items-center mb-2">
                                <p className="text-base text-gray-700 mb-0"> {/* Added margin-bottom */}
                                    Minimal gap between each interval buttons
                                    (MIN: {CONSTANTS.MIN_INTERVAL_GAP_SECONDS} seconds):
                                </p>
                                <div
                                    className="relative flex items-center ml-2"
                                    onMouseEnter={() => changeStateHoverTooltip('minIntervalGap', true)}
                                    onMouseLeave={() => changeStateHoverTooltip('minIntervalGap', false)}
                                >
                                    <CircleHelp className="w-4 h-4 text-gray-500 cursor-help"/>

                                    {/* Tooltip Text */}
                                    <div
                                        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 px-3 py-2 
                                          bg-gray-800 text-white text-md rounded-md shadow-lg z-10 pointer-events-none
                                          transition-opacity duration-300 ${hoverTooltip.minIntervalGap ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        The minimum gap between the intervals of the buttons (Again → Hard → Good →
                                        Easy).
                                        Default: 20 seconds.
                                    </div>
                                </div>
                            </div>
                            {/* Input field */}
                            <Stack
                                direction={{md: 'column', lg: 'row'}}
                                justifyContent='center'
                                spacing={{xs: 0, lg: 8}}
                                className="w-full !mb-[0.2rem]"
                            >
                                {minIntervalsGapConfig.map((input) => (
                                    <Box
                                        key={'min-interval-' + input.name}
                                        className="flex flex-col items-center min-w-[100px] w-4/5 sm:w-auto max-w-[250px] sm:max-w-none"
                                    >
                                        <InputLabel
                                            htmlFor={`min-interval-${input.name}-input`}
                                            className="mb-2 font-bold !text-[0.9rem]"
                                        >
                                            {/* Label now uses displayTimeValues */}
                                            {getTimeLabel(minIntervalGaps[input.name], input.singular, input.plural)}
                                        </InputLabel>
                                        <TextField
                                            id={`min-interval-${input.name}-input`}
                                            name={input.name}
                                            type="number"
                                            // Value now comes from displayTimeValues state
                                            value={minIntervalGaps[input.name]}
                                            onChange={handleMinIntervalsGapInputChange}
                                            inputProps={{
                                                min: 0
                                            }}
                                            variant="outlined"
                                            size="small"
                                            className="w-full"
                                            InputProps={{
                                                className: "rounded-lg text-center bg-white",
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </Box>

                        <Box className="w-full p-4 rounded-lg shadow flex flex-col justify-between gap-1">
                            {/* Label */}
                            <div className="flex items-center mb-2">
                                <p className="text-base text-gray-700 mb-0"> {/* Added margin-bottom */}
                                    Skip interval (Max: 20 minutes)
                                </p>
                                <div
                                    className="relative flex items-center ml-2"
                                    onMouseEnter={() => changeStateHoverTooltip('skipInterval', true)}
                                    onMouseLeave={() => changeStateHoverTooltip('skipInterval', false)}
                                >
                                    <CircleHelp className="w-4 h-4 text-gray-500 cursor-help"/>

                                    {/* Tooltip Text */}
                                    <div
                                        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 px-3 py-2 
                                          bg-gray-800 text-white text-md rounded-md shadow-lg z-10 pointer-events-none
                                          transition-opacity duration-300 ${hoverTooltip.skipInterval ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        The amount of time to fast-forward so review cards appear sooner.
                                    </div>
                                </div>
                            </div>
                            {/* Input field */}
                            <Stack
                                direction={{md: 'column', lg: 'row'}}
                                justifyContent='center'
                                spacing={{xs: 0, lg: 8}}
                                className="w-full !mb-[0.2rem]"
                            >
                                {skipInputsConfig.map((input) => (
                                    <Box
                                        key={'skip-' + input.name}
                                        className="flex flex-col items-center min-w-[100px] w-4/5 sm:w-auto max-w-[250px] sm:max-w-none"
                                    >
                                        <InputLabel
                                            htmlFor={`skip-${input.name}-input`}
                                            className="mb-2 font-bold !text-[0.9rem]"
                                        >
                                            {/* Label now uses displayTimeValues */}
                                            {getTimeLabel(skipIntervalData[input.name], input.singular, input.plural)}
                                        </InputLabel>
                                        <TextField
                                            id={`skip-${input.name}-input`}
                                            name={input.name}
                                            type="number"
                                            // Value now comes from displayTimeValues state
                                            value={skipIntervalData[input.name]}
                                            onChange={handleSkipIntervalInputChange}
                                            inputProps={{
                                                min: 0
                                            }}
                                            variant="outlined"
                                            size="small"
                                            className="w-full"
                                            InputProps={{
                                                className: "rounded-lg text-center bg-white",
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Stack>

                        </Box>
                    </Box>

                    <Typography variant="h4" className="text-gray-700 mt-4 !text-[1.4rem] w-100 text-center">
                        <b>
                            Setup ratio mix
                        </b>
                    </Typography>

                    <Box className="flex flex-col md:flex-row gap-4 w-full"> {/* Changed gap-5 to gap-4 (1rem) */}
                        <Box className="w-full p-4 rounded-lg shadow">
                            {/* Label */}
                            <div className="flex items-center mb-4">
                                <p className="text-base text-gray-700 mb-0"> {/* Added margin-bottom */}
                                    Ratio new cards per day [5-95]:
                                </p>
                                <div
                                    className="relative flex items-center ml-2"
                                    onMouseEnter={() => changeStateHoverTooltip('ratioCardsPerDay', true)}
                                    onMouseLeave={() => changeStateHoverTooltip('ratioCardsPerDay', false)}
                                >
                                    <CircleHelp className="w-4 h-4 text-gray-500 cursor-help"/>

                                    {/* Tooltip Text */}
                                    <div
                                        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 px-3 py-2 
                                          bg-gray-800 text-white text-md rounded-md shadow-lg z-10 pointer-events-none
                                          transition-opacity duration-300 ${hoverTooltip.ratioCardsPerDay ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        The percentage of cards that are new each day.
                                    </div>
                                </div>
                            </div>
                            {/* Input field */}
                            <input
                                type="number"
                                // Inline styles for padding
                                style={{
                                    padding: "0.75rem 1rem",
                                }}
                                // Tailwind classes for styling - kept existing styles
                                className="border-2 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10 w-full font-medium text-sm rounded-lg outline-none"
                                value={ratioCards.newCards}
                                onChange={(e) =>
                                    handleRatioChange('newCards', e.target.value)}
                                onBlur={() => fixedRatioCards('newCards')}
                                placeholder="Input ratio"
                                disabled={autoSelectCards}
                                // Set max based on totalQuestion if it's a number
                                min={5} // Cannot have negative score
                            />
                        </Box>

                        <Box className="w-full p-4 rounded-lg shadow">
                            {/* Label */}
                            <div className="flex items-center mb-4">
                                <p className="text-base text-gray-700 mb-0"> {/* Added margin-bottom */}
                                    Ratio due date Cards [5-95]:
                                </p>
                                <div
                                    className="relative flex items-center ml-2"
                                    onMouseEnter={() => changeStateHoverTooltip('ratioDueDateCards', true)}
                                    onMouseLeave={() => changeStateHoverTooltip('ratioDueDateCards', false)}
                                >
                                    <CircleHelp className="w-4 h-4 text-gray-500 cursor-help"/>

                                    {/* Tooltip Text */}
                                    <div
                                        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 px-3 py-2 
                                          bg-gray-800 text-white text-md rounded-md shadow-lg z-10 pointer-events-none
                                          transition-opacity duration-300 ${hoverTooltip.ratioDueDateCards ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        The percentage of cards that are due for review each day.
                                    </div>
                                </div>
                            </div>
                            {/* Input field */}
                            <input
                                type="number"
                                // Inline styles for padding
                                style={{
                                    padding: "0.75rem 1rem",
                                }}
                                // Tailwind classes for styling - kept existing styles
                                className="border-2 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10 w-full font-medium text-sm rounded-lg outline-none"
                                value={ratioCards.dueDateCards}
                                onChange={(e) =>
                                    handleRatioChange('dueDateCards', e.target.value)}
                                onBlur={() => fixedRatioCards('dueDateCards')}
                                placeholder="Input ratio"
                                min={5} // Cannot have negative score
                                disabled={autoSelectCards}
                            />
                        </Box>
                    </Box>

                    <Typography variant="h4" className="text-gray-700 mt-4 !text-[1.4rem] w-100 text-center">
                        <b>
                            Other setup
                        </b>
                    </Typography>

                    <Box className="w-full flex justify-start"> {/* Added margin-top and centering */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={autoSelectCards}
                                    onChange={(e) => setAutoSelectCards(e.target.checked)}
                                    name="autoSelectCardsCheckbox"
                                    color="primary" // You can change the color (e.g., 'secondary')
                                    size="medium"
                                />
                            }

                            label="Automatically determines the order and number of new and due cards displayed each day."
                            className="text-gray-700"
                            sx={{
                                '& .MuiFormControlLabel-label': {
                                    fontSize: '1rem', // Adjust font size here
                                },
                            }}
                        />
                    </Box>

                    <Typography variant="h4" className="text-red-500 mt-4 !text-[1.4rem] w-100 text-center">
                        <b>
                            Danger Zone
                        </b>
                    </Typography>

                    <List className="rounded-[10px] border-2 border-red-500 max-w-full mt-[0.8rem]">
                        <ListItem className="p-[1.4rem] flex flex-col sm:flex-row flex-wrap items-center gap-2">
                            <Box className="text-[1.2rem] flex-1 whitespace-normal break-words flex flex-col">
                                <Box>Reset SRS Learning</Box>
                                <Box className="font-normal text-base">
                                    This action will reset all your progress in this set.
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
                                onClick={() => {
                                    if (window.confirm("Are you sure to reset all progresses on SRS Mode ?")) {
                                        handleResetSrsProgress().then(r => {
                                            onResetSrsProgress();
                                        }).catch(err => {
                                            console.error(err);
                                            toast.error("Error while resetting SRS progress");
                                        })
                                    }
                                }}
                            >
                                Reset states
                            </Button>
                        </ListItem>
                    </List>
                </Box>
        </>
    );
};

export default SpaceRepetitionSetting;