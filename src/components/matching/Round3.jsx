import React from 'react'

export const Round3 = ({
                           groupedByRound,
                           currentRound,
                           shuffledAnswers,
                           selectedQuestion,
                           selectedAnswer,
                           incorrectPair,
                           setSelectedQuestion,
                           setSelectedAnswer
                       }) => {
    // Kết hợp dữ liệu từ Round 3 và Round 1
    const combinedData = [
        ...(groupedByRound?.[currentRound] || []),
        ...(groupedByRound?.['ROUND_1'] || []).map(item => ({
            ...item,
            isCorrect: false // Explicitly set isCorrect to false for Round 1 items
        }))
    ];

    return (
        <div className="grid grid-cols-3 gap-4 w-11/12 mx-auto mt-12">
            {/* Cột 1 - Câu hỏi */}
            <div className="flex flex-col gap-4">
                {groupedByRound?.[currentRound]?.map((item, index) => (
                    <div
                        key={item.matchingId}
                        className={`flex gap-2 cursor-pointer transition-all duration-300 rounded-full
                            ${item.isCorrect ? "bg-[#e0e0fe] text-transparent pointer-events-none" : ""}
                            ${incorrectPair.question === index ? "bg-red-200" : selectedQuestion === index ? "bg-violet-200 scale-[1.02]" : "hover:bg-violet-50"}`}
                        onClick={() => {
                            if (!item.isCorrect) {
                                setSelectedQuestion(index)
                            }
                        }}
                    >
                        <span
                            className={`w-20 h-16 flex items-center rounded-2xl shadow-[0px_3px_0px_0px_rgba(186,190,253,1.00)] border-2 border-solid
                                ${
                                incorrectPair.question === index
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
                            className={`w-full flex items-center px-4 h-16 rounded-2xl shadow-md border-2 border-solid
                                ${
                                incorrectPair.question === index
                                    ? "bg-red-100 border-red-500"
                                    : selectedQuestion === index
                                        ? "bg-[#E0E0FE] border-violet-400 border-solid"
                                        : "bg-[#ededff] border-violet-200"
                            }`}
                        >
                            {item.flashcard.question.split("\n\n")[0]}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cột 2 và 3 - Câu trả lời (Được xáo trộn) */}
            {[0, 1].map((columnIndex) => (
                <div key={columnIndex} className="flex flex-col gap-4">
                    {shuffledAnswers
                        .filter((_, index) =>
                            index >= columnIndex * (combinedData.length / 2) &&
                            index < (columnIndex + 1) * (combinedData.length / 2)
                        )
                        .map((originalIndex, localIndex) => {
                            const index = columnIndex * (combinedData.length / 2) + localIndex
                            const item = combinedData[originalIndex]

                            return item ? (
                                <div
                                    key={item.matchingId}
                                    className={`flex gap-2 cursor-pointer transition-all duration-300 rounded-full
                                        ${item.isCorrect ? "bg-[#e0e0fe] text-transparent pointer-events-none" : ""}
                                        ${incorrectPair.answer === index ? "bg-red-200" : selectedAnswer === index ? "bg-violet-200 scale-[1.02]" : "hover:bg-violet-50"}`}
                                    onClick={() => {
                                        if (!item.isCorrect) {
                                            setSelectedAnswer(index)
                                        }
                                    }}
                                >
                                    <span
                                        className={`w-20 h-16 flex items-center rounded-2xl shadow-[0px_3px_0px_0px_rgba(186,190,253,1.00)] border-2 border-solid
                                            ${
                                            incorrectPair.answer === index
                                                ? "bg-red-500 text-white border-red-600"
                                                : selectedAnswer === index
                                                    ? "bg-violet-500 text-white border-violet-600"
                                                    : "bg-[#ededff] text-violet-300 border-violet-300"
                                        } 
                                            text-center justify-center text-3xl font-bold`}
                                    >
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <div
                                        className={`w-full flex items-center px-4 h-16 rounded-2xl shadow-md border-2 border-solid
                                            ${
                                            incorrectPair.answer === index
                                                ? "bg-red-100 border-red-500"
                                                : selectedAnswer === index
                                                    ? "bg-[#E0E0FE] border-violet-400 border-solid"
                                                    : "bg-[#ededff] border-violet-200"
                                        }`}
                                    >
                                        {item.flashcard.answer.split("\n\n")[0]}
                                    </div>
                                </div>
                            ) : null
                        })
                    }
                </div>
            ))}
        </div>
    );
};