import {useEffect, useState, useRef, useMemo} from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import api from "../../apis/api"
import { IoIosArrowBack } from "react-icons/io"
import { Round1 } from "../../components/matching/Round1"
import { Round2 } from "../../components/matching/Round2"
import { Round3 } from "../../components/matching/Round3"
import PracticeComplete from "../../components/matching/PracticeComplete"
import {useStreakBackgroundContext} from "src/context/StreakBackgroundContext.jsx";

export default function Matching() {
    const [data, setData] = useState([])
    const [searchParams] = useSearchParams()
    const [currentRound, setCurrentRound] = useState("ROUND_1")
    const [selectedQuestion, setSelectedQuestion] = useState(null)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [isGameCompleted, setIsGameCompleted] = useState(false)
    const [correctAnswers, setCorrectAnswers] = useState(0)
    const [shuffledAnswers, setShuffledAnswers] = useState([])
    const [incorrectPair, setIncorrectPair] = useState({ question: null, answer: null })
    const processedWrongAnswersRef = useRef(new Set())
    const isProcessingRef = useRef(false)
    const navigate = useNavigate()
    const setId = searchParams.get("setId")
    const newMatching = searchParams.get("new")

    const {updateStreak, showingModalStreakBackground} = useStreakBackgroundContext();

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (newMatching == 1) {
                    await api.post(`/v1/matching/${setId}`)
                    const newParams = new URLSearchParams(searchParams)
                    newParams.delete("new")
                    navigate(`?${newParams.toString()}`, { replace: true })
                }
                const response = await api.get(`/v1/matching`)
                setData(response.data)

                // Check if ROUND_1 has more than 5 items
                const round1Items = response.data.filter(item => item.roundNumber === "ROUND_1")
                if (round1Items.length > 5) {
                    await api.post(`/v1/matching/${setId}`)
                    const updatedResponse = await api.get(`/v1/matching`)
                    setData(updatedResponse.data)
                }
            } catch (error) {
                console.error("Error fetching data:", error)
            }
        }

        fetchData()
    }, [])

    // Group data by round
    const groupedByRound = data.reduce((acc, item) => {
        const round = item.roundNumber
        if (!acc[round]) {
            acc[round] = []
        }
        acc[round].push(item)
        return acc
    }, {})

    // Shuffle answers when round changes or data loads
    useEffect(() => {
        if (groupedByRound[currentRound] && groupedByRound[currentRound].length > 0) {
            let answers = [...groupedByRound[currentRound]];

            if (currentRound === "ROUND_3" && groupedByRound["ROUND_1"]) {
                answers = [...answers, ...groupedByRound["ROUND_1"]]; // Nhân đôi số câu trả lời
            }

            if (shuffledAnswers.length === 0 || shuffledAnswers.length !== answers.length) {
                const indices = [...Array(answers.length).keys()];
                for (let i = indices.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [indices[i], indices[j]] = [indices[j], indices[i]];
                }
                setShuffledAnswers(indices);
            }
        }
    }, [currentRound, groupedByRound, shuffledAnswers.length]);

    // Check round completion and progress
    useEffect(() => {
        if (groupedByRound[currentRound]) {
            const isRoundCompleted = groupedByRound[currentRound].every((item) => item.isCorrect)

            if (isRoundCompleted) {
                const rounds = Object.keys(groupedByRound)
                const currentRoundIndex = rounds.indexOf(currentRound)

                if (currentRoundIndex < rounds.length - 1) {
                    // Move to next round and reset progress
                    setCurrentRound(rounds[currentRoundIndex + 1])
                    setSelectedQuestion(null)
                    setSelectedAnswer(null)
                } else {
                    // All rounds completed
                    setIsGameCompleted(true);
                    updateStreak().then(r => {
                        showingModalStreakBackground();
                    }).catch(err => {
                        console.error("Error");
                    });
                }
            }
        }
    }, [data, currentRound, groupedByRound])

    // Check if selected question and answer form a pair
    useEffect(() => {
        if (selectedQuestion !== null && selectedAnswer !== null && !isProcessingRef.current) {
            const questionItem = groupedByRound?.[currentRound]?.[selectedQuestion]
            // Get the actual item from the shuffled index
            const actualAnswerIndex = shuffledAnswers[selectedAnswer]
            const answerItem = groupedByRound?.[currentRound]?.[actualAnswerIndex]

            if (questionItem && answerItem && questionItem.flashcard.answer === answerItem.flashcard.answer) {
                // Correct match
                setCorrectAnswers(questionItem.matchingId)
                // Update the data to mark items as correct
                setData((prevData) =>
                    prevData.map((item) => {
                        if (item.matchingId === questionItem.matchingId || item.matchingId === answerItem.matchingId) {
                            return { ...item, isCorrect: true }
                        }
                        return item
                    }),
                )
            } else {
                // Incorrect match - set the incorrect pair
                setIncorrectPair({ question: selectedQuestion, answer: selectedAnswer })

                // Call API for incorrect answer
                if (questionItem) {
                    isProcessingRef.current = true
                    const fetchData = async () => {
                        try {
                            await api.put(`/v1/matching/wrong/${questionItem.matchingId}`)
                        } catch (error) {
                            console.error("Error updating wrong answer:", error)
                        } finally {
                            isProcessingRef.current = false
                        }
                    }
                    fetchData()
                }

                // Reset incorrect pair after 0.5 seconds
                setTimeout(() => {
                    setIncorrectPair({ question: null, answer: null })
                }, 500)
            }

            // Reset selections after a short delay
            setTimeout(() => {
                setSelectedQuestion(null)
                setSelectedAnswer(null)
            }, 500)
        }
    }, [selectedQuestion, selectedAnswer, groupedByRound, currentRound, shuffledAnswers])

    useEffect(() => {
        if (correctAnswers !== 0) {
            const fetchData = async () => {
                try {
                    await api.put(`/v1/matching/${correctAnswers}`)
                } catch (error) {
                    console.error("Error fetching data:", error)
                }
            }

            fetchData()
        }
    }, [correctAnswers])

    // Round selection component
    const RoundSelector = () => {
        const rounds = Object.keys(groupedByRound)

        // Calculate overall progress across all rounds
        let totalItems = 0
        let totalCorrectItems = 0

        // Count total items and correct items across all rounds
        rounds.forEach((round) => {
            const roundItems = groupedByRound[round] || []
            totalItems += roundItems.length
            totalCorrectItems += roundItems.filter((item) => item.isCorrect).length
        })

        // Calculate the overall progress percentage
        const progressPercentage = totalItems > 0 ? (totalCorrectItems / totalItems) * 104 : 0

        // Calculate which segment is active based on current round
        const currentRoundIndex = rounds.indexOf(currentRound)

        return (
            <div className="w-11/12 relative flex items-center h-6 px-3 py-2 bg-[#e0e0fe] rounded-3xl mx-auto text-center font-semibold">
                {/* Progress bar that moves right as rounds are completed */}
                <div
                    className="absolute left-0 h-full bg-violet-300 rounded-3xl transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                />

                {rounds.map((round, index) => {
                    // Calculate position based on even distribution
                    const position = index === 0 ? "left-1/3" : index === 1 ? "left-2/3" : "right-0"

                    return (
                        <div
                            key={round}
                            className={`absolute ${position} bg-[#c4b5fd] text-white rounded-full size-10 flex items-center justify-center cursor-pointer z-10 transition-all duration-300 ${currentRound === round ? "bg-violet-700" : ""
                            }`}
                            onClick={() => setCurrentRound(round)}
                        >
                            {(index + 1) * 5}
                        </div>
                    )
                })}
            </div>
        )
    }


    return (
        <>
            {isGameCompleted && <PracticeComplete  />}
            {!isGameCompleted &&
                <>
                    <header className="w-full fixed z-50 top-0 px-6 flex items-center justify-between h-[4.8125rem] bg-[#ededff] shadow-[0px_10px_60px_0px_rgba(0,0,0,0.15)]">
                        <button className="bg-white rounded border-none py-1 px-2" onClick={() => navigate(-1)}>
                            <IoIosArrowBack />
                        </button>
                        <b className="text-xl">Trắc nghiệm</b>
                        <button className="bg-[#e0e7ff] border-none rounded py-1 px-2">Set of {Object.keys(groupedByRound)?.length * 5}</button>
                    </header>
                    <main className="bg-[#ededff] h-svh mt-16 py-16">
                        <RoundSelector />
                        {currentRound == "ROUND_1" && (
                            <Round1
                                groupedByRound={groupedByRound}
                                currentRound={currentRound}
                                shuffledAnswers={shuffledAnswers}
                                selectedQuestion={selectedQuestion}
                                selectedAnswer={selectedAnswer}
                                incorrectPair={incorrectPair}
                                setSelectedQuestion={setSelectedQuestion}
                                setSelectedAnswer={setSelectedAnswer}
                            />
                        )}
                        {currentRound == "ROUND_2" && (
                            <Round2
                                groupedByRound={groupedByRound}
                                currentRound={currentRound}
                                shuffledAnswers={shuffledAnswers}
                                selectedQuestion={selectedQuestion}
                                selectedAnswer={selectedAnswer}
                                incorrectPair={incorrectPair}
                                setSelectedQuestion={setSelectedQuestion}
                                setSelectedAnswer={setSelectedAnswer}
                            />
                        )}
                        {currentRound == "ROUND_3" && (
                            <Round3
                                groupedByRound={groupedByRound}
                                currentRound={currentRound}
                                shuffledAnswers={shuffledAnswers}
                                selectedQuestion={selectedQuestion}
                                selectedAnswer={selectedAnswer}
                                incorrectPair={incorrectPair}
                                setSelectedQuestion={setSelectedQuestion}
                                setSelectedAnswer={setSelectedAnswer}
                            />
                        )}
                    </main>
                </>
            }
        </>
    )
}
