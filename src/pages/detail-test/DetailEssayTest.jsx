import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {Box, Button, Typography, useMediaQuery, useTheme} from "@mui/material";
import Return from "../../components/ts/Button/Return";
import styles from "../detail-test/DetailTest.module.scss";
import stylesCommon from "../../../public/styles/common/test/Test.module.scss";

import {textToHtml} from "src/utils/HtmlAndFileUtils.jsx";

import SvgStarBlue from "src/components/icon/StarBlue.jsx";
import SvgStarRed from "src/components/icon/StarRed.jsx";
import SvgStarWhite from "src/components/icon/StarWhite.jsx";
import {toast} from "react-toastify";
import api from "src/apis/api.js";
import VectorTrue from "src/components/icon/VectorTrue.jsx";
import VectorFalse from "src/components/icon/VectorFalse.jsx";
import useTestData from "../../hooks/useTestData.js";

const DetailEssayTest = () => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    const {id} = useParams();

    // Sử dụng hook chung, truyền mode mong đợi và các đường dẫn chuyển hướng nếu cần
    const {
        setId,
        title,
        goalScore,
        totalQuestion,
        containerTestRef,
        progressRef,
        activeQuestion,
        setActiveQuestion,
        isTestDone,
        endAt,
        questions,
    } = useTestData(id, "ESSAY", {
        essay: `/detail-test/es/${id}`,
        multiple: `/detail-test/mul/${id}`,
    });

    useEffect(() => {
        if (progressRef.current) {
            const activeButton = progressRef.current.querySelector(`.${stylesCommon.activeNumber}`);
            if (activeButton) {
                activeButton.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [activeQuestion]);

    const countTrueQuestions = () =>
        questions.reduce((count, q) => (q.answerTrue === true && q.yourAnswer ? count + 1 : count), 0);

    const countFalseQuestions = () =>
        questions.reduce((count, q) => (!q.answerTrue && q.yourAnswer ? count + 1 : count), 0);

    const countNullAnswerQuestions = () =>
        questions.reduce((count, q) => (!q.yourAnswer ? count + 1 : count), 0);

    const getStringNotify = () => {
        return countTrueQuestions() < goalScore
            ? "Oh, I think you should learn this set again, then take a new exam."
            : "Congratulations, your score is over your goal! Keep doing great.";
    };

    return (
        <>
            <Box p={isSmallScreen ? 2 : 5} className={styles.detailContainer}>
                <Box className={styles.detailTestStartContainer}>
                    <Box sx={{
                        flex: "0 0 50%",
                        display: "flex",
                        justifyContent: "space-between",
                        backgroundColor: "#EDEDFF",
                    }}>
                        <Return onClick={() => {
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
                        <Button className={stylesCommon.setButton}>
                            Set of {totalQuestion}
                        </Button>

                        <Button className={stylesCommon.goalScoreButton}>
                            Goal Score {goalScore}/{totalQuestion}
                        </Button>
                    </Box>
                </Box>

                {
                    !isTestDone ?
                        <>
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}>
                                <h2>Test is ongoing, do you want to go to doing test ?</h2>
                                <Button
                                    sx={{
                                        textTransform: "none",
                                        width: "250px",
                                        height: "60px",
                                        fontSize: "1.2rem",
                                        backgroundColor: "#020ec7",
                                        borderRadius: "10px",
                                        color: "#fff",
                                    }}
                                >
                                    Go to doing test
                                </Button>
                                <p style={{
                                    fontSize: "1.4rem",
                                    paddingTop: "0.5rem"
                                }}>
                                    Ended at: {endAt}
                                </p>
                            </div>
                        </>
                        :
                        <>
                            <Box ref={progressRef} className={styles.detailTestContainer}>
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
                                                sx={{
                                                    backgroundColor:
                                                        q.answerTrue === true && q.yourAnswer
                                                            ? "#7474B6 !important"
                                                            : !q.yourAnswer
                                                                ? undefined
                                                                : "#ad4c4c !important",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            q.answerTrue === true && q.yourAnswer
                                                                ? "#7474b6cc !important" // Giảm độ mờ
                                                                : !q.yourAnswer
                                                                    ? undefined
                                                                    : "#ad4c4ccc !important", // Giảm độ mờ
                                                    },
                                                }}
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
                                        display: "flex",
                                        gap: "2px",
                                        width: "100%",
                                    }}>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            flex: "0 0 50%",
                                        }}>
                                            <Box sx={{
                                                position: "relative",
                                                height: "160px",
                                            }}>
                                                <div className={styles.imgSuccessCardWrapper}>
                                                    <SvgStarBlue/>
                                                    <span className={styles.imgSuccessNumberText}>
                                                        {
                                                            countTrueQuestions()
                                                        }
                                                    </span>
                                                </div>
                                                <div className={styles.imgErrorCardWrapper}>
                                                    <SvgStarRed/>
                                                    <span className={styles.imgErrorNumberText}>
                                                        {
                                                            countFalseQuestions()
                                                        }
                                                    </span>
                                                </div>
                                                <div className={styles.imgNullCardWrapper}>
                                                    <SvgStarWhite/>
                                                    <span className={styles.imgNullNumberText}>
                                                        {
                                                            countNullAnswerQuestions()
                                                        }
                                                    </span>
                                                </div>
                                            </Box>
                                            <Box sx={{
                                                position: "relative",
                                            }}>
                                                <h2 style={{
                                                    textWrap: "wrap",
                                                    fontWeight: "bold",
                                                }}>
                                                    {
                                                        getStringNotify()
                                                    }
                                                </h2>
                                            </Box>
                                        </Box>
                                        <Box sx={{
                                            flex: "1",
                                            display: "flex",
                                            flexDirection: "column",
                                        }}>
                                            <div className={styles.optionButtonCardContent}>
                                                <Button
                                                    className={styles.optionsButtonPracticeAgain}
                                                    onClick={() => navigate(`/user/progress/set/${setId}`)}
                                                >
                                                    <h3 className={styles.optionButtonTitle}><b>Practice missed
                                                        terms</b></h3>
                                                    <Typography variant="body1"
                                                                className={styles.optionButtonSubtitle}>
                                                        Practice until you get them right.
                                                    </Typography>
                                                    <Typography variant="body2" className={styles.optionButtonBadge}>
                                                        {countFalseQuestions() + countNullAnswerQuestions()} terms
                                                    </Typography>
                                                </Button>
                                            </div>

                                            <div className={styles.optionButtonCardContent}>
                                                <Button
                                                    className={styles.optionsButtonTakeAgain}
                                                    onClick={() => navigate(`/user/set-up-test/${setId}`)}
                                                >
                                                    <h3 className={styles.optionButtonTitle}><b>Take this test again</b>
                                                    </h3>
                                                    <Typography variant="body1"
                                                                className={styles.optionButtonSubtitle}>
                                                        Take again and get high score.
                                                    </Typography>
                                                    <Typography variant="body2" className={styles.optionButtonBadge}>
                                                        {totalQuestion} terms
                                                    </Typography>
                                                </Button>
                                            </div>
                                        </Box>
                                    </Box>
                                    <hr style={{
                                        color: "#000",
                                        width: "100%",
                                        height: "5px",
                                        backgroundColor: "#000",
                                        border: "none"
                                    }}/>
                                    <h3 style={{color: "#000"}}><b>Review your answer</b></h3>
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
                                                            <div
                                                                dangerouslySetInnerHTML={{__html: textToHtml(question.question)}}/>
                                                        </div>
                                                        <div className={styles.essayAnswerContainer}>
                                                            <div className={styles.essayHeaderEntered}>
                                                                You have entered:
                                                            </div>
                                                            <div className={
                                                                question.answerTrue === true && question.yourAnswer ?
                                                                    styles.essayTrueAnswerEntered :
                                                                    styles.essayYourAnswerEntered
                                                            }>
                                                                <div className={styles.essayAnswerDataContainer}>
                                                                    <div dangerouslySetInnerHTML={{
                                                                        __html: textToHtml(
                                                                            question.yourAnswer ?
                                                                                question.yourAnswer :
                                                                                ''
                                                                        )
                                                                    }}/>
                                                                </div>
                                                                <div style={{
                                                                    marginRight: "1rem",
                                                                }}>
                                                                    {
                                                                        question.answerTrue === true && question.yourAnswer ?
                                                                            <>
                                                                                <VectorTrue/>
                                                                            </> :
                                                                            <>
                                                                                <VectorFalse/>
                                                                            </>
                                                                    }
                                                                </div>
                                                            </div>
                                                            {
                                                                !(question.answerTrue === true && question.yourAnswer) &&
                                                                <>
                                                                    <div className={styles.essayHeaderEntered} style={{
                                                                        marginTop: "0.8rem",
                                                                    }}>
                                                                        But the correct answer is:
                                                                    </div>
                                                                    <div className={styles.essayTrueAnswerEntered}>
                                                                        <div
                                                                            className={styles.essayAnswerDataContainer}>
                                                                            <div dangerouslySetInnerHTML={{
                                                                                __html: textToHtml(
                                                                                    question.answer ?
                                                                                        question.answer :
                                                                                        ''
                                                                                )
                                                                            }}/>
                                                                        </div>
                                                                        <div style={{
                                                                            marginRight: "1rem",
                                                                        }}>
                                                                            <VectorTrue/>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                </>
                                            ))
                                        }
                                    </Box>
                                </Box>
                                <Box className={styles.doneButtonPlace}>
                                    <div className={styles.doneButtonWrapper}>
                                        <Button
                                            className={styles.doneActionButton}
                                            variant="contained"
                                            tabIndex={0}
                                            aria-label="Done"
                                            onClick={() => navigate("/")}
                                        >
                                            <h2 style={{
                                                color: "white !important"
                                            }}>
                                                <b>Done</b>
                                            </h2>
                                        </Button>
                                    </div>
                                </Box>
                            </Box>
                        </>
                }
            </Box>
        </>
    )
};

export default DetailEssayTest;