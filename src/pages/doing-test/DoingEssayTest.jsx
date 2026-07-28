import React, {useEffect, useRef, useState} from "react";
import {Box, Button, TextField, useMediaQuery, useTheme} from "@mui/material";
import Return from "../../components/ts/Button/Return";
import {useNavigate, useParams} from "react-router-dom";
import Reset from "../../components/ts/Button/Reset";
import styles from "./DoingTest.module.scss";
import stylesCommon from "../../../public/styles/common/test/Test.module.scss";
import {textToHtml} from "src/utils/HtmlAndFileUtils.jsx";
import Stomp from "stompjs";
import SockJS from "sockjs-client";
import {api, getAccessToken} from "src/apis/api.js";
import {toast} from "react-toastify";
import {calculateRemainingTime, formatTime} from "src/utils/bonusHandleTime.jsx";
import {WS_Link} from "src/ws/WS.js";

const DoingEssayTest = () => {
    const {id} = useParams();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const navigate = useNavigate();

    const localTestString = `testData_Questions_${id}`;

    const [title, setTitle] = useState("temp");

    const [goalScore, setGoalScore] = useState(0);
    const [totalQuestion, setTotalQuestion] = useState(0);

    const [questions, setQuestions] = useState([
        {
            "id": 1,
            "question": "sdfdshuf",
            "yourAnswer": "",
            "isEditing": false,
            "yourAnswerEdit": "",
        },
        {
            "id": 2,
            "question": "sdfdshuf",
            "yourAnswer": "",
            "isEditing": false,
            "yourAnswerEdit": "",
        },
        {
            "id": 3,
            "question": "sdfdshuf",
            "yourAnswer": "",
            "isEditing": false,
            "yourAnswerEdit": "",
        },
    ]);

    const containerTestRef = useRef(null);
    const progressRef = useRef(null);

    const [activeQuestion, setActiveQuestion] = useState(1);

    const handleScroll = () => {
        if (containerTestRef.current) {
            const questions = Array.from(
                containerTestRef.current.querySelectorAll(".questionContainer")
            );
            const containerHeight = containerTestRef.current.offsetHeight;
            const midPoint = containerHeight / 2;

            questions.forEach((question, index) => {
                const rect = question.getBoundingClientRect();
                const containerRect = containerTestRef.current.getBoundingClientRect();

                // Check if the question is near the midpoint of the container
                if (
                    rect.top >= containerRect.top + midPoint - rect.height / 2 &&
                    rect.bottom <= containerRect.bottom
                ) {
                    setActiveQuestion(index + 1);
                }
            });
        }
    }

    const textFields = useRef([]); // Tạo danh sách ref

    const handleFocus = (index) => {
        if (textFields.current[index]) {
            textFields.current[index].focus(); // Gọi focus vào TextField tại index
        }
    };

    useEffect(() => {
        if (progressRef.current) {
            const activeButton = progressRef.current.querySelector(
                `.${stylesCommon.activeNumber}`
            );
            if (activeButton) {
                activeButton.scrollIntoView({behavior: "smooth", block: "center"});
            }
        }
    }, [activeQuestion]);

    const handleChangeAnswer = (questionId, yourAnswer) => {
        sendDataToServer(questionId, yourAnswer);
        setYourNewAnswer(questionId, yourAnswer);
    };

    const timerRef = useRef(null);
    const [diffMilli, setDiffMilli] = useState(null);

    const [createdAt, setCreatedAt] = useState(null);
    const [endAt, setEndedAt] = useState(null);

    const setCancel = (questionId) => {
        setQuestions((prev) => prev.map((q) => q.id === questionId ?
            {...q, yourAnswerEdit: q.yourAnswer, isEditing: false} : q));
    };

    const setYourAnswerEdit = (questionId, answer) => {
        if (answer.length < 501) {
            setQuestions((prev) => prev.map((q) => q.id === questionId && q.isEditing ?
                {...q, yourAnswerEdit: answer} : q));
        }
    }

    const setEditing = (questionId) => {
        setQuestions((prev) => prev.map((q) => q.id === questionId ?
            {...q, isEditing: true} : q));
    }

    const setYourNewAnswer = (questionId, yourAnswer, isEditing = false) => {
        setQuestions((prev) => prev.map((q) => q.id === questionId ?
            {...q, yourAnswer: yourAnswer, isEditing: isEditing} : q));
    };

    useEffect(() => {
        if (diffMilli === 0) {
            changeToDetailTest();
        }
    }, [diffMilli]);

    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setDiffMilli(calculateRemainingTime(createdAt, endAt));
        }, 1000);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                setDiffMilli(calculateRemainingTime(createdAt, endAt));
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [endAt]);

    useEffect(() => {}, [createdAt]);

    const [isConnectedAgain, setIsConnectedAgain] = useState(false);
    const [stompClient, setStompClient] = useState(null);
    const RECONNECT_INTERVAL = 5000; // 20 giây

    const changeToDetailTest = () => {
        navigate(`/detail-test/es/${id}`);
    };

    const shutdownTest = () => {
        changeToDetailTest();
    };

    const onSocketDown = (event) => {
        console.log("Connection closed.");
        console.log("Code:", event.code);
        console.log("Reason:", event.reason);

        // Phân biệt nguyên nhân
        if (event.code === 1000) {
            console.log("Server closed the connection gracefully.");
            shutdownTest();
        } else if (event.code === 1002) {
            toast.error("Setup test error, go to detail test...");
            shutdownTest();
        } else if (event.code === 1006) {
            console.error("Connection lost. Possibly due to network issues or server crash.");
            retryConnection();
        } else {
            console.error("Connection closed for another reason.");
        }
    };

    const retryConnection = () => {
        setTimeout(() => {
            console.log("Retrying connection...");
            setupSocket().then().catch();
        }, RECONNECT_INTERVAL);
    };

    const setupSocket = async () => {
        try {
            if (stompClient && stompClient.connected) {
                console.log("WebSocket already connected.");
                return;
            }

            const socket = new SockJS(WS_Link);
            let stClient = Stomp.over(socket);
            setStompClient(stClient);

            stClient.connect(
                {Authorization: `Bearer ${getAccessToken()}`},
                (frame) => {
                    stClient.subscribe(`/topic/test/register/${id}`);
                },
                (error) => {
                    console.error("Error connecting to WebSocket: ", error);
                    if (error?.code === 1002) {
                        toast.error("Setup test error, go to detail test...");
                        shutdownTest();
                    }
                    if (error?.code === 1006) {
                        console.error("Lost connection. Retrying in 20 seconds...");
                        retryConnection();
                    }
                }
            );

            socket.onclose = onSocketDown;
        } catch (err) {
            console.error(err);
        }
    };

    const sendDataToServer = (questionId, yourAnswer) => {
        if (stompClient && stompClient.connected) {
            stompClient.send("/app/send-data-to-test", {},
                JSON.stringify(
                    {
                        testId: id,
                        esData: {
                            questionId: questionId,
                            answer: yourAnswer,
                        }
                    }
                ));
        }
    };

    const forceSubmitTest = (event) => {
        if (stompClient && stompClient.connected) {
            stompClient.send("/app/force-submit-test", {},
                JSON.stringify(
                    {
                        testId: id,
                    }
                ));
            stompClient.disconnect();
            shutdownTest();
        }
    }

    const handleRawQuestions = (oldQuestions) => {
        return oldQuestions.map((question) => {
            return {
                ...question,
                yourAnswerEdit: question.yourAnswer ? question.yourAnswer : '',
                isEditing: false,
            };
        });
    }

    const fetchTestData = async () => {
        try {
            const resTestData = await api.get(`/v1/test/user/get-detail-by-test-id/${id}`);
            if (resTestData.data.testModeName !== "ESSAY") {
                navigate("/");
            }
            setQuestions(handleRawQuestions(resTestData.data.questions));
            setCreatedAt(resTestData.data.createdAt);
            setEndedAt(resTestData.data.endAt);
            setTitle(resTestData.data.setTitle);
            setTotalQuestion(resTestData.data.totalScore);
            setGoalScore(resTestData.data.goalScore);
            console.log(resTestData.data);
        } catch (err) {
            toast.error("Error: Cannot fetch test data");
        }
    };

    useEffect(() => {
        fetchTestData().then((res) => {
            setupSocket().then().catch();
        }).catch();
    }, []);

    return (
        <>
            <Box p={isSmallScreen ? 2 : 5} sx={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                margin: {xs: "0 20px", sm: "0 50px", md: "0 150px", lg: "0 250px"},
                position: "relative",
                height: "100vh",
                backgroundColor: "#EDEDFF",
            }}>
                <Box sx={{
                    flex: "0 0 40px",
                    display: "flex",
                    borderBottom: "2px solid black",
                }}>
                    <Box sx={{
                        flex: "0 0 50%",
                        display: "flex",
                        justifyContent: "space-between",
                    }}>
                        <Return onClick={() => {
                            navigate(-1);
                        }}/>
                        <h3 style={{
                            marginBottom: 0,
                            display: "flex",
                            alignItems: "center"
                        }}>
                            <b>
                                Essay test {title}
                            </b>
                        </h3>
                    </Box>
                    <Box sx={{
                        flex: "1",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                    }}>
                        <Reset onClick={() => {
                        }}/>
                        <Button className={stylesCommon.setButton}>
                            Set of {totalQuestion}
                        </Button>

                        <Button className={stylesCommon.goalScoreButton}>
                            Goal Score {goalScore}/{totalQuestion}
                        </Button>
                    </Box>
                </Box>

                <Box ref={progressRef} className={styles.doingTestContainer}>
                    <Box className={styles.containerProgress} sx={{
                        height: "100%",
                    }}>
                        <Box className={styles.title}>Progress</Box>
                        <Box className={styles.numberRow}>
                            {questions.map((q, num) => (
                                <Button
                                    key={num + 1}
                                    className={num + 1 === activeQuestion ?
                                        stylesCommon.activeNumber : stylesCommon.numberBox}
                                    disableElevation
                                    aria-label={`Progress step ${num + 1}`}
                                    sx={q.yourAnswer ? {
                                        backgroundColor: "#7474B6 !important",
                                    } : undefined}
                                    onClick={() => {
                                        setActiveQuestion(num + 1);
                                        const questionElement = document.querySelector(
                                            `#testQuestion-Id-${q.id}`
                                        );
                                        if (questionElement) {
                                            questionElement.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center",
                                            });
                                        }
                                    }}
                                >
                                    {num + 1}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                    <Box ref={containerTestRef} className={styles.containerTest}>
                        <Box sx={{
                            width: "100%",
                        }}>
                            {
                                questions.map((question, index) => (
                                    <>
                                        <div
                                            className={`${stylesCommon.questionContainer} questionContainer`}
                                            id={`testQuestion-Id-${question.id}`}
                                            key={index}
                                        >
                                            <div className={styles.questionNumber}>{index + 1}</div>
                                            <div className={styles.questionText}>
                                                <div dangerouslySetInnerHTML={{__html: textToHtml(question.question)}}/>
                                            </div>
                                            <TextField
                                                id="filled-multiline-static"
                                                label="Answer"
                                                multiline
                                                rows={8}
                                                defaultValue=""
                                                variant="filled"
                                                value={question.yourAnswerEdit}
                                                onChange={(e) => setYourAnswerEdit(question.id, e.target.value)}
                                                InputProps={{
                                                    readOnly: !(question.isEditing === true),
                                                }}
                                                inputRef={(el) => (textFields.current[index] = el)}
                                            />
                                            <div style={{
                                                fontSize: "0.8rem",
                                            }}>
                                                {question.yourAnswerEdit.length} / 500
                                            </div>
                                            <div className={styles.essayButtonEditing}
                                                 style={{
                                                     justifyContent: question.isEditing === true ?
                                                         "space-between !important" : "end"
                                                 }}>
                                                {
                                                    question.isEditing === true ?
                                                        <>
                                                            <Button className={`${styles.essayButtonSaveEditAndCancel} 
                                                                                ${styles.essayButtonSave}`}
                                                                    onClick={() => handleChangeAnswer(question.id,
                                                                        question.yourAnswerEdit)}>
                                                                Save
                                                            </Button>
                                                            <Button className={`${styles.essayButtonSaveEditAndCancel} 
                                                                                ${styles.essayButtonCancel}`}
                                                                    onClick={() => setCancel(question.id)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </> :
                                                        <>
                                                            <Button className={styles.essayButtonSaveEditAndCancel}
                                                                    sx={{
                                                                        flex: "0 0 50% !important",
                                                                        backgroundColor: "#0e22e9",
                                                                        color: "#f8f8ff",
                                                                    }}
                                                                    onClick={() => {
                                                                        setEditing(question.id);
                                                                        handleFocus(index);
                                                                    }}
                                                            >
                                                                Edit
                                                            </Button>
                                                        </>
                                                }
                                            </div>
                                        </div>
                                    </>
                                ))
                            }
                        </Box>
                    </Box>
                    <Box className={styles.containerTimeRemaining}>
                        <Box sx={{
                            textWrap: "wrap",
                            height: "60px",
                            width: "100%",
                            padding: "0 8px",
                        }}>
                            <h3 style={{
                                fontSize: "1.5rem",
                                margin: "0",
                                textAlign: "center",
                            }}>
                                <b>{formatTime(diffMilli)} Remaining</b>
                            </h3>
                        </Box>
                    </Box>
                    <Box className={styles.forceSubmitButtonPlace}>
                        <div className={styles.forceSubmitWrapper}>
                            <Button
                                className={styles.forceSubmitActionButton}
                                variant="contained"
                                tabIndex={0}
                                aria-label="Done"
                                onClick={forceSubmitTest}
                            >
                                <h2 style={{
                                    color: "white !important"
                                }}>
                                    <b>Force submit</b>
                                </h2>
                            </Button>
                        </div>
                    </Box>
                </Box>
            </Box>
        </>
    )
};

export default DoingEssayTest;