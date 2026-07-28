import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "src/apis/api.js";

const useTestData = (id, expectedTestMode, redirectPaths) => {
    // expectedTestMode: "ESSAY" hoặc "MULTIPLE"
    // redirectPaths: ví dụ { essay: `/detail-test/es/${id}`, multiple: `/detail-test/mul/${id}` }
    const navigate = useNavigate();

    const [setId, setSetId] = useState(null);
    const [title, setTitle] = useState("temp");
    const [goalScore, setGoalScore] = useState(0);
    const [totalQuestion, setTotalQuestion] = useState(0);
    const containerTestRef = useRef(null);
    const progressRef = useRef(null);
    const [activeQuestion, setActiveQuestion] = useState(1);
    const [isTestDone, setIsTestDone] = useState(true);
    const [createdAt, setCreatedAt] = useState(null);
    const [endAt, setEndedAt] = useState(null);
    const [questions, setQuestions] = useState([]);

    const fetchTestData = async () => {
        try {
            const resTestData = await api.get(`/v1/test/user/get-detail-by-test-id/${id}`);
            const { testModeName } = resTestData.data;
            if (testModeName !== expectedTestMode) {
                // Nếu testMode không đúng, chuyển hướng sang route tương ứng
                if (testModeName === "ESSAY") {
                    navigate(redirectPaths.essay);
                } else if (testModeName === "MULTIPLE") {
                    navigate(redirectPaths.multiple);
                }
            }
            setCreatedAt(resTestData.data.createdAt);
            setEndedAt(resTestData.data.endAt);
            setTitle(resTestData.data.setTitle);
            setSetId(resTestData.data.setId);
            setTotalQuestion(resTestData.data.totalScore);
            setGoalScore(resTestData.data.goalScore);
            setQuestions(resTestData.data.questions);
            setIsTestDone(resTestData.data.isEnded || new Date(resTestData.data.endAt) < new Date());
        } catch (err) {
            toast.error("Error: Cannot fetch test data");
            if (err.response && err.response.status === 404) {
                toast.error("ERROR: Test not found");
                navigate("/");
            }
        }
    };

    useEffect(() => {
        fetchTestData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        id,
        setId,
        title,
        goalScore,
        totalQuestion,
        containerTestRef,
        progressRef,
        activeQuestion,
        setActiveQuestion,
        isTestDone,
        createdAt,
        endAt,
        questions,
    };
};

export default useTestData;