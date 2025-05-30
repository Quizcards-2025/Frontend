import React, {createContext, useCallback, useContext, useRef, useState} from "react";
import {useStreakContext} from "./StreakContext.jsx";
import {toast} from "react-toastify";
import {updatingStreak} from "../services/StreakService.js";

const StreakBackgroundContext = createContext();

export const StreakBackgroundProvider = ({children}) => {
    const {
        isLearnedCurrentDay,
        setIsLearnedCurrentDay,
        currentDateStreak,
        setCurrentDateStreak,
        setLongestStreak,
        setDayLearned,
    } = useStreakContext();

    const isLearnedCurrentDayRef = useRef(isLearnedCurrentDay);

    const [streakBgModalState, setStreakBgModalState] = useState(false);

    const showedStreakBgModalState = useRef(false);

    const hadUpdatingStreak = useRef(false);

    // const updateStreak = useCallback(() => {
    //     if (!isLearnedCurrentDayRef.current) {
    //         updatingStreak().then(
    //             (response) => {
    //                 if (response.status === 200) {
    //                     // set currentDateStreak = currentDateStreak + 1
    //                     setCurrentDateStreak((prev) => prev + 1);
    //                     setLongestStreak((prev) => prev + 1);
    //                     setDayLearned((prev) => prev + 1);
    //                     // set isLearnedCurrentDay to true
    //                     setIsLearnedCurrentDay(true);
    //                     hadUpdatingStreak.current = true;
    //                     isLearnedCurrentDayRef.current = true;
    //                 }
    //             }
    //         ).catch((err) => {
    //             if (err && err.response && err.response.status >= 400) {
    //                 toast.error("Error updating streak");
    //                 console.error("Error updating streak:", err);
    //             }
    //         });
    //     }
    // }, [setCurrentDateStreak, setDayLearned, setIsLearnedCurrentDay, setLongestStreak]);

    const updateStreak = useCallback(async () => {
        if (!isLearnedCurrentDayRef.current) {
            try {
                const res = await updatingStreak();
                if (res.status === 200) {
                    // set currentDateStreak = currentDateStreak + 1
                    setCurrentDateStreak((prev) => prev + 1);
                    setLongestStreak((prev) => prev + 1);
                    setDayLearned((prev) => prev + 1);
                    // set isLearnedCurrentDay to true
                    setIsLearnedCurrentDay(true);
                    hadUpdatingStreak.current = true;
                    isLearnedCurrentDayRef.current = true;
                }
            } catch (err) {
                if (err && err.response && err.response.status >= 400) {
                    toast.error("Error updating streak");
                    console.error("Error updating streak:", err);
                }
            }
        }
    }, []);

    const showingModalStreakBackground = useCallback(() => {
        if (hadUpdatingStreak.current && !showedStreakBgModalState.current) {
            setTimeout(() => {
                setStreakBgModalState(true);
                showedStreakBgModalState.current = true;
            }, 1000);
        }
    }, []);

    return (
        <StreakBackgroundContext.Provider
            value={{
                streakBgModalState,
                setStreakBgModalState,
                isLearnedCurrentDay,
                currentDateStreak,
                updateStreak,
                showingModalStreakBackground,
            }}
        >
            {children}
        </StreakBackgroundContext.Provider>
    )
};

export const useStreakBackgroundContext = () => useContext(StreakBackgroundContext);