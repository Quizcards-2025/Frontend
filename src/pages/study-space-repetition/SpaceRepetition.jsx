import {ColorModeContext, themeSettings, useMode} from "src/theme.js";
import {useNavigate, useParams} from "react-router-dom";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useStreakBackgroundContext} from "src/context/StreakBackgroundContext.jsx";
import * as setService from "src/services/SetService.js";
import * as srsService from "src/services/SpaceRepetitionService.js";
import * as cardService from "src/services/CardService.js";
import * as settingService from "src/services/SrsSettingService.js";
import {removeNewlines, textToHtml} from "src/utils/HtmlAndFileUtils.jsx";
import {filterSrsProgress} from "src/utils/filterProgressFunction.jsx";
import {toast} from "react-toastify";
import api from "src/apis/api.js";
import {Box, Button, CircularProgress, CssBaseline, ThemeProvider, Typography} from "@mui/material";
import NavbarStudy from "src/scenes/layout/navbar-study/index.jsx";
import Loading from "src/components/Loading.jsx";
import FlashcardArray from "../../components/ts/FlashcardArray/FlashcardArray";
import SpaceRepetitionWaiting from "src/components/space-repetition/SpaceRepetitionWaiting.jsx";
import {Settings} from 'lucide-react';
import {convertSecondsToDateTime} from "src/utils/timeLanguageUtils.js";
import {useSetCardPassword} from "src/context/SetPasswordContext.jsx";
import PasswordChecking from "src/components/password-checking/PasswordChecking.jsx";


const SpaceRepetition = () => {
    const [theme, colorMode] = useMode();
    const colors = themeSettings(theme.palette.mode);

    const {modalConfirmOpen, setModalConfirmOpen} = useSetCardPassword();

    const navigate = useNavigate();
    const backOnceRef = useRef(false);

    const [password, setPassword] = useState("");
    const [expiredAt, setExpiredAt] = useState(0);

    const {id} = useParams();
    const user = JSON.parse(localStorage.getItem("user"));

    const DEFAULT_SRS_ANALYSIS_DATA = {
        numNewCards: 0,
        numLearningCards: 0,
        numAlmostDoneCards: 0,
        numMasteredCards: 0,
    };

    const [onLoading, setOnLoading] = useState(true);
    const [onProcessing, setOnProcessing] = useState(false);
    const [onApiBusy, setOnApiBusy] = useState(false);

    const [idUserInfo, setIdUserInfo] = useState(-1);

    const [allCards, setAllCards] = useState([]);
    const [originalCards, setOriginalCards] = useState([]);

    const [currentCardId, setCurrentCardId] = useState(null);

    const [progressAllCards, setProgressAllCards] = useState({});
    const [progressNewCards, setProgressNewCards] = useState({});
    const [progressReviewCards, setProgressReviewCards] = useState({});

    const [setCardTitle, setSetCardTitle] = useState();

    const [numCardsPerRound, setNumCardsPerRound] = useState(0);

    const [numCardsKnown, setNumCardsKnown] = useState(null);
    const [numCardsUnknown, setNumCardsUnknown] = useState(null);

    const [srsAnalysisData, setSrsAnalysisData] = useState(DEFAULT_SRS_ANALYSIS_DATA);

    const numNewCardsNow = Object.keys(progressNewCards).length;
    const numCardsToReview = Object.keys(progressReviewCards).length;

    const {updateStreak, showingModalStreakBackground} = useStreakBackgroundContext();

    const [replaceTermToVideo, setReplaceTermToVideo] = useState(localStorage.getItem("displayVideoInTerm") === "true");

    const formatCardArray = (cards) => {
        if (!Array.isArray(cards)) {
            console.error("Invalid cards allCards:");
            return [];
        }
        return cards.map((card) => ({
            id: card.id,
            frontHTML: card.frontHTML,
            backHTML: card.backHTML,
            img: card.imageUrl,
            video: card.videoUrl,
            isRemembered: null,
            mark: card.mark,
            srsState: card.srsState,
        }));
    };

    const navigateToFlippingMode = () => {
        navigate(`/user/progress/set/${id}`);
    }

    const handleTransformProgresses = (progresses) => {
        let v_progressAllCards = new Map();
        let v_progressNewCards = new Map();
        let v_progressReviewCards = new Map();
        console.log("Progresses in transform:", progresses);
        progresses.forEach((p) => {
            v_progressAllCards.set(p.cardId, p);
            // If have progress id
            if (p.id != null) {
                v_progressReviewCards.set(p.cardId, p);
            } else {
                v_progressNewCards.set(p.cardId, p);
            }
        });

        setProgressAllCards(Object.fromEntries(v_progressAllCards));
        setProgressNewCards(Object.fromEntries(v_progressNewCards));
        setProgressReviewCards(Object.fromEntries(v_progressReviewCards));


        return Object.fromEntries(v_progressAllCards);
    };

    const handleTransformSrsDataToFields = (data) => {
        setNumCardsPerRound(data.numCardsPerRound);
        return handleTransformProgresses(data.progresses);
    };

    const fetchCardsAndTransformByIds = async (ids, progresses) => {
        try {
            const cards = await cardService.getListCardByCardIds(ids, id);
            const nativeCards = cards.map(item => ({
                id: item.cardId,
                frontHTML: textToHtml(item.question),
                backHTML: textToHtml(item.answer),
                img: item.imageUrl,
                video: item.videoUrl,
                imageUrl: item.imageUrl,
                cardState: item.cardId in progresses ?
                    "cardState" in progresses[item.cardId] ?
                        progresses[item.cardId].cardState : null : null
            }));

            const formattedCards = formatCardArray(filterSrsProgress(nativeCards));

            if (formattedCards && formattedCards.length > 0) {
                setCurrentCardId(formattedCards[0].id);
            }

            setOriginalCards(formattedCards);
            setAllCards(formattedCards);
        } catch (err) {
            throw err;
        }
    };

    const [waitingSeconds, setWaitingSeconds] = useState(0);
    const [retryFetch, setRetryFetch] = useState(false);

    const fetchSrsProgressData = async (setId) => {
        try {
            const srsData = await srsService.getSrsData(setId, password, expiredAt);
            return handleTransformSrsDataToFields(srsData);
        } catch (error) {
            // TOO EARLY
            if (error && error.response && error.response.status === 425) {
                console.log("Retry After:", error.response.headers['retry-after']);
                setWaitingSeconds(parseInt(error.response.headers['retry-after'], 10));
                setProgressAllCards({});
                setProgressNewCards({});
                setProgressReviewCards({});
                setRetryFetch(true);
                setIsLearning(false);
                console.log("Srs data null cmnr");
                return null;
            }
            if (error && error.response && error.response.status === 403) {
                if (error.response.data && error.response.data.detail) {
                    const jsonData = JSON.parse(error.response.data.detail);
                    const {type} = jsonData;
                    if (type === "Password") {
                        setModalConfirmOpen(true);
                    }
                } else {
                    toast.error("Error forbidden: " + error.response.data);
                    if (!backOnceRef.current) {
                        backOnceRef.current = true;
                        navigate(-1);
                    }
                }
            }
            throw error;
        }
    };

    const fetchSetInfo = async (setId) => {
        try {
            const setInfo = await setService.getSetDetail(setId);
            setSetCardTitle(setInfo.data.title);
            setIdUserInfo(setInfo.data.userId);
        } catch (err) {
            throw err;
        }
    };

    const fetchSetting = async () => {
        try {
            await settingService.getSrsSetting(id, password, expiredAt);
            return "ok";
        } catch (err) {
            if (err.response && err.response.status < 500) {
                if (err && err.response && err.response.status === 403) {
                    // setOnError(false);
                    if (!(err.response.data && err.response.data.detail)) {
                        if (!backOnceRef.current) {
                            backOnceRef.current = true;
                            toast.error("Error forbidden: " + JSON.stringify(err.response.data));
                            navigate(-1);
                        }
                    }
                    return "ok";
                }
                console.error(`No setting found for set id: ${id}. Redirected to setup setting...`);
                navigate(`/user/srs-setting/${id}`);
                return null;
            }
            throw err;
        }
        // return "ok";
    };

    const fetchData = async () => {
        setOnLoading(true);
        try {
            const res = await fetchSetting();
            if (res == null) {
                return;
            }
            await fetchSetInfo(id);
            await fetchSrsAnalysisData(id);
            const progresses = await fetchSrsProgressData(id);
            if (progresses != null) {
                const cardIds = Object.keys(progresses);
                await fetchCardsAndTransformByIds(cardIds, progresses);
            } else {
                // TODO:
            }
        } catch (err) {
            if (err && err.response && err.response.status === 403) {
                // setOnError(false);
                if (!(err.response.data && err.response.data.detail)) {
                    if (!backOnceRef.current) {
                        backOnceRef.current = true;
                        toast.error("Error forbidden: " + JSON.stringify(err.response.data));
                        navigate(-1);
                    }
                }
            } else {
                console.error(err);
                toast.error("Error fetching data");
            }
        } finally {
            setOnLoading(false);
        }
    };

    useEffect(() => {
        fetchData().then().catch();
    }, [id]);

    const handleOnSound = async (data) => {
        console.log(removeNewlines(data));
        await api.post("/v1/speech", removeNewlines(data));
    }

    const [isLearning, setIsLearning] = useState(true);

    const handleCommitSrsProgress = async (progAllCards) => {
        try {
            const progresses = Object.values(progAllCards);
            const requestData = {
                setId: id,
                batchRequests: progresses.map((p) => {
                    return {
                        cardId: p.cardId,
                        userRating: p.userRating,
                    }
                })
            };
            const data = await srsService.submitSrsProgress(requestData);
            setNumCardsKnown(data.idCardsKnown.length);
            setNumCardsUnknown(data.idCardsUnknown.length);
        } catch (err) {
            console.error(err);
            toast.error("Error committing SRS progress");
            if (err && (err.response == null || err.response.status == null)) {
                setOnApiBusy(true);
                toast.info("API is busy, please try again later...");
            }
            throw err;
        }
    };

    const handleRatingCard = useCallback(async (idCard, userRating) => {
        let progCard = progressAllCards[idCard];
        progCard = {
            ...progCard,
            userRating: userRating,
        };
        let newAllCards = {
            ...progressAllCards,
            [idCard]: progCard,
        };
        setProgressAllCards((newAllCards));
        const {[idCard]: __unused1, ...restNewCardsNow} = progressNewCards;
        const {[idCard]: __unused2, ...restReviewCards} = progressReviewCards;
        setProgressNewCards(restNewCardsNow);
        setProgressReviewCards(restReviewCards);
        const length = Object.keys(restNewCardsNow).length + Object.keys(restReviewCards).length;
        if (length === 0) {
            let error = false;
            try {
                setOnProcessing(true);
                await handleCommitSrsProgress(newAllCards);
                await fetchSrsAnalysisData(id);
                const progresses = await fetchSrsProgressData(id);
                if (progresses != null) {
                    const cardIds = Object.keys(progresses);
                    await fetchCardsAndTransformByIds(cardIds, progresses);
                }
                updateStreak().then(r => {
                    showingModalStreakBackground();
                }).catch(err => {
                    console.error("Error");
                });
                setIsLearning(false);
            } catch (err) {
                if (err && err.response && err.response.status === 403) {
                    // setOnError(false);
                    if (!(err.response.data && err.response.data.detail)) {
                        if (!backOnceRef.current) {
                            backOnceRef.current = true;
                            toast.error("Error forbidden: " + JSON.stringify(err.response.data));
                            navigate(-1);
                        }
                    } else {
                        error = false;
                    }
                } else {
                    error = true;
                }
            } finally {
                if (!error) {
                    setOnApiBusy(false);
                }
                setOnProcessing(false);
            }
        }
    }, [progressAllCards, progressNewCards, progressReviewCards]);

    const fetchSrsAnalysisData = async () => {
        try {
            const data = await srsService.getAnalysisSrsProgress(id);
            setSrsAnalysisData(data);
        } catch (err) {
            console.error(err);
            toast.error("Error fetching SRS analysis data");
        }
    };

    const handleRetryAgain = async () => {
        if (retryFetch) {
            try {
                const progresses = await fetchSrsProgressData(id);
                if (progresses != null) {
                    const cardIds = Object.keys(progresses);
                    await fetchCardsAndTransformByIds(cardIds, progresses);
                    setRetryFetch(false);
                }
            } catch (err) {
                if (err && err.response && err.response.status === 403) {
                    // setOnError(false);
                    if (!(err.response.data && err.response.data.detail)) {
                        if (!backOnceRef.current) {
                            backOnceRef.current = true;
                            toast.error("Error forbidden: " + JSON.stringify(err.response.data));
                            navigate(-1);
                        }
                    }
                } else {
                    console.error(err);
                    toast.error("Error fetching data");
                }
            }
        }
    };

    const handleRetrySubmitAgain = async () => {
        let error = false;
        try {
            setOnProcessing(true);
            await handleCommitSrsProgress(progressAllCards);
            await fetchSrsAnalysisData(id);
            const progresses = await fetchSrsProgressData(id);
            if (progresses != null) {
                const cardIds = Object.keys(progresses);
                await fetchCardsAndTransformByIds(cardIds, progresses);
            }
            updateStreak().then(r => {
                showingModalStreakBackground();
            }).catch(err => {
                console.error("Error");
            });
            setIsLearning(false);
        } catch (err) {
            if (err && err.response && err.response.status === 403) {
                // setOnError(false);
                if (!(err.response.data && err.response.data.detail)) {
                    if (!backOnceRef.current) {
                        backOnceRef.current = true;
                        toast.error("Error forbidden: " + JSON.stringify(err.response.data));
                        navigate(-1);
                    }
                } else {
                    error = false;
                }
            } else {
                error = true;
            }
        } finally {
            if (!error) {
                setOnApiBusy(false);
            }
            setOnProcessing(false);
        }
    };

    const getMaxUnitTimesWithFormat = (seconds) => {
        if (seconds == null) {
            return;
        }
        const units = ['days', 'hours', 'minutes', 'seconds'];
        const displayUnits = ['day', 'hour', 'minute', 'second'];
        const dateTime = convertSecondsToDateTime(seconds);

        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            if (unit in dateTime && dateTime[unit] > 0) {
                return `${dateTime[unit]} ${displayUnits[i]}${dateTime[unit] > 1 ? 's' : ''}`;
            }
        }
        return "0 second";
    };

    if (modalConfirmOpen) {
        return (
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <PasswordChecking
                        setId={id}
                        changePassword={setPassword}
                        changeExpiredAt={setExpiredAt}
                        onClose={(setId, validating, password, expiredAt) => {
                            if (validating) {
                                fetchData().then().catch();
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


    if (onLoading) {
        return (
            <>
                <ColorModeContext.Provider value={colorMode}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline/>
                        <Box className={` 
                            !fixed !flex !flex-col !justify-center !items-center !h-full 
                            !top-0 !left-0 !w-full`}>
                            <CircularProgress
                                size={40}
                                thickness={4}
                                sx={{
                                    color: '#1976d2',
                                }}
                            />
                        </Box>
                    </ThemeProvider>
                </ColorModeContext.Provider>
            </>
        );
    }

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                {allCards ? (
                    <NavbarStudy
                        title={setCardTitle}
                        otherMenus={(
                            <>
                                <Box className="flex gap-2 items-center justify-center mr-2">
                                    <Box
                                        className={`
                                        inline-flex items-center justify-center
                                        p-2 rounded-full
                                        transition-all duration-500
                                        hover:bg-gray-300 hover:rotate-90
                                        active:bg-gray-600
                                        cursor-pointer
                                        `}
                                        onClick={() => navigate(`/user/srs-setting/${id}`)}
                                    >
                                        <Settings size={24}/>
                                    </Box>
                                    {
                                        isLearning && <>
                                            <Box component="span"
                                                 className={`text-xl`}
                                            >
                                                Cards per round: {numCardsPerRound}
                                            </Box>
                                        </>
                                    }
                                </Box>

                            </>
                        )}
                    />
                ) : (
                    <>
                        <Loading type={"bubbles"}/>
                    </>
                )}
                {
                    allCards && isLearning && <>
                        <Box className="flex h-screen max-w-full pt-9"> {/* Outer container */}
                            {/* Main content container */}
                            <Box
                                className={`flex flex-col flex-grow items-center gap-2 bg-[${colors.palette.background.default}] relative h-full`}
                            >
                                {/* Description Box (Absolutely Positioned - No changes needed here) */}
                                <Box
                                    className="absolute z-[500] top-20 left-0 max-w-[14%] break-words ml-3 flex flex-col gap-1"
                                >
                                    <Box
                                        component="p"
                                        className="text-[1.1rem] mb-1"
                                    >
                                        Description
                                    </Box>
                                    {/* Red Icon Box */}
                                    <Box className="flex gap-2 items-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M7 3.33962C8.89444 2.24593 11.0952 1.8036 13.2651 2.0804C15.435 2.35719 17.4543 3.33786 19.0135 4.87211C20.5727 6.40635 21.5859 8.40954 21.8977 10.5747C22.2095 12.7398 21.8027 14.9475 20.7397 16.8593C19.6768 18.7712 18.0162 20.2818 16.0126 21.1596C14.009 22.0374 11.7728 22.234 9.64672 21.7192C7.52066 21.2045 5.62203 20.0069 4.24177 18.3098C2.86152 16.6128 2.07579 14.51 2.005 12.3236L2 11.9996L2.005 11.6756C2.06016 9.97608 2.5478 8.31868 3.42181 6.86007C4.29583 5.40145 5.52736 4.18979 7 3.33962Z"
                                                fill="#E73D3D" stroke="#E73D3D" strokeWidth="3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                            <path d="M10.5 10.0065L12.5 8.00647V16.0065" stroke="#F5B2B2" strokeWidth="2"
                                                  strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <Box component="p" className="text-[0.9rem] mb-0 opacity-70"> {
                                            currentCardId && progressAllCards[currentCardId] ?
                                                'Appear after ' +
                                                getMaxUnitTimesWithFormat(progressAllCards[currentCardId].oldNextIntervalAgain)
                                                : ''
                                        }</Box>
                                    </Box>
                                    {/* Orange Icon Box */}
                                    <Box className="flex gap-2 items-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M7 3.33962C8.89444 2.24593 11.0952 1.8036 13.2651 2.0804C15.435 2.35719 17.4543 3.33786 19.0135 4.87211C20.5727 6.40635 21.5859 8.40954 21.8977 10.5747C22.2095 12.7398 21.8027 14.9475 20.7397 16.8593C19.6768 18.7712 18.0162 20.2818 16.0126 21.1596C14.009 22.0374 11.7728 22.234 9.64672 21.7192C7.52066 21.2045 5.62203 20.0069 4.24177 18.3098C2.86152 16.6128 2.07579 14.51 2.005 12.3236L2 11.9996L2.005 11.6756C2.06016 9.97608 2.5478 8.31868 3.42181 6.86007C4.29583 5.40145 5.52736 4.18979 7 3.33962Z"
                                                fill="#FF9500" stroke="#FF9500" strokeWidth="3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                            <path
                                                d="M10 8H13C13.2652 8 13.5196 8.10536 13.7071 8.29289C13.8946 8.48043 14 8.73478 14 9V11C14 11.2652 13.8946 11.5196 13.7071 11.7071C13.5196 11.8946 13.2652 12 13 12H11C10.7348 12 10.4804 12.1054 10.2929 12.2929C10.1054 12.4804 10 12.7348 10 13V15C10 15.2652 10.1054 15.5196 10.2929 15.7071C10.4804 15.8946 10.7348 16 11 16H14"
                                                stroke="#FFDFB1" strokeWidth="2" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        <Box component="p" className="text-[0.9rem] mb-0 opacity-70">{
                                            currentCardId && progressAllCards[currentCardId] ?
                                                'Appear after ' +
                                                getMaxUnitTimesWithFormat(progressAllCards[currentCardId].oldNextIntervalHard)
                                                : ''
                                        }</Box>
                                    </Box>
                                    {/* Green Icon Box */}
                                    <Box className="flex gap-2 items-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M7 3.33962C8.89444 2.24593 11.0952 1.8036 13.2651 2.0804C15.435 2.35719 17.4543 3.33786 19.0135 4.87211C20.5727 6.40635 21.5859 8.40954 21.8977 10.5747C22.2095 12.7398 21.8027 14.9475 20.7397 16.8593C19.6768 18.7712 18.0162 20.2818 16.0126 21.1596C14.009 22.0374 11.7728 22.234 9.64672 21.7192C7.52066 21.2045 5.62203 20.0069 4.24177 18.3098C2.86152 16.6128 2.07579 14.51 2.005 12.3236L2 11.9996L2.005 11.6756C2.06016 9.97608 2.5478 8.31868 3.42181 6.86007C4.29583 5.40145 5.52736 4.18979 7 3.33962Z"
                                                fill="#00C310" stroke="#00C310" strokeWidth="3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                            <path
                                                d="M10 8H12.5C12.8978 8 13.2794 8.15804 13.5607 8.43934C13.842 8.72064 14 9.10218 14 9.5V10.5C14 10.8978 13.842 11.2794 13.5607 11.5607C13.2794 11.842 12.8978 12 12.5 12M12.5 12H11M12.5 12C12.8978 12 13.2794 12.158 13.5607 12.4393C13.842 12.7206 14 13.1022 14 13.5V14.5C14 14.8978 13.842 15.2794 13.5607 15.5607C13.2794 15.842 12.8978 16 12.5 16H10"
                                                stroke="#B8FFBE" strokeWidth="2" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        <Box component="p" className="text-[0.9rem] mb-0 opacity-70">{
                                            currentCardId && progressAllCards[currentCardId] ?
                                                'Appear after ' +
                                                getMaxUnitTimesWithFormat(progressAllCards[currentCardId].oldNextIntervalGood)
                                                : ''
                                        }</Box>
                                    </Box>
                                    {/* Blue Icon Box */}
                                    <Box className="flex gap-2 items-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M7 3.33962C8.89444 2.24593 11.0952 1.8036 13.2651 2.0804C15.435 2.35719 17.4543 3.33786 19.0135 4.87211C20.5727 6.40635 21.5859 8.40954 21.8977 10.5747C22.2095 12.7398 21.8027 14.9475 20.7397 16.8593C19.6768 18.7712 18.0162 20.2818 16.0126 21.1596C14.009 22.0374 11.7728 22.234 9.64672 21.7192C7.52066 21.2045 5.62203 20.0069 4.24177 18.3098C2.86152 16.6128 2.07579 14.51 2.005 12.3236L2 11.9996L2.005 11.6756C2.06016 9.97608 2.5478 8.31868 3.42181 6.86007C4.29583 5.40145 5.52736 4.18979 7 3.33962Z"
                                                fill="#0E22E9" stroke="#0E22E9" strokeWidth="3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                            <path
                                                d="M10 8V11C10 11.2652 10.1054 11.5196 10.2929 11.7071C10.4804 11.8946 10.7348 12 11 12H14M14 8V16"
                                                stroke="#BABEFD" strokeWidth="2" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        <Box component="p" className="text-[0.9rem] mb-0 opacity-70">{
                                            currentCardId && progressAllCards[currentCardId] ?
                                                'Appear after ' +
                                                getMaxUnitTimesWithFormat(progressAllCards[currentCardId].oldNextIntervalEasy)
                                                : ''
                                        }</Box>
                                    </Box>
                                </Box>

                                {/* New cards / Cards to review Box (Now at the top of the flex flow) */}
                                <Box
                                    className="flex flex-col md:flex-row w-[70%] justify-between items-center gap-4 my-2 text-[1rem]"
                                    sx={{
                                        marginTop: "4.5rem !important",
                                    }}
                                >
                                    <Box
                                        className="w-full md:flex-none md:basis-1/2 p-[0.85rem] rounded-[2.2rem] bg-[#F8F8FF] text-center">
                                        New cards: {numNewCardsNow}
                                    </Box>
                                    <Box className="w-full md:flex-1 p-[0.85rem] rounded-[2.2rem] bg-[#F8F8FF] text-center">
                                        Cards to review: {numCardsToReview}
                                    </Box>
                                </Box>

                                <Box className="flex flex-grow justify-center items-center w-full">
                                    <FlashcardArray
                                        cards={allCards}
                                        FlashcardArrayStyle={{
                                            width: "70%",
                                            fontSize: "1.6rem"
                                        }}
                                        onSpaceRepetition={true}
                                        heightCard="450px" // Fixed height for the card itself
                                        onSound={handleOnSound}
                                        onSrsSubmitCard={handleRatingCard}
                                        onCardChange={(cardId, cardIdx) => {
                                            setCurrentCardId(cardId);
                                        }}
                                        replaceTermToVideo={replaceTermToVideo}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </>
                }
                {
                    allCards && !isLearning && <>
                        <SpaceRepetitionWaiting
                            waitingSeconds={waitingSeconds}
                            cardsKnown={numCardsKnown}
                            cardsUnknown={numCardsUnknown}
                            nextNewCards={numNewCardsNow}
                            nextReviewCards={numCardsToReview}
                            onNavigateFlippingMode={navigateToFlippingMode}
                            allNumNewCards={srsAnalysisData.numNewCards}
                            allNumLearningCards={srsAnalysisData.numLearningCards}
                            allNumAlmostDoneCards={srsAnalysisData.numAlmostDoneCards}
                            allNumMasteredCards={srsAnalysisData.numMasteredCards}
                            onContinueRound={() => {
                                if (retryFetch) {
                                    handleRetryAgain().then(
                                        () => {
                                            setIsLearning(true);
                                        }
                                    ).finally()
                                } else {
                                    setIsLearning(true);
                                }
                            }}
                        />
                    </>
                }
                {
                    onProcessing && <>
                        <Box className={`!fixed 
                    !flex !flex-col !justify-center !items-center !h-full 
                    !top-0 !left-0 !w-full !z-[9999] !bg-black/70`}>
                            <CircularProgress
                                size={40}
                                thickness={4}
                                sx={{
                                    color: '#1976d2',
                                }}
                            />
                            <Typography
                                className="!text-gray-200 !mt-4 !ml-2 !text-center !text-base"
                                variant="subtitle1">
                                Processing...
                            </Typography>
                        </Box>
                    </>
                }

                {
                    onApiBusy && <>
                        <Button className={`!fixed 
                    !flex !flex-col !justify-center !items-center 
                    !bottom-0 !right-0 !z-[9999] !mr-6 !mb-6
                    !px-6 !py-3 !rounded-3xl !bg-blue-400 !text-gray-700
                    !text-base`}
                                sx={{
                                    textTransform: 'none',
                                }}
                                onClick={handleRetrySubmitAgain}
                        >
                            Retry Again
                        </Button>
                    </>
                }

            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default SpaceRepetition;