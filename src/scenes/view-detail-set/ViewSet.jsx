import {Box, CircularProgress, CssBaseline, ThemeProvider, useMediaQuery} from "@mui/material";
import {CgFileDocument} from "react-icons/cg";
import {LuClock1, LuSwords} from "react-icons/lu";
import Header from "../../components/Header.jsx";
import React, {useEffect, useRef, useState} from "react";
import "../../components/Term/term.css";
import Term from "../../components/Term/Term.jsx";
import "../../../public/styles/common/view-set/view_set.user.css";
import FlashcardArray from "../../components/ts/FlashcardArray/FlashcardArray";
import {useNavigate, useParams} from "react-router-dom";
import api from "../../apis/api.js";
import {toast} from "react-toastify";
import {removeNewlines, textToHtml} from "../../utils/HtmlAndFileUtils.jsx";
import SetDeadlineCard from "src/components/SetDeadlineCard/SetDeadlineCard.jsx";
import dayjs from "dayjs";
import {filterProgress} from "src/utils/filterProgressFunction.jsx";
import {compareFunctionSort} from "src/utils/compareFunctionSortCards.jsx";
import Avatar from "src/components/icon/Avatar.jsx";
import Star from "../../components/ts/Button/Star";
import Modal from 'react-bootstrap/Modal';
import {Button, Form} from "react-bootstrap";
import * as emailjs from "emailjs-com";
import {MdCompareArrows, MdLoop} from "react-icons/md";
import {useDeadline} from "src/context/DeadlineContext.jsx";
import PasswordChecking from "src/components/password-checking/PasswordChecking.jsx";
import {ColorModeContext, useMode} from "src/theme.js";
import {useSetCardPassword} from "src/context/SetPasswordContext.jsx";
import {useSpeakText} from "src/context/SpeakTextContext.jsx";

