import React from 'react'
import api from '../../apis/api';
import { removeNewlines } from '../../utils/HtmlAndFileUtils';
import { SiAudiomack } from "react-icons/si";
import {useSpeakText} from "src/context/SpeakTextContext.jsx";


export const Round2 = ({
                           groupedByRound,
                           currentRound,
                           shuffledAnswers,
                           selectedQuestion,
                           selectedAnswer,
                           incorrectPair,
                           setSelectedQuestion,
                           setSelectedAnswer
                       }) => {
    const { audioRef, onPlaySound } = useSpeakText();

    const handleAudioPlay = async (text) => {
        // await api.post("http://localhost:8080/api/v1/speech", removeNewlines(text));
        // await api.post("/v1/speech", removeNewlines(text));
        try {
            await onPlaySound(removeNewlines(text));
        } catch (error) {
            console.error("Error playing audio:", error);
        }
    }


    const heights = [
        "12%", "65%", "38%", "90%", "20%",
        "85%", "47%", "73%", "10%", "95%",
        "30%", "50%", "78%", "25%", "100%",
        "40%", "88%", "15%", "62%", "5%"
    ];
    return (
        <div className="grid grid-cols-2 gap-4 w-11/12 mx-auto mt-12">
            {/* Column 1 - Questions */}
            <div className="flex flex-col gap-4">
                {groupedByRound?.[currentRound]?.map((item, index) => (
                    <div
                        key={item.matchingId}
                        className={`flex gap-2 cursor-pointer transition-all duration-300 rounded-full
                            ${item.isCorrect ? "opacity-20 pointer-events-none" : ""}
                            ${incorrectPair.question === index ? "bg-red-200" : selectedQuestion === index ? "bg-violet-200 scale-[1.02]" : "hover:bg-violet-50"}`}
                        onClick={() => {
                            if (!item.isCorrect) {
                                setSelectedQuestion(index)
                            }
                        }}
                    >
                        <span
                            className={`w-20 h-16 flex items-center rounded-2xl shadow-[0px_3px_0px_0px_rgba(186,190,253,1.00)] border-2 border-solid
                                ${incorrectPair.question === index
                                ? "bg-red-500 text-white border-red-600"
                                : selectedQuestion === index
                                    ? "bg-violet-500 text-white border-violet-600"
                                    : "bg-[#ededff] text-violet-300 border-violet-300"
                            } 
                                text-center justify-center text-3xl font-bold`}
                        >
                            {index + 1}
                        </span>
                        <div
                            className={`w-full flex items-center px-4 h-16 rounded-2xl shadow-md border-2 justify-center border-solid
                                ${incorrectPair.question === index
                                ? "bg-red-100 border-red-500"
                                : selectedQuestion === index
                                    ? "bg-[#E0E0FE] border-violet-400 border-solid"
                                    : "bg-[#ededff] border-violet-200"
                            }`}
                            onClick={() => handleAudioPlay(item.flashcard.question)}
                        >
                            <div className="flex items-center justify-center h-8 gap-1 w-full">
                                {heights.map((height, i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-[#babefd] opacity-80"
                                        style={{
                                            height: height,
                                            minHeight: "4px",
                                        }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Column 2 - Answers (Shuffled) */}
            <div className="flex flex-col gap-4">
                {shuffledAnswers.map((originalIndex, shuffledIndex) => {
                    const item = groupedByRound?.[currentRound]?.[originalIndex]
                    return item ? (
                        <div
                            key={item.matchingId}
                            className={`flex gap-2 cursor-pointer transition-all duration-300 rounded-full
                                ${item.isCorrect ? "opacity-20 pointer-events-none" : ""}
                                ${incorrectPair.answer === shuffledIndex ? "bg-red-200" : selectedAnswer === shuffledIndex ? "bg-violet-200 scale-[1.02]" : "hover:bg-violet-50"}`}
                            onClick={() => {
                                if (!item.isCorrect) {
                                    setSelectedAnswer(shuffledIndex)
                                }
                            }}
                        >
                            <span
                                className={`w-20 h-16 flex items-center rounded-2xl shadow-[0px_3px_0px_0px_rgba(186,190,253,1.00)] border-2 border-solid
                                    ${incorrectPair.answer === shuffledIndex
                                    ? "bg-red-500 text-white border-red-600"
                                    : selectedAnswer === shuffledIndex
                                        ? "bg-violet-500 text-white border-violet-600"
                                        : "bg-[#ededff] text-violet-300 border-violet-300"
                                } 
                                    text-center justify-center text-3xl font-bold`}
                            >
                                {String.fromCharCode(65 + shuffledIndex)}
                            </span>
                            <div
                                className={`w-full flex items-center px-4 h-16 rounded-2xl shadow-md border-2 border-solid
                                    ${incorrectPair.answer === shuffledIndex
                                    ? "bg-red-100 border-red-500"
                                    : selectedAnswer === shuffledIndex
                                        ? "bg-[#E0E0FE] border-violet-400 border-solid"
                                        : "bg-[#ededff] border-violet-200"
                                }`}
                            >
                                {item.flashcard.answer.split("\n\n")[0]}
                            </div>
                        </div>
                    ) : null
                })}
            </div>

            <audio
                ref={audioRef}
                controls
                style={{
                    height: "40px",
                }}
                hidden
            />
        </div>
    );
};