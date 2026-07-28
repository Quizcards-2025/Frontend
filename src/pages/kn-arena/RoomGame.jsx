import SettingRoom from "src/pages/kn-arena/SettingRoom.jsx";
import React, {useEffect, useRef, useState} from "react";
import CountDown from "src/components/kn-arena/pages/CountDown.jsx";
import ChooseAnswer from "src/components/kn-arena/pages/ChooseAnswer.jsx";
import {createAnswer, getExam, getSetting, submitAnswer} from "src/services/KaService.js";
import {useParams} from "react-router-dom";
import Ranking from "src/components/kn-arena/pages/Ranking.jsx";
import api from "src/apis/api.js";
import Podium from "src/components/kn-arena/pages/Podium.jsx";


function RoomGame({props}) {
    const {id} = useParams();
    const questionsRef = useRef([]);
    const [questions, setQuestions] = useState([]);
    const [step, setStep] = useState(1);
    const [require, setRequire] = useState(null);
    const [ranking, setRanking] = useState([]);
    const fetchRequire = async () => {
        try {
            const data = await getSetting(id);
            setRequire(data);
            console.log("Require data fetched:", data);
        } catch (error) {
            console.error("Error fetching require:", error);
        }
    };
    const fetchExam = async () => {
        try {
            console.log(id);
            const data = await getExam(id);
            if (Array.isArray(data)) {
                data.forEach((question) => {
                    question.answer_list = JSON.parse(question.answer_list);
                });
                questionsRef.current = data; // Cập nhật giá trị của ref
                console.log("Exam data fetched (from ref):", questionsRef.current);
            } else {
                console.warn("Invalid data format received from getExam:", data);
            }
        } catch (error) {
            console.error("Error fetching exam:", error);
        }
    };
    useEffect(() => {
        fetchExam();
        fetchRequire();
        if (id === "1") {
            setStep(1);
        } else if (id === "2") {
            setStep(2);
        } else if (id === "3") {
            setStep(3);
        } else {
            console.warn("Invalid id in query params");
        }
    }, [id]);
    const handleFetch = () => {
        fetchExam();
        fetchRequire();
    }
    useEffect(() => {
        console.log("Updated questions:", questions);
    }, [questions]);
    const handleSubmitAnswer = async (data) => {
        try {
            const updateData = {...data, pinCode: id};
            // console.log(updateData);
            const response = await submitAnswer(updateData);
            if (response.status === 200) {
                console.log(response);
            }
        } catch
            (error) {
            console.log(error);
        }
    }
    const handleStepCompleted = (data) => {
        setStep(data);
    };
    const fetchRank = async () => {
        try {
            // const response = await api.get(`http://localhost:8080/api/v1/ka/ranking/${id}`);
            const response = await api.get(`/v1/ka/ranking/${id}`);
            setRanking(response.data);
            console.log(response.data);
        } catch (e) {
            console.log(e);
        }
    }
    useEffect(() => {
        console.log(step);
        if (step == 3) {
            fetchRank();
        }
    }, [step]);

    return (
        <>
            {/*<button onClick={handleFetch}>fetch</button>*/}
            {
                step === 1 && (
                    <CountDown onStepComplete={handleStepCompleted}/>
                )
            }
            {
                step === 2 && (
                    <ChooseAnswer listQuestion={questionsRef.current}
                                  time={require?.time_per_question}
                                  sendAnswer={handleSubmitAnswer}
                                  onStepComplete={handleStepCompleted}
                    />
                )
            }
            {
                step === 3 && (
                    <Podium list={ranking}/>
                )
            }

        </>
    )
}

export default RoomGame;