import React, { useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Slide,
    TextField,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { LuClock1 } from "react-icons/lu";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers";
import api from "src/apis/api.js";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SetupTest = () => {
    const { id } = useParams();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    const [titleSet, setTitleSet] = useState("");
    const [maxQuestion, setMaxQuestion] = useState(0);
    const [totalQuestion, setTotalQuestion] = useState(0);
    const [goalScore, setGoalScore] = useState(0);
    const [selectedTestModeId, setSelectedTestModeId] = useState(1);
    const [typeOfMultipleQuestion, setTypeOfMultipleQuestion] = useState("q-a");
    const [testModes, setTestModes] = useState([]);
    const [hoursTest, setHoursTest] = useState(null);
    const [minutesTest, setMinutesTest] = useState(null);

    const minTime = dayjs().startOf("day").add(5, "minute");
    const maxTime = dayjs().startOf("day").add(5, "hour");
    const [time, setTime] = useState(dayjs().startOf("day").add(5, "minute"));
    const [openPickupTime, setOpenPickupTime] = useState(false);

    const filterTestModeByName = (testModeName) => {
        if (testModes) {
            const result = testModes.filter((tm) => tm.testModeName === "MULTIPLE");
            if (result && result[0]) {
                return result[0];
            }
        }
        return undefined;
    };

    const handleTimeChange = (newTime) => {
        if (newTime && newTime.isValid()) {
            if (newTime.isBefore(minTime)) {
                setTime(minTime);
            } else if (newTime.isAfter(maxTime)) {
                setTime(maxTime);
            } else {
                setTime(newTime);
            }
        }
    };

    const handleClickOpen = () => {
        setOpenPickupTime(true);
    };

    const handleClose = () => {
        setOpenPickupTime(false);
    };

    const handleSubmit = () => {
        setHoursTest(time.hour());
        setMinutesTest(time.minute());
        handleClose();
    };

    const handleTestModesChange = (event) => {
        if (!testModes.filter((tm) => tm.testModeName === "MULTIPLE")) {
            setTypeOfMultipleQuestion(null);
        } else {
            setTypeOfMultipleQuestion("q-a");
        }
        setSelectedTestModeId(parseInt(event.target.value, 10));
    };

    const handleTotalQuestionsChange = (event) => {
        const newTotalQuestion = Math.min(Math.max(event.target.value, 0), maxQuestion);
        setTotalQuestion(newTotalQuestion);
        setGoalScore(Math.min(newTotalQuestion, goalScore));
    };

    const handleGoalQuestionChange = (event) => {
        if (event.target.value > -1 && event.target.value <= totalQuestion) {
            setGoalScore(event.target.value);
        }
    };

    const fetchTestModesData = async () => {
        try {
            const resTestModes = await api.get("/v1/testMode/list");
            if (resTestModes.data) {
                setTestModes(resTestModes.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSetInformation = async (id) => {
        try {
            const resSetData = await api.get(`/v1/set/set-detail/${id}`);
            setMaxQuestion(resSetData.data.data.totalCard);
            setTotalQuestion(resSetData.data.data.totalCard);
            setGoalScore(resSetData.data.data.totalCard);
            setTitleSet(resSetData.data.data.title);
            document.title = `Create test: ${resSetData.data.data.title}`;
        } catch (err) {
            console.error(err);
            toast.error(`Error in set id: ${id}`);
            throw Error("Error while fetching set");
        }
    };

    useEffect(() => {
        if (!Number.parseInt(id, 10)) {
            throw Error("Error: Invalid id");
        }
        fetchSetInformation(id).catch();
        fetchTestModesData().catch();
    }, []);

    const checkInputTest = () => {
        if (!selectedTestModeId) {
            toast.error("Error: You have not selected any test mode.");
            throw new Error("Cannot create test");
        }
        if (!totalQuestion) {
            toast.error("Error: Total questions cannot be zero.");
            throw new Error("Cannot create test");
        }
        if (!goalScore) {
            toast.error("Error: Goal score cannot be zero.");
            throw new Error("Cannot create test");
        }
        if (!(hoursTest || minutesTest)) {
            toast.error("Error: You have not choose time expired on test.");
            throw new Error("Cannot create test");
        }
    };

    const handleToCreateTest = async (event) => {
        event.preventDefault();
        try {
            checkInputTest();
            const isMultiple =
                testModes.filter((tm) => tm.testModeId === selectedTestModeId)[0].testModeName === "MULTIPLE";
            let requestData = {
                testModeId: selectedTestModeId,
                totalQuestion,
                goalScore,
                setId: id,
                remainingTime: `${hoursTest.toString().padStart(2, "0")}:${minutesTest
                    .toString()
                    .padStart(2, "0")}`,
            };
            if (isMultiple) {
                requestData = { ...requestData, typeOfMultipleChoice: typeOfMultipleQuestion };
            }
            const testData = await api.post("/v1/test/create-new-test", requestData);
            toast.success("Created test successfully");
            if (testData.data.testModeName === "MULTIPLE") {
                navigate(`/doing-test/mul/${testData.data.testId}`);
            } else if (testData.data.testModeName === "ESSAY") {
                navigate(`/doing-test/es/${testData.data.testId}`);
            }
        } catch (err) {
            toast.error("Error !!!");
            console.error(err);
        }
    };

    return (
        <>
            {/* Thay thế sử dụng styles.module.scss bằng các lớp Tailwind */}
            <Box
                className="flex flex-col gap-[15px] relative mx-5 p-8 sm:mx-[50px] sm:p-20 lg:mx-[150px] xl:mx-[250px]"
            >
                <h3>
                    <b>Create test: {titleSet}</b>
                </h3>

                <Box className="flex flex-col md:flex-row gap-5 w-full">
                    <Box className="flex flex-col w-full">
                        <Box className="w-full p-4">
                            <p className="text-base">Choose test mode :</p>
                            <select
                                className="w-full h-10 rounded-[15px] border-0 border-b-4 border-[#e0e0fe] p-2"
                                onChange={handleTestModesChange}
                                defaultValue="1"
                            >
                                {testModes.map((tm) => (
                                    <option key={tm.testModeId} value={tm.testModeId}>
                                        {tm.testModeName}
                                    </option>
                                ))}
                            </select>
                        </Box>
                        {testModes &&
                        selectedTestModeId &&
                        filterTestModeByName("MULTIPLE") &&
                        filterTestModeByName("MULTIPLE").testModeId === selectedTestModeId ? (
                            <Box className="w-full p-4">
                                <p className="text-base">Choose type of test multiple choice: </p>
                                <select
                                    className="w-full h-10 rounded-[15px] border-0 border-b-4 border-[#e0e0fe] p-2"
                                    onChange={(event) => setTypeOfMultipleQuestion(event.target.value)}
                                    value={typeOfMultipleQuestion}
                                >
                                    <option value="q-a">Term to Definition</option>
                                    <option value="a-q">Definition to Term</option>
                                    <option value="mix">Mixing</option>
                                </select>
                            </Box>
                        ) : (
                            <Box className="w-full p-4"></Box>
                        )}
                    </Box>
                    <Box className="flex flex-col w-full">
                        <Box className="w-full p-4">
                            <p className="text-base">
                                Total Question (max: {maxQuestion} cards)
                            </p>
                            <input
                                type="number"
                                style={{
                                    padding: "1.25rem",
                                }}
                                className="border-2 border-black h-5 w-full font-bold text-[15px] rounded-[15px]"
                                value={totalQuestion}
                                onChange={handleTotalQuestionsChange}
                                placeholder="Give a max questions."
                            />
                        </Box>
                        <Box className="w-full p-4">
                            <p className="text-base">
                                Goal score{totalQuestion !== 0 ? ` (max: ${totalQuestion}):` : ":"}
                            </p>
                            <input
                                type="number"
                                style={{
                                    padding: "1.25rem",
                                }}
                                className="border-2 border-black h-5 w-full font-bold text-[15px] rounded-[15px]"
                                value={goalScore}
                                onChange={handleGoalQuestionChange}
                                placeholder="Give a max goal."
                            />
                        </Box>
                        <Box className="w-full pt-1">
                            <button
                                className="flex items-center justify-around bg-white rounded-[15px] h-10 w-2/5 border-0 border-b-4 border-[#e0e0fe] cursor-pointer float-right mr-4"
                                onClick={handleClickOpen}
                            >
                                <LuClock1 size={24} />
                                {hoursTest !== null && minutesTest !== null ? (
                                    <span>
                    {hoursTest.toString().padStart(2, "0")} hours:
                                        {minutesTest.toString().padStart(2, "0")} minutes
                  </span>
                                ) : (
                                    <span>Choosing timeout</span>
                                )}
                            </button>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Button
                variant="contained"
                tabIndex={0}
                aria-label="Publish set"
                sx={{
                    position: "fixed",
                    bottom: "30px",
                    right: "50px",
                    borderRadius: "0.9375rem",
                    backgroundColor: "rgba(14, 34, 233, 1)",
                    zIndex: 50,
                    padding: {
                        xs: "0.5rem 1rem",
                        sm: "0.75rem 1.5rem",
                        md: "1rem 2rem",
                    },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#fff",
                    cursor: "pointer",
                    textTransform: "none",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                        backgroundColor: "rgba(12, 29, 196, 1)",
                    },
                }}
                onClick={handleToCreateTest}
            >
                Go to doing test
            </Button>

            <Dialog open={openPickupTime} onClose={handleClose} TransitionComponent={Transition} keepMounted>
                <DialogTitle>Set Time (hours:minutes)</DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                            value={time}
                            onChange={handleTimeChange}
                            ampm={false}
                            minTime={minTime}
                            maxTime={maxTime}
                            views={["hours", "minutes"]}
                            format="HH:mm"
                        />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SetupTest;