const ViewSet = () => {
    const [theme, colorMode] = useMode();
    const backOnceRef = useRef(false);

    const {id} = useParams();
    const navigate = useNavigate();

    const {modalConfirmOpen, setModalConfirmOpen} = useSetCardPassword();
    const [password, setPassword] = useState("");
    const [expiredAt, setExpiredAt] = useState(0);

    const [onLoading, setOnLoading] = useState(true);
    const [onError, setOnError] = useState(false);

    const [email, setEmail] = useState('');
    const [showSharing, setShowSharing] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const {listDeadline, refreshDeadline} = useDeadline();
    const shareUrl = `${window.location.origin}/user/set/detail/${id}`;

    const isMobile = useMediaQuery('(max-width: 768px)');

    const {audioRef, onPlaySound} = useSpeakText();

    // Bắt màn (desktop)
    // const isDesktop = useMediaQuery('(min-width: 1024px)');
    const isDesktop = !isMobile;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast.success("Link copied to clipboard!");
        });
    };

    const handleShowSharing = () => setShowSharing(true);
    const handleCloseSharing = () => setShowSharing(false);

    const handleShowDelete = () => setShowDelete(true);
    const handleCloseDelete = () => setShowDelete(false);

    const sendEmail = (email, setTitle, from_name, quizLink) => {
        const templateParams = {
            to_email: email,
            setTitle: setTitle,
            from_name: from_name,
            quizLink: quizLink,
        };

        emailjs.send(
            'service_ni03psi',
            'template_0t71gqo',
            templateParams,
            'cyEr7MnIrCL4vCm16'
        )
            .then(response => {
                alert("Email đã được gửi thành công!");
            })
            .catch(err => {
                alert("Có lỗi khi gửi email: " + err);
            });
    };
    const handleSubmitSharing = (e) => {
        e.preventDefault();
        console.log(email);
        console.log(currentUser);
        const quizLink = `http://localhost:3000/user/set/detail/${id}`;
        sendEmail(email, dataInSet.title, currentUser.username, quizLink);
    };

    const [currentUser, setCurrentUser] = useState({
        id: -1
    });
    const [deadlineId, setDeadlineId] = useState(null);
    const [deadlineTime, setDeadlineTime] = useState(null);
    const [deadlineText, setDeadlineText] = useState(null);
    const [sec, setSec] = useState(null);
    const timerRef = useRef(null);

    const [dataInSet, setDataInSet] = useState({
        title: "",
        topic: "",
        usernameCreated: "unknown",
        avatarUserCreated: "",
        numberSetPublic: 0,
        userId: null,
        tags: "",
        isAnonymous: false,
        sharingMode: true,
    });

    const [dataSettings, setDataSettings] = useState({
        canEdit: false,
        canFavourite: false,
        flipped: false,
        isUserOwner: false,
        cardIndex: 0,
    });

    const [modalDeadlineOpen, setModalDeadlineOpen] = useState(null);

    const [dataCards, setDataCards] = useState({
        displayCards: [],
        fullCards: []
    });

    useEffect(() => {
        // Xóa timer cũ nếu có
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (deadlineTime) {
            try {
                // Tính số giây còn lại
                const diffSec = dayjs(deadlineTime)
                    .tz(dayjs.tz.guess())
                    .diff(dayjs().tz(dayjs.tz.guess()), "second");

                if (diffSec > 0) {
                    setSec(diffSec); // Cập nhật số giây ban đầu

                    // Tạo timer
                    timerRef.current = setInterval(() => {
                        setSec((prevSec) => {
                            if (prevSec <= 1) {
                                clearInterval(timerRef.current); // Hủy timer khi hết thời gian
                                return 0;
                            }
                            // console.log(prevSec);
                            return prevSec - 1; // Giảm số giây mỗi giây
                        });
                    }, 1000);
                }
            } catch (error) {
                console.error("Error calculating deadline difference:", error);
            }
        }

        // Cleanup interval khi component unmount hoặc deadlineTime thay đổi
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [deadlineTime]);

    useEffect(() => {
        calculateTimeRemaining(sec);
    }, [sec]);

    const handleDataInSetChange = (type, value) => {
        setDataInSet((prev) => ({
            ...prev,
            [type]: value
        }));
    }

    const handleDataSettingsChange = (type, value) => {
        setDataSettings((prev) => ({
            ...prev,
            [type]: value
        }));
    }

    const handleDataCardsChange = (type, value) => {
        setDataCards((prev) => ({...prev, [type]: value}));
    };

    const checkAndReturnSharingMode = (sharingMode, isUserOwner) => {
        if (!isUserOwner && !sharingMode) {
            toast.error("Error: Set is not public, cannot access");
            navigate("/users");
        }
    };

    const loadSetInfo = async (userData) => {
        const resSetInfo = await api.get(`/v1/set/set-detail/${id}`);
        const idUserOwner = resSetInfo.data.data.userId;
        const resSetPublicCount = await api.get(`/v1/set/count-public-set/${idUserOwner}`);
        handleDataSettingsChange("isUserOwner", idUserOwner === userData.id);
        handleDataSettingsChange("canEdit", idUserOwner === userData.id);
        handleDataSettingsChange("canFavourite", userData.id !== -1);

        handleDataInSetChange("title", resSetInfo.data.data.title);
        handleDataInSetChange("topic", resSetInfo.data.data.categoryName);
        handleDataInSetChange("userId", idUserOwner);
        handleDataInSetChange("usernameCreated", resSetInfo.data.data.userName);
        handleDataInSetChange("avatarUserCreated", resSetInfo.data.data.avatar);
        handleDataInSetChange("numberSetPublic", resSetPublicCount.data.data);
        handleDataInSetChange("isAnonymous", resSetInfo.data.data.isAnonymous);
        handleDataInSetChange("sharingMode", resSetInfo.data.data.sharingMode);
        handleDataInSetChange("tags", resSetInfo.data.data.tags || "");

        checkAndReturnSharingMode(resSetInfo.data.data.sharingMode, idUserOwner === userData.id);

        document.title = resSetInfo.data.data.title;
    };

    const loadCardInfo = async (userData) => {
        try {
            const resCard = await api.get(`/v1/progress/user/set/${id}`, {
                headers: {
                    'X-Set-Password': password,
                    'X-Set-Password-Valid-At': expiredAt,
                }
            });
            // console.log(resCard.data);

            const nativeCards = resCard.data.map(item => ({
                id: item.cardId,
                frontHTML: textToHtml(item.question),
                backHTML: textToHtml(item.answer),
                img: item.imageUrl,
                video: item.videoUrl,
                imageUrl: item.imageUrl,
                videoUrl: item.videoUrl,
                isRemembered: item.statusProgress,
                mark: item.statusMark === true,
            }));

            if (userData.id === -1) {
                handleDataCardsChange("displayCards", nativeCards);
                handleDataCardsChange("fullCards", nativeCards);
                return [...nativeCards];
            }
            let displayList = filterProgress(nativeCards);
            handleDataCardsChange("displayCards", displayList);
            handleDataCardsChange("fullCards", nativeCards);
            return [...displayList];
        } catch (err) {
            if (err && err.response.status && err.response.status === 403) {
                if (err.response.data && err.response.data.detail) {
                    console.log("Debug...");
                    const jsonData = JSON.parse(err.response.data.detail);
                    const {type} = jsonData;
                    if (type === "Password") {
                        console.log("Password...");
                        setModalConfirmOpen(true);
                    }
                } else {
                    toast.error("Error forbidden: " + err.response.data);
                    if (!backOnceRef.current) {
                        backOnceRef.current = true;
                        navigate(-1);
                    }
                }
            }
            throw err;
        }
    };

    const loadDeadline = async () => {
        try {
            const resReminderTime = await api.get(`/v1/deadline/set/${id}`);
            const reminders = resReminderTime.data;

            if (reminders.length > 0) {
                reminders.sort((a, b) => new Date(a.reminderTime) - new Date(b.reminderTime));
                const firstReminder = reminders[0];
                setDeadlineTime(firstReminder.reminderTime);
                setDeadlineId(firstReminder.deadlineRemindersId);
            }
        } catch (err) {
            console.error(`Error when get api: ${err}`);
            // if (err.response.status !== 404) {
            //     toast.error(`Failed to get deadline with response: ${err.response.status}`);
            // }
        }
    };

    const loadSettings = async (listCards) => {
        try {
            const resSettings = await api.get(`/v1/flashcard-settings/${id}`);
            listCards.map((item, index) => {
                if (item.id === resSettings.data.lastCardId) {
                    handleDataSettingsChange("cardIndex", index);
                }
            });
            handleDataSettingsChange("flipped", resSettings.data.flipCardMode === true);
        } catch (err) {
            // console.error(`Error when get api: ${err}`);
            if (err.response.status !== 404) {
                // toast.error(`Failed to get settings with response: ${err.response.status}`);
            }
        }
    };

    const getDataInCard = async () => {
        let userData = {
            id: -1
        };

        try {
            const response = await api.get("/v1/auth/user-info");
            setCurrentUser(response.data);
            userData = response.data;
        } catch {
            //
        }

        let listCards = [];

        try {
            await loadSetInfo(userData);
            listCards = await loadCardInfo(userData);
        } catch (err) {
            console.error("Error when get cards:", err);
            setOnError(true);
            if (err && err.response && err.response.status === 404) {
                toast.error(err.message);
                navigate("/error");
            } else if (err && err.response && err.response.status === 403) {
                // setOnError(false);
                if (!(err.response.data && err.response.data.detail)) {
                    if (!backOnceRef.current) {
                        backOnceRef.current = true;
                        toast.error("Error forbidden: " + JSON.stringify(err.response.data));
                        navigate(-1);
                    }
                }
                return;
            } else {
                toast.error("An error occurred from server.");
            }
        } finally {
            setOnLoading(false);
        }

        if (userData.id !== -1) {
            await loadDeadline();
            await loadSettings(listCards);
        }
    };

    useEffect(() => {
        getDataInCard().then().catch();
    }, [id]);


    const displayOnLogin = (cards) => {
        const cardLearnings = cards.filter(item => item.isRemembered === false).sort(compareFunctionSort);
        const cardNotLearnings = cards.filter(item => item.isRemembered === undefined || item.isRemembered === null)
            .sort(compareFunctionSort);
        const cardLearned = cards.filter(item => item.isRemembered).sort(compareFunctionSort);

        return (
            <>
                {
                    cardLearnings.length > 0 ?
                        <>
                            <div style={{
                                fontSize: '20px',
                                color: "orange",
                            }}>
                                Learnings: {cardLearnings.length}
                            </div>
                            {
                                cardLearnings.map((card) => (
                                    <div key={card.id} className="set-card"
                                         style={{position: "relative"}}>
                                        <Term frontHTML={card.frontHTML}
                                              backHTML={card.backHTML}
                                              img={card.img}/>
                                        <button style={{
                                            position: "absolute",
                                            background: "none",
                                            border: "none",
                                            width: "fit-content",
                                            height: "fit-content",
                                            cursor: "pointer",
                                            zIndex: 1,
                                            top: "10px",
                                            right: "10px"
                                        }} onClick={() => handleChangedMark(card.id, !card.mark)}
                                        >
                                            <Star initialMarked={card.mark} size={18}/>
                                        </button>
                                    </div>
                                ))
                            }
                        </> : <></>
                }
                {
                    cardNotLearnings.length > 0 ?
                        <>
                            <div style={{
                                fontSize: '20px',
                                color: "blue",
                            }}>
                                Not learnings: {cardNotLearnings.length}
                            </div>
                            {
                                cardNotLearnings.map((card) => (
                                    <div key={card.id} className="set-card"
                                         style={{position: "relative"}}>
                                        <Term frontHTML={card.frontHTML}
                                              backHTML={card.backHTML}
                                              img={card.img}/>
                                        <button style={{
                                            position: "absolute",
                                            background: "none",
                                            border: "none",
                                            width: "fit-content",
                                            height: "fit-content",
                                            cursor: "pointer",
                                            zIndex: 1,
                                            top: 0,
                                            right: 0,
                                        }} onClick={() => handleChangedMark(card.id, !card.mark)}
                                        >
                                            <Star initialMarked={card.mark} size={18}/>
                                        </button>
                                    </div>
                                ))
                            }
                        </> : <></>
                }
                {
                    cardLearned.length > 0 ? <>
                        <div style={{
                            fontSize: '20px',
                            color: "green",
                        }}>
                            Learned: {cardLearned.length}
                        </div>
                        {
                            cardLearned.map((card) => (
                                <div key={card.id} className="set-card">
                                    <Term frontHTML={card.frontHTML}
                                          backHTML={card.backHTML}
                                          img={card.img}/>

                                    <button style={{
                                        position: "absolute",
                                        background: "none",
                                        border: "none",
                                        width: "fit-content",
                                        height: "fit-content",
                                        cursor: "pointer",
                                        zIndex: 1,
                                        top: 0,
                                        right: 0,
                                    }}
                                            onClick={() => handleChangedMark(card.id, !card.mark)}
                                    >
                                        <Star initialMarked={card.mark} size={18}/>
                                    </button>
                                </div>
                            ))
                        }
                    </> : <></>
                }
            </>
        );
    };

    const handleChangedMark = async (index, marked) => {
        try {
            await api.patch("/v1/progress/user/assign-progress", {
                isAttention: marked,
                cardId: index,
                setId: id,
            });
            handleDataCardsChange("fullCards", dataCards.fullCards.map(
                (card) => card.id === index ? {...card, mark: marked} : {...card}
            ));
            handleDataCardsChange("displayCards", dataCards.displayCards.map(
                (card) => card.id === index ? {...card, mark: marked} : {...card}
            ));
            // toast.success("Mark changed success");
        } catch (err) {
            console.error("Error when fetch data", err);
            toast.error(`Error when changed mark with status: <${err.response.status}>`);
        }
    };

    const openDeadlineModal = () => {
        setModalDeadlineOpen(Math.random());
    };

    const calculateTimeRemaining = (seconds) => {
        // const intl = new Intl.RelativeTimeFormat(navigator.language || "en", {
        //   numeric: "auto", // Hiển thị dạng "in 3 days" hoặc "3 days ago"
        // }); // cái này được sử dụng để format định dạng theo mọi ngôn ngữ trình duyệt, không phải lo về việc chuyển đổi ngôn ngữ.

        // nhưng bây giờ sử dụng tạm cái này với ngôn ngữ mặc định là tiếng Anh
        const intl = new Intl.RelativeTimeFormat("en", {
            numeric: "auto", // Hiển thị dạng "in 3 days" hoặc "3 days ago"
        });

        if (!seconds) {
            return;
        }

        if (seconds >= 86400) {
            // Nếu >= 1 ngày
            const days = Math.floor(seconds / 86400);
            setDeadlineText(intl.format(days, "day"));
        } else if (seconds >= 3600) {
            // Nếu >= 1 giờ
            const hours = Math.floor(seconds / 3600);
            setDeadlineText(intl.format(hours, "hour"));
        } else {
            // Còn lại
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            // Format MM:ss
            const formattedTime = `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
            setDeadlineText(formattedTime);
        }
    };

    const submitDeadline = async (newTime, oldTime, deadlineId) => {
        try {
            console.log(newTime);
            if (deadlineId === null) {
                await api.post("/v1/deadline/create-deadline", {
                    reminderTime: newTime,
                    setId: id
                });
                toast.success("Created deadline successfully");
            } else {
                await api.put("/v1/deadline/update-deadline", {
                    reminderTime: newTime,
                    setId: id,
                    deadlineRemindersId: deadlineId
                });
                toast.success("Updated deadline successfully");
            }
            if (currentUser.id !== -1) {
                try {
                    await loadDeadline();
                    await refreshDeadline();
                } catch (err) {
                    //
                }
            }
        } catch (err) {
            console.error(err);
            toast.error(`Failed to add or update deadline with error status: ${err.response.status}`);
        }
        setModalDeadlineOpen(null);
    };

    const handleRedirectTrackProgressStudy = async () => {
        try {
            await api.patch(`/v1/flashcard-settings/update`, {
                setId: id,
            });
        } catch (err) {
            console.error("Error from save settings from maximize", err);
        }
        navigate(`/user/progress/set/${id}`);
    };
    // const saveSetToMyCourse = async () => {
    //     try {
    //         console.log(id);
    //         const response = await api.post(`http://localhost:8080/api/v1/flashcard-settings/create`, id);
    //         console.log(response);
    //         if (response.status == 201) {
    //             toast.success(response.data);
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         toast(error.response.data);
    //     }
    // }
    const handleResetCardArray = async () => {
        // try {
        //     await api.delete(`/v1/progress/user/reset-progress/${id}`);
        //     await loadCardInfo(currentUser);
        // } catch (err) {
        //     console.error(err);
        // }
    };

    const handleCardChanged = async (cardId, cardIndex) => {
        try {
            await api.patch(`/v1/flashcard-settings/update`, {
                lastCardId: cardId,
                setId: id,
            });
            // toast.success("Changed setting successfully");
        } catch (err) {
            toast.error("Changed setting failed");
            console.error(err);
        }
    };

    const handleCardFlip = async (cardId, index, state) => {
        try {
            await api.patch("/v1/flashcard-settings/update", {
                lastCardId: cardId,
                setId: id,
                flipCardMode: state,
            });
            // toast.success("Change setting success");
        } catch (err) {
            console.error("Error when fetch data", err);
            toast.error(`Error when changed mark with status: <${err.response.status}>`);
        }
    };

    let isPlaying = false;

    const handleOnSound = async (data) => {
        if (isPlaying) {
            console.log("Sound is already playing. Skipping this request.");
            return;
        }

        isPlaying = true;
        console.log("Playing sound:", data);

        try {
            // const response = await api.post("http://localhost:8080/api/v1/speech", removeNewlines(data));
            // const response = await api.post("/v1/speech", removeNewlines(data));
            // console.log("Sound completed:", response.data);
            await onPlaySound(removeNewlines(data));
        } catch (error) {
            console.error("Error while playing sound:", error);
        } finally {
            isPlaying = false;
        }
    };
    const handleNavigateKANA = () => {
        navigate(`/arena/room-code?id=2&setId=${id}`);
    }

    const handleSubmitDelete = async (e) => {
        e.preventDefault();
        try {
            await api.delete(`/v1/set/delete-set/${id}`);
            toast.success("Delete card successfully");
            setTimeout(() => {
                navigate("/user/flashcard");
            }, 1200);
        } catch (err) {
            toast.error("Error when delete set flashcard");
            console.error(err);
        } finally {
            handleCloseDelete();
        }

    };

    if (modalConfirmOpen) {
        return (
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>

                    <PasswordChecking
                        setId={id}
                        changeExpiredAt={setExpiredAt}
                        changePassword={setPassword}
                        onClose={(setId, validating, password, expiredAt) => {
                            setOnLoading(true);
                            setOnError(false);
                            if (validating) {
                                getDataInCard().then(() => {
                                }).catch(() => {
                                });
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
            {
                !onLoading ? onError ? (<>
                    <Box className="container flex !justify-center items-center w-full h-full">
                        <h3>
                            <b>
                                No data display.
                            </b>
                        </h3>
                    </Box>
                </>) : (
                    <Box p={
                        isDesktop ? "40px" : "0px"
                    }
                         className={`container ${isMobile && '!m-0 !p-0'}`}
                         gap={2}>
                        <Box flex={isDesktop ? 3 : 0}
                             display="grid"
                             gridTemplateColumns={isDesktop ? "1fr" : "100vw"}
                             gap={2}>
                            <div className="title">{dataInSet.title}</div>
                            <div className="topic">
                                <span className="topic-label">Topic :</span>
                                <div
                                    className="topic-box"
                                    onClick={() => {
                                        navigate(`/user/detail-list-set?category_name=${dataInSet.topic}`)
                                    }}
                                    style={{
                                        cursor: "pointer",
                                    }}
                                >
                                    {dataInSet.topic}
                                </div>
                            </div>
                            {dataInSet.tags && dataInSet.tags.trim() !== "" && (
                                <div className="tags-container"
                                     style={{marginTop: '10px', display: 'flex', alignItems: 'center'}}>
                                    <span className="tags-label" style={{marginRight: '10px'}}>Tags:</span>
                                    <div style={{
                                        display: 'flex',
                                        overflowX: 'auto',
                                        whiteSpace: 'nowrap',
                                        gap: '8px',
                                        paddingBottom: '5px'
                                    }}>
                                        {dataInSet.tags.split(',').map((tag, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#e0e0fe',
                                                    borderRadius: '4px',
                                                    fontSize: '14px',
                                                    color: '#000',
                                                    flexShrink: 0,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    navigate(`/user/detail-list-set?tag_name=${tag.trim()}`);
                                                }}
                                            >
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flashcard-container">
                                <FlashcardArray
                                    cards={dataCards.displayCards}
                                    FlashcardArrayStyle={{
                                        width: "100%",
                                        fontSize: "1.6rem"
                                    }}
                                    heightCard="400px"
                                    cardIndex={dataSettings.cardIndex}
                                    canEdit={dataSettings.isUserOwner}
                                    canDelete={dataSettings.isUserOwner}
                                    canFavorite={dataSettings.canFavourite}
                                    flipped={dataSettings.flipped}
                                    onChangedMark={handleChangedMark}
                                    onCardFlip={handleCardFlip}
                                    maximize={handleRedirectTrackProgressStudy}
                                    onResetCard={handleResetCardArray}
                                    onCardChange={handleCardChanged}
                                    setId={id}
                                    onSound={handleOnSound}
                                    share={handleShowSharing}
                                    onDeleteSet={handleShowDelete}
                                />
                            </div>

                            <div className="button-container text-[1.1rem]">
                                <div className="button button-border-light"
                                     onClick={() => navigate(`/user/set-up-test/${id}`)}>
                                    <i style={{marginLeft: "0px"}}><CgFileDocument size={30}/></i>
                                    <span>Take a test</span>
                                </div>
                                <div className="button button-border-light" onClick={handleNavigateKANA}>
                                    <i><LuSwords size={30}/></i>
                                    <span>Add to Knowledge Arena</span>
                                </div>
                                <div className="button button-border-light" onClick={openDeadlineModal}>
                                    <i><LuClock1 size={30}/></i>
                                    <span>{
                                        deadlineText ? deadlineText : "Add to Deadline"
                                    }</span>
                                </div>
                                <div className="button button-border-light"
                                     onClick={() => navigate(`/matching?setId=${id}&new=1`)}>
                                    <i><MdCompareArrows size={30}/></i>
                                    <span>Matching</span>
                                </div>
                                <div className="button button-border-light"
                                     onClick={() => navigate(`/user/space-repetition/${id}`)}>
                                    <i><MdLoop size={30}/></i>
                                    <span>Space Repetition</span>
                                </div>
                            </div>
                            <div
                                className="avatar-container"
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    if (!dataSettings.isUserOwner && !dataInSet.isAnonymous) {
                                        navigate(`/user/detail-list-set?user_id=${dataInSet.userId}`);
                                    }
                                }}>
                                {
                                    (!dataSettings.isUserOwner && (dataInSet.isAnonymous || dataInSet.avatarUserCreated === null)) ?
                                        <Avatar size={30}/> : (
                                            <img src={dataInSet.avatarUserCreated} alt="User Avatar"
                                                 className="avatar"/>
                                        )
                                }
                                <div className="user-info">
                                    <span
                                        style={{fontSize: "18px"}}>by <strong>{!dataSettings.isUserOwner && dataInSet.isAnonymous ? "anonymous" : dataInSet.usernameCreated}</strong></span>
                                    {
                                        (dataSettings.isUserOwner || !dataInSet.isAnonymous) && (
                                            <span style={{color: "#939393"}}>{dataInSet.numberSetPublic} public sets</span>
                                        )
                                    }
                                </div>
                            </div>

                            <div className="separator"></div>
                            <div className="terms-header">
                                <Header title={"Terms (" + dataCards.fullCards.length + ")"} fontSize="24px"/>
                            </div>
                            {
                                displayOnLogin(dataCards.fullCards)
                            }
                        </Box>
                        {/*<Box flex={1} display="flex" flexDirection="column" alignItems="stretch">*/}
                        {/*    <div className="hot-terms">*/}
                        {/*        <i className="hot-terms-icon">*/}
                        {/*            <img width="33" height="33"*/}
                        {/*                 src="https://img.icons8.com/color/48/fire-element--v1.png"*/}
                        {/*                 alt="fire-element--v1"/>*/}
                        {/*        </i>*/}
                        {/*        <span className="hot-terms-title">Hot terms</span>*/}
                        {/*    </div>*/}

                        {/*    <div className="set-card">*/}
                        {/*        <SetCard/>*/}
                        {/*    </div>*/}
                        {/*    <div className="set-card">*/}
                        {/*        <SetCard/>*/}
                        {/*    </div>*/}
                        {/*    <div className="set-card">*/}
                        {/*        <SetCard/>*/}
                        {/*    </div>*/}
                        {/*</Box>*/}
                    </Box>
                ) : (<>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: "center",
                            height: '100%',
                        }}>
                            <CircularProgress
                                size={40}
                                thickness={4}
                                sx={{
                                    color: '#1976d2',
                                }}
                            />
                        </Box>
                    </>
                )
            }
            {/* Modal for Sharing */}
            <Modal show={showSharing} onHide={handleCloseSharing} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Share this set</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Let go to share with your friends 😊</p>
                    <Form onSubmit={handleSubmitSharing}>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Enter adress email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Input email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3 mb-3">
                            Send
                        </Button>
                    </Form>
                    <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="form-control mb-3"
                        style={{fontSize: "14px"}}
                    />
                    <Button variant="success" onClick={handleCopy}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                             className="icon icon-tabler icons-tabler-outline icon-tabler-copy">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path
                                d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/>
                            <path
                                d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>
                        </svg>
                    </Button>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseSharing}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showDelete}
                onHide={handleCloseDelete}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{
                        fontSize: "2.0rem",
                        fontWeight: "700",
                    }}>
                        ❗Delete this set
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formBasicDelete">
                            <Form.Label style={{
                                fontSize: "1.6rem",
                            }}>
                                ⚠️ Are you sure to want to delete this set: {dataInSet.title} ?
                            </Form.Label>
                            <Form.Label style={{
                                fontSize: "1.2rem",
                            }}>
                                Once you choose Confirm, the operator cannot undo
                            </Form.Label>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Box sx={{
                        display: "flex",
                    }}>
                        <Button
                            variant="secondary"
                            type="submit"
                            className="mt-3 mb-3 mr-3"
                            onClick={(e) => {
                                e.preventDefault();
                                handleCloseDelete();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            type="submit"
                            className="mt-3 mb-3"
                            onClick={handleSubmitDelete}
                        >
                            Delete
                        </Button>
                    </Box>
                </Modal.Footer>
            </Modal>

            <SetDeadlineCard
                id={deadlineId}
                originDeadline={deadlineTime}
                onSubmitTime={submitDeadline}
                isOpen={modalDeadlineOpen}
            />
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

export default ViewSet;