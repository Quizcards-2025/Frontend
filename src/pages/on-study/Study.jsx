import {Box, CssBaseline, ThemeProvider} from "@mui/material";
import {ColorModeContext, themeSettings, useMode} from "../../theme.js";
import NavbarStudy from "../../scenes/layout/navbar-study/index.jsx";
import FlashcardArray from "../../components/ts/FlashcardArray/FlashcardArray";
import React, {useCallback, useEffect, useRef, useState} from "react";
import "../../../src/components/ts/ProgressStudy/Progress.scss"
import {useNavigate, useParams} from "react-router-dom";
import Loading from "src/components/Loading.jsx";
import {removeNewlines, textToHtml} from "src/utils/HtmlAndFileUtils.jsx";
import * as progressService from "src/services/UserProgress.js";
import {filterProgress} from "src/utils/filterProgressFunction.jsx";
import api from "src/apis/api.js";
import {toast} from "react-toastify";
import AfterFinishLearningFlashcard from "../after-finish-learning-flashcard/AfterFinishLearningFlashcard.jsx";
import {useStreakBackgroundContext} from "../../context/StreakBackgroundContext.jsx";
import {useSetCardPassword} from "src/context/SetPasswordContext.jsx";
import PasswordChecking from "src/components/password-checking/PasswordChecking.jsx";
import {useSpeakText} from "src/context/SpeakTextContext.jsx";


function Study() {
    const [theme, colorMode] = useMode();

    const {modalConfirmOpen, setModalConfirmOpen} = useSetCardPassword();

    const navigate = useNavigate();
    const backOnceRef = useRef(false);

    const [password, setPassword] = useState("");
    const [expiredAt, setExpiredAt] = useState(0);

    const { audioRef, onPlaySound } = useSpeakText();

    const [replaceTermToVideo, setReplaceTermToVideo] = useState(localStorage.getItem("displayVideoInTerm") === "true");

    const colors = themeSettings(theme.palette.mode);
    const {id} = useParams();
    const [allCards, setAllCards] = useState([]);
    const [cardRecallIds, setCardRecallIds] = useState({});
    const [originalCards, setOriginalCards] = useState([]);
    const [recall, setRecall] = useState(0);
    const [remember, setRemember] = useState(0);
    const [title, setTitle] = useState();
    const [learningDone, setLearningDone] = useState(false);
    const [lastRemember, setLastRemember] = useState(0);
    const [totalCard, setTotalCard] = useState(0);
    const user = JSON.parse(localStorage.getItem("user"));
    const {updateStreak, showingModalStreakBackground} = useStreakBackgroundContext();
    const formatCardArray = (cards) => {
        if (!Array.isArray(cards)) {
            console.error("Invalid cards allCards:");
            return [];
        }
        // return cards.map((listCard) => ({
        //     id: listCard.cardId,
        //     frontHTML: textToHtml(listCard.question),
        //     backHTML: textToHtml(listCard.answer),
        //     img: listCard.imageUrl,
        //     isRemembered: listCard.statusProgress,
        //     mark: listCard.statusMark,
        // }));
        return cards.map((listCard) => ({
            id: listCard.id,
            frontHTML: listCard.frontHTML,
            backHTML: listCard.backHTML,
            img: listCard.imageUrl,
            video: listCard.videoUrl,
            isRemembered: null,
            mark: listCard.mark,
        }));
    };
    const handleProgress = useCallback((remember, recall) => {
        setRecall(recall);
        setRemember(remember);

        if (allCards && allCards.length > 0) {
            // console.log(allCards);
            updateStreak().then().catch();
        }

        if (allCards && allCards.length > 0 && recall + lastRemember + remember === totalCard) {
            setLearningDone(true);
            showingModalStreakBackground();
        }
    }, [allCards, lastRemember, totalCard]);

    const fetchProgressAnalysis = async () => {
        return progressService.getProgressAnalysisBySetIdUserId(user.id, id);
    };

    const fetchProgressData = async () => {
        try {
            const res = await progressService.getProgressBySetIdUserId(user.id, id, password, expiredAt);
            setTitle(res[0].title);
            const nativeCards_ = res.map(item => ({
                id: item.cardId,
                frontHTML: textToHtml(item.question),
                backHTML: textToHtml(item.answer),
                img: item.imageUrl,
                video: item.videoUrl,
                videoUrl: item.videoUrl,
                imageUrl: item.imageUrl,
                isRemembered: item.statusProgress,
                mark: item.statusMark === true,
            }));
            setOriginalCards(formatCardArray(nativeCards_));
            setAllCards(formatCardArray(filterProgress(nativeCards_)));
        } catch (error) {
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
            } else {
                console.error("Error fetching allCards:", error);
                toast.error("Error fetching allCards");
            }
        }
    };

    const initData = () => {
        fetchProgressAnalysis().then(
            (data) => {
                const {totalCardRecall, totalCardRemember, totalCardNotLearn} = data;
                setLastRemember(totalCardRemember);
                setTotalCard(totalCardRecall + totalCardRemember + totalCardNotLearn);
                if (totalCardRecall === 0 && totalCardNotLearn === 0) {
                    setLearningDone(true);
                } else {
                    fetchProgressData().then().catch();
                }
            }
        ).catch(err => {
            console.error("Error fetching progress analysis:", err);
            toast.error("Error fetching progress analysis");
        });
    };

    useEffect(() => {
        initData();
    }, [id]);

    // const handleUpdateCards = (data) => {
    //     // setData(allCards);
    // }
    // const handleViewCard = () => {
    //     console.log(allCards);
    // }

    const handleOnSound = async (data) => {
        // console.log(removeNewlines(data));
        // await api.post("http://localhost:8080/api/v1/speech", removeNewlines(data));
        // await api.post("/v1/speech", removeNewlines(data));
        try {
            // const response = await api.post("http://localhost:8080/api/v1/speech", removeNewlines(data));
            // const response = await api.post("/v1/speech", removeNewlines(data));
            // console.log("Sound completed:", response.data);
            await onPlaySound(removeNewlines(data));
        } catch (error) {
            console.error("Error while playing sound:", error);
        }
    }

    const handleCardStatusChange = async (idCard, status) => {
        try {
            await api.patch("/v1/progress/user/assign-progress", {
                progressType: status,
                cardId: idCard,
                setId: id,
            });
            setCardRecallIds(prevState => ({
                ...prevState,
                [idCard]: status,
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleResetProgress = async () => {
        return api.delete(`/v1/progress/user/reset-progress/${id}`);
    };
    
    const onResetProgress = () => {
        const tempRecall = recall;
        const tempRemember = remember;
        setRecall(0);
        setRemember(0);
        setLearningDone(false);
        if (tempRecall === 0) {
            handleResetProgress().then(res => {
                toast.success("Reset progress successfully");
                setLastRemember(0);
                setCardRecallIds({});
                if (originalCards && originalCards.length > 0) {
                    setAllCards(filterProgress(originalCards));
                } else {
                    fetchProgressData().then().catch();
                }
            }).catch(err => {
                console.error(err);
                toast.error("Error resetting progress");
            });
        } else {
            setLastRemember(prevState => prevState + tempRemember);
            setAllCards(prevState => formatCardArray(filterProgress(
                prevState.map(item => ({
                    ...item,
                    isRemembered: Object.prototype.hasOwnProperty.call(cardRecallIds, item.id) ?
                        cardRecallIds[item.id] : item.isRemembered,
                }))
            )));
            setCardRecallIds({});
        }
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
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                {allCards ? (
                    <NavbarStudy title={title}/>
                ) : (
                    <Loading type={"bubbles"}/>
                )}
                {
                    (learningDone === true) ? (
                        <>
                            <AfterFinishLearningFlashcard
                                setId={id}
                                recall={recall}
                                remember={lastRemember + remember}
                                onLearningAgain={onResetProgress}
                            />
                        </>
                    ) : (
                        <>
                            <Box className="flex h-screen max-w-full pt-9">
                                <Box
                                    className={`flex flex-col flex-grow justify-center items-center gap-8 bg-[${colors.palette.background.default}]`}
                                >
                                    <div className="wrapper">
                                        <div className="box recall">
                                            {recall}
                                        </div>
                                        <div className="box remember">
                                            {remember}
                                        </div>
                                    </div>
                                    <FlashcardArray cards={allCards} FlashcardArrayStyle={{
                                        width: "70%",
                                        fontSize: "1.6rem"
                                    }}
                                                    heightCard="450px"
                                                    onStudy={true}
                                                    onProgressStudy={handleProgress}
                                                    // onUpdateCards={handleUpdateCards}
                                                    onSound={handleOnSound}
                                                    onCardStatusChange={handleCardStatusChange}
                                                    replaceTermToVideo={replaceTermToVideo}
                                    />
                                </Box>
                            </Box>
                            <audio
                                ref={audioRef}
                                controls
                                style={{
                                    height: "40px",
                                }}
                                hidden
                            />
                        </>
                    )
                }
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default Study;
