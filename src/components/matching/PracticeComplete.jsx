import { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../apis/api";

export default function PracticeComplete() {
    const [selectedEmoji, setSelectedEmoji] = useState(null);
    const [matchingData, setMatchingData] = useState([]);
    const [searchParams] = useSearchParams()
    const setId = searchParams.get("setId")
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMatchingData = async () => {
            try {
                const response = await api.get('/v1/matching');
                setMatchingData(response.data);
            } catch (error) {
                console.error("Error fetching matching data:", error);
            }
        };

        fetchMatchingData();
    }, []);

    const handleRestart = () => {
        window.location.href = `/matching?setId=${setId}&new=1`;
    }

    // Calculate total wrongCount
    const totalWrongCount = matchingData.reduce((sum, item) => sum + (item.wrongCount || 0), 0);

    // Calculate total rounds
    const totalRounds = matchingData.reduce((acc, item) => {
        if (!acc.includes(item.roundNumber)) {
            acc.push(item.roundNumber);
        }
        return acc;
    }, []).length;

    return (
        <div className="min-h-screen bg-[#ededff] flex flex-col">
            <header className="w-full fixed z-50 top-0 px-6 flex items-center justify-between h-[4.8125rem] bg-[#ededff] shadow-[0px_10px_60px_0px_rgba(0,0,0,0.15)]">
                <button
                    className="rounded border-0 py-1 px-2"
                    onClick={() => navigate(-1)}
                >
                    <IoIosArrowBack />
                </button>
                <b className="text-xl">Trắc nghiệm</b>
                <button className="border-0 rounded py-1 px-2">
                    Set of {totalRounds * 5}
                </button>
            </header>

            {/* Main content */}
            <div className="flex-1 flex flex-col md:flex-row pt-[4.8125rem] items-center justify-center gap-12 px-4">
                {/* Left side - Congratulations */}
                <div className="flex flex-col items-center justify-center p-6 text-center max-w-3xl">
                    <div className="relative mb-4">
                        <div className="text-[#0e22e9] text-3xl md:text-4xl font-bold tracking-wider">
                            CONGRATULATIONS!
                        </div>
                        {/* Confetti decorations */}
                        <div className="absolute -top-10 -left-10 text-[#0e22e9] opacity-50">
                            ✨ 🎉
                        </div>
                        <div className="absolute -top-8 right-0 text-[#0e22e9] opacity-50">
                            🎊 ✨
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mt-6 mb-4">
                        You are doing great,
                        <br />
                        keep learning!
                    </h2>

                    <button className="bg-[#0e22e9] text-white font-semibold py-3 px-6 rounded-full text-base w-full max-w-xs border-0">
                        Continue to next round
                    </button>
                </div>

                {/* Right side - Stats */}
                <div className="flex flex-col gap-4 max-w-md">
                    {/* Satisfaction */}
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <h3 className="font-semibold mb-4">Satisfy with your work?</h3>
                        <div className="flex justify-between">
                            {["😄", "😊", "😐", "😢", "😭"].map((emoji, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedEmoji(index)}
                                    className={`text-2xl p-2 rounded-full transition-all border-0 ${
                                        selectedEmoji === index ? "bg-[#e0e0fe] scale-110" : ""
                                    }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs mt-1 px-1">
                            <span>Satisfied</span>
                            <span>Not at all</span>
                        </div>
                    </div>

                    <div className="bg-[#f5b2b2] rounded-xl p-4 flex justify-between items-center">
                        <span className="font-semibold">Wrong match</span>
                        <span className="text-3xl font-bold text-[#e73d3d]">{totalWrongCount}</span>
                    </div>

                    {/* Restart */}
                    <div className="bg-[#e0e0fe] rounded-xl p-4 shadow-sm cursor-pointer" onClick={()=> handleRestart()}>
                        <h3 className="font-semibold">Restart matching</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Do it again and memorize better.
                        </p>
                        <button className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm border-0">
                            {matchingData.length} terms
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}