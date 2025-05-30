import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {Box, Button, Typography, useMediaQuery, useTheme} from "@mui/material";
import Return from "../../components/ts/Button/Return";
import styles from "../detail-test/DetailTest.module.scss";
import stylesCommon from "../../../public/styles/common/test/Test.module.scss";

import {textToHtml} from "src/utils/HtmlAndFileUtils.jsx";
import {extractAnswer} from "src/utils/ExtractAnswer.jsx";
import SvgStarBlue from "src/components/icon/StarBlue.jsx";
import SvgStarRed from "src/components/icon/StarRed.jsx";
import SvgStarWhite from "src/components/icon/StarWhite.jsx";
import {toast} from "react-toastify";
import api from "src/apis/api.js";
import useTestData from "../../hooks/useTestData.js";
import {
    getColorButtonBaseOnOption,
    getOptionColorMultiple
} from "../../../public/styles/common/test/TestResultColor.js";

const DetailMultipleChoiceTest = () => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    const {id} = useParams();

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
    } = useTestData(id, "MULTIPLE", {
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

    const countTrueQuestions = () => {
        return questions.reduce((count, q) => {
            return q.answerList.filter((a) => a.true === true && q.answerId === a.id).length > 0 ?
                count + 1 : count;
        }, 0);
    }

    const countFalseQuestions = () => {
        return questions.reduce((count, q) => {
            return q.answerList.filter((a) => a.true === true && q.answerId && q.answerId !== a.id).length > 0 ?
                count + 1 : count
        }, 0);
    };

    const countNullAnswerQuestions = () => {
        return questions.reduce((count, q) => {
            return q.answerId === undefined || q.answerId === null ? count + 1 : count;
        }, 0);
    }

    const getStringNofity = () => {
        if (countTrueQuestions() < goalScore) {
            return "Oh, I think you should learn this set again, then take a new exam.";
        }
        return "Congratulations, your score is over your goal! Keep doing great.";
    };

    const prefixAnswer = ["A. ", "B. ", "C. ", "D. ", "E. ", "F. "];

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
                                Multiple choice test {title}
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
                                                    backgroundColor: getColorButtonBaseOnOption(q, num + 1 === activeQuestion)
                                                        .backgroundColor,
                                                    "&:hover": getColorButtonBaseOnOption(q, num + 1 === activeQuestion).hoverColor,
                                                    color: getColorButtonBaseOnOption(q, num + 1 === activeQuestion).textColor,
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
                                                        getStringNofity()
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
                                                        <div className={styles.optionsTopRow}>
                                                            {question.answerList.slice(0, Math.ceil(question.answerList.length / 2))
                                                                .map((option, index) => (
                                                                    <Button
                                                                        key={option.id}
                                                                        onClick={() => {
                                                                        }}
                                                                        aria-pressed={question.answerId === option.id &&
                                                                            option.true}
                                                                        sx={{
                                                                            borderRadius: "10px",
                                                                            textTransform: "none",
                                                                            backgroundColor: getOptionColorMultiple(option, question),
                                                                            textWrap: "wrap",
                                                                            padding: "1.8rem 0.9375rem",
                                                                            flex: index === (Math.ceil(question.answerList.length / 2) - 1) ?
                                                                                "1" : `0 0 ${100 / Math.ceil(question.answerList.length / 2)}%`,
                                                                            font: "inherit",
                                                                            color: "inherit",
                                                                            border: option.true ?
                                                                                "0.125rem solid rgb(1, 3, 30)" : ""
                                                                        }}
                                                                    >
                                                                        <div dangerouslySetInnerHTML={{
                                                                            __html: textToHtml(prefixAnswer[index] + extractAnswer(option.answer))
                                                                        }}/>
                                                                    </Button>
                                                                ))}
                                                        </div>
                                                        <div className={styles.optionsBottomRow}>
                                                            {question.answerList.slice(Math.ceil(question.answerList.length / 2))
                                                                .map((option, index) => (
                                                                    <Button
                                                                        key={option.id}
                                                                        onClick={() => {
                                                                        }}
                                                                        sx={{
                                                                            borderRadius: "10px",
                                                                            textTransform: "none",
                                                                            backgroundColor: getOptionColorMultiple(option, question),
                                                                            textWrap: "wrap",
                                                                            padding: "1.8rem 0.9375rem",
                                                                            font: "inherit",
                                                                            color: "inherit",
                                                                            flex: index === (Math.floor(question.answerList.length / 2) - 1) ?
                                                                                "1" : `0 0 ${100 / Math.floor(question.answerList.length / 2)}%`,
                                                                            border: option.true ?
                                                                                "0.125rem solid rgb(1, 3, 30)" : ""
                                                                        }}
                                                                    >
                                                                        <div dangerouslySetInnerHTML={{
                                                                            __html: textToHtml(prefixAnswer[Math.ceil(question.answerList.length / 2) + index] + extractAnswer(option.answer))
                                                                        }}/>
                                                                    </Button>
                                                                ))}
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

export default DetailMultipleChoiceTest;