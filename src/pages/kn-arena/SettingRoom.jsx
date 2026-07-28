import React, {useState, useEffect} from 'react';
import {IoIosArrowBack} from "react-icons/io";
import {Link, useNavigate, useLocation} from "react-router-dom";
import api from "src/apis/api.js";
import {toast} from "react-toastify";

export default function SettingRoom() {
    const [numQuestions, setNumQuestions] = useState('');
    const [title, setTitle] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [roomName, setRoomName] = useState('');
    const [timePerQuestion, setTimePerQuestion] = useState(5);
    const [maxJoiners, setMaxJoiners] = useState('');
    const [maxCards, setMaxCards] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const setID = queryParams.get('setId');
    const [error, setError] = useState({errJoiner: '', errQuestion: ''});
    useEffect(() => {
        const fetchSetDetails = async () => {
            try {
                // const response = await api.get(`http://localhost:8080/api/v1/set/detail/${setID}`);
                const response = await api.get(`/v1/set/detail/${setID}`);
                // console.log(response.data);
                setTitle(response.data.title);
                setMaxCards(response.data.totalCard);
            } catch (error) {
                console.error('Error fetching set details:', error);
            }
        };
        console.log(maxCards);
        fetchSetDetails();
    }, [setID]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (parseInt(numQuestions) > maxCards) {
            setError(prevError => ({...prevError, errQuestion: `Number of questions cannot exceed ${maxCards}`}));
            return;
        }
        if (parseInt(maxJoiners) > 10 || parseInt(maxJoiners) < 2) {
            setError(prevError => ({
                ...prevError,
                errJoiner: `Number of joiners cannot exceed ${10} or must be greater than 1`
            }));
            return;
        }
        try {
            const requestBody = {
                setId: setID,
                roomName: roomName,
                numQuestions: parseInt(numQuestions),
                timePerQuestion: parseInt(timePerQuestion),
                maxJoiners: parseInt(maxJoiners),
            };
            // const response = await api.post('http://localhost:8080/api/v1/ka/room/create', requestBody);
            const response = await api.post('/v1/ka/room/create', requestBody);
            console.log(response);
            if (response.status === 201) {
                setPinCode(response.data.data.pin_code);
                toast.success(response.data.message);
                console.log(response.data.message);
            }
        } catch (error) {
            toast.error(error.response.data);
            console.error('Error creating room:', error);
        }
    };

    const handleNumberInput = (e, setter) => {
        const value = e.target.value;

        if (/^[1-9]\d*$/.test(value) || value === '') {
            setter(value);
            setError('');
        }
    };
    useEffect(() => {
        if (pinCode !== "") {
            navigate(`/arena/room-code?id=3&room-code=${pinCode}`);
            console.log(pinCode);
        }

    }, [pinCode]);
    return (
        <div className="absolute inset-0 flex justify-center items-center">
            <Link to="/arena">
                <div
                    className='text-white flex items-center gap-2 absolute left-8 top-8 border border-solid p-2.5 rounded-full blur-op'>
                    <IoIosArrowBack/> Back to menu
                </div>
            </Link>
            <div className="w-1/3 mx-auto my-auto bg-white p-6 rounded-lg shadow-lg mb-3">
                <h2 className="text-center text-xl font-bold mb-4">SETTING ROOM</h2>
                <h5 className="text-center text-xl font-bold mb-4">{title}</h5>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">Room Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">Number of Questions</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg"
                            value={numQuestions}
                            onChange={(e) => handleNumberInput(e, setNumQuestions)}
                            max={maxCards}
                            required
                        />
                        <small className="text-gray-600">Max questions: {maxCards}</small>
                        {error.errQuestion && <div className="text-red-500 text-sm">{error.errQuestion}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">Time per Question</label>
                        <select
                            className="w-full px-4 py-2 border rounded-lg"
                            value={timePerQuestion}
                            onChange={(e) => setTimePerQuestion(e.target.value)}
                            required
                        >
                            {[5, 10, 15, 20, 30].map((time) => (
                                <option key={time} value={time}>
                                    {time} seconds
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">Max participants</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg"
                            value={maxJoiners}
                            onChange={(e) => handleNumberInput(e, setMaxJoiners)}
                            max={10}
                            required
                        />
                        <small className="text-gray-600">Max participants: 10</small>
                        {error.errJoiner && <div className="text-red-500 text-sm">{error.errJoiner}</div>}
                    </div>
                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create room
                    </button>
                </form>
            </div>
        </div>
    );
}
