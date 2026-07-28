import {useStreakContext} from "../../context/StreakContext.jsx";
import {useMediaQuery, useTheme} from "@mui/material";
import {useMode} from "../../theme.js";
import React from "react";

const StreakModalAfterFinish = () => {
    const {
        streakModalState,
        setStreakModalState,
        isLearnedCurrentDay,
        setIsLearnedCurrentDay,
        markDaysLearned,
        setMarkDaysLearned,
        dayLearned,
        setDayLearned,
        currentDateStreak,
        setCurrentDateStreak,
    } = useStreakContext();

    const theme = useTheme();
    const [customTheme, colorMode] = useMode();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <>
        </>
    );
};

export default StreakModalAfterFinish;