import React, {createContext, useState, useContext, useRef} from "react";
import {getStreakAnalysis, getStreakData} from "../services/StreakService.js";
import {toast} from "react-toastify";
// import * as deadlineService from "../services/fetchDeadline.js";

const StreakContext = createContext();

export const StreakProvider = ({ children }) => {
    const [streakModal, setStreakModal] = useState(null);

    const [streakModalState, setStreakModalState] = useState(false);

    const [isLearnedCurrentDay, setIsLearnedCurrentDay] = useState(false);

    const [currentDateStreak, setCurrentDateStreak] = useState(0);

    const [dayLearned, setDayLearned] = useState(0);

    const [longestStreak, setLongestStreak] = useState(0);

    const [markDaysLearned, setMarkDaysLearned] = useState([]);

    const [streakOneWeek, setStreakOneWeek] = useState([]);

    const fetchLearnedData = () => {
        getStreakAnalysis()
            .then(data => {
                // console.log(data);
                setStreakOneWeek(data.streakOneWeek);
                setDayLearned(data.dayLearned);
                setIsLearnedCurrentDay(data.isCurrentDateLearned);
                setCurrentDateStreak(data.currentStreak);
                setLongestStreak(data.longestStreak);
            })
            .catch(e => {
                console.error("Error:", e);
                toast.error("fetch data failed!");
            });
    };

    return (
        <StreakContext.Provider value={{
            streakModal,
            setStreakModal,
            streakModalState,
            setStreakModalState,
            isLearnedCurrentDay,
            setIsLearnedCurrentDay,
            markDaysLearned,
            setMarkDaysLearned,
            currentDateStreak,
            setCurrentDateStreak,
            dayLearned,
            setDayLearned,
            streakOneWeek,
            setStreakOneWeek,
            longestStreak,
            setLongestStreak,
            fetchLearnedData,
        }}>
            {children}
        </StreakContext.Provider>
    );
};

export const useStreakContext = () => useContext(StreakContext);