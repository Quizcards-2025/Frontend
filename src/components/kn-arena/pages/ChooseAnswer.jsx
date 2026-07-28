import React, {useEffect, useState} from 'react';
import {IoIosArrowBack} from 'react-icons/io';
import BackgroundBlue from 'src/components/kn-arena/background/background-blue.jsx';
import {getYourProfile} from 'src/services/AuthenticationService.js';
import {Link} from "react-router-dom";

export default function ChooseAnswer({listQuestion, time, sendAnswer, onStepComplete}) {
    useEffect(() => {
        console.log(listQuestion)
    }, [listQuestion])
    const [fadeState, setFadeState] = useState('opacity-100 scale-100');
    const colors = ['#d34d4d', '#52c65d', '#69bde6', '#d1d83e'];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(time);
    const [startTime, setStartTime] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [isShowingAnswer, setIsShowingAnswer] = useState(false);

    const fetchProfile = async () => {
        const userProfile = await getYourProfile();
        // console.log("User Profile: ", userProfile);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const moveToNextQuestion = () => {
        setFadeState('opacity-0 scale-50');
        setTimeout(() => {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            setIsShowingAnswer(false);
            setFadeState('opacity-100 scale-100');
        }, 300);
    };
    useEffect(() => {
        setStartTime(performance.now());
        setTimeLeft(time);
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    const data = listQuestion[currentIndex].answer_list.find((item) => item.isTrue === true).answer;
                    setCorrectAnswer(data);
                    setIsShowingAnswer(true);

                    if (currentIndex === listQuestion.length - 1) {
                        setTimeout(() => {
                            console.log("useEffect phia trennnnn")
                            onStepComplete(3);
                        }, 1000);
                    } else {

                        setTimeout(() => moveToNextQuestion(), 1000);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex, time]);

    // useEffect(() => {
    //     if (!listQuestion.length || !listQuestion[0]?.ka_question_id) {
    //         return;
    //     }
    //     setStartTime(performance.now());
    //     setTimeLeft(time);
    //
    //     const timer = setInterval(() => {
    //         setTimeLeft((prev) => {
    //             if (prev <= 1) {
    //                 clearInterval(timer);
    //                 const data = listQuestion[currentIndex].answer_list.find((item) => item.isTrue === true).answer;
    //                 setCorrectAnswer(data);
    //                 setIsShowingAnswer(true);
    //                 setTimeout(() => {
    //                     console.log(currentIndex);
    //                     if (currentIndex < listQuestion.length - 1) {
    //                         moveToNextQuestion();
    //                     }
    //                 }, 100);
    //                 return 0;
    //             }
    //             return prev - 1;
    //         });
    //     }, 1000);
    //     console.log(currentIndex);
    //     return () => clearInterval(timer);
    // }, [currentIndex, time]);

    const handleSubmitAnswer = (data) => {
        setSelectedAnswer(data.answerId);
        const completionTime = performance.now() - startTime;
        data = {...data, completionTime};
        sendAnswer(data);
    };
    return (
        <BackgroundBlue>
            <div className="absolute left-8 top-8 flex justify-center items-center gap-4">
                <Link to='/user'>
                    <button
                        className="border-none rounded-full size-6 flex justify-center items-center blur-op text-white">
                        <IoIosArrowBack/>
                    </button>
                </Link>

                <time className="text-white font-bold text-2xl">{timeLeft}s</time>
            </div>
            <div className="absolute right-8 top-8 flex justify-center items-center gap-4">
                <strong className="text-white font-bold text-2xl">5</strong>
                <p className="text-white m-0">answer</p>
            </div>
            <div
                className={`w-full p-8 transition-transform transition-opacity duration-700 ease-in-out transform ${fadeState} mt-1`}
            >
                <div className="bg-white my-6 p-4 rounded-lg">
                    <p className="font-bold text-lg">{listQuestion[currentIndex]?.question}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    {listQuestion[currentIndex]?.answer_list &&
                        listQuestion[currentIndex]?.answer_list.map((item, index) => (
                            <button
                                key={item.id}
                                disabled={selectedAnswer !== null || isShowingAnswer}
                                className={`block w-full p-4 rounded-lg border-none min-h-24 font-bold text-white transform transition-transform hover:scale-105
                                 ${selectedAnswer === item.id
                                    ? ''
                                    : selectedAnswer !== null || isShowingAnswer
                                        ? 'opacity-50'
                                        : ''}`}
                                onClick={() => handleSubmitAnswer({
                                    isTrue: item.isTrue,
                                    questionId: listQuestion[currentIndex]?.ka_question_id,
                                    answerId: item.id
                                })}
                                style={{
                                    padding: '16px',
                                    borderRadius: '8px',
                                    minHeight: '96px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    backgroundColor: selectedAnswer === item.id
                                        ? (item.isTrue ? 'green' : 'red')
                                        : correctAnswer === item.id
                                            ? 'green'
                                            : selectedAnswer !== null
                                                ? 'lightgray'
                                                : colors[index % colors.length],
                                    transition: 'transform 0.2s',
                                    transform: selectedAnswer === item.id ? 'scale(1.0)' : 'scale(0.9)',
                                }}
                            >
                                {item.answer}
                            </button>
                        ))}
                </div>
                {isShowingAnswer && (
                    <div className="flex mt-4 p-4 bg-green-100 rounded-lg gap-3">
                        <strong className="text-green-700">Correct Answer:</strong>
                        <span>{correctAnswer}</span>
                    </div>
                )}
            </div>
        </BackgroundBlue>
    );
}
