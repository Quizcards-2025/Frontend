import React, { createContext, useState, useContext } from "react";
// import * as deadlineService from "../services/fetchDeadline.js";

const StreakAnalyzeContext = createContext();

export const StreakAnalyzeProvider = ({ children }) => {
    const [isLearnedCurrentDay, setIsLearnedCurrentDay] = useState(false);

    return (
        <StreakAnalyzeContext.Provider value={{ isLearnedCurrentDay, setIsLearnedCurrentDay }}>
            {children}
        </StreakAnalyzeContext.Provider>
    );
};

export const useStreakAnalyze = () => useContext(StreakAnalyzeContext);