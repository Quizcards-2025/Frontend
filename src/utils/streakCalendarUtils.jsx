import dayjs from "dayjs";
import {getClientWeekDay} from "./timeLanguageUtils.js";

export const calculateWeekPositionOfMonth = (day, dayOfWeekStart) => {
    if (!(dayOfWeekStart >= 0 && dayOfWeekStart <= 7)) {
        throw new Error("dayOfWeek must be between 0 and 7");
    }

    if (dayOfWeekStart === 7) {
        dayOfWeekStart = 0; // set sunday to 0 instead of 7
    }

    const monthFirstDayOfWeek = dayjs(day).startOf("month").day();
    // console.log("monthFirstDayOfWeek", monthFirstDayOfWeek);
    const offsetDayMiss =
        dayOfWeekStart -
        (monthFirstDayOfWeek + (dayOfWeekStart > monthFirstDayOfWeek ? 7 : 0));
    const realStartDate = offsetDayMiss + 1;
    return Math.floor((day.date() - realStartDate) / 7) + 1;
};

export const mapDataLearnedToCalendar = (powLearned) => {
    const streakWeeks = [];
    const dateLearned = [];

    Object.keys(powLearned).forEach((key) => {
        const dates = powLearned[key];
        if (!dates || dates.length === 0) return;
        let prevDateLearned = null;
        let isConsecutiveStreak = true;
        for (const date of dates) {
            if (isConsecutiveStreak && prevDateLearned) {
                if (!(dayjs(date).diff(dayjs(prevDateLearned), "day") === 1)) {
                    isConsecutiveStreak = false;
                }
            }
            prevDateLearned = date;
        }
        if (isConsecutiveStreak) {
            const lastDate = dates[dates.length - 1];
            const weekendDate = dayjs(lastDate).endOf("isoWeek");
            isConsecutiveStreak = isConsecutiveStreak && lastDate.isSame(weekendDate, "day");
        }
        if (isConsecutiveStreak && dates.length === 7) {
            streakWeeks.push(key);
        } else {
            dateLearned.push(...dates);
        }
    });
    // console.log("streakWeeks", streakWeeks);
    // console.log("dateLearned", dateLearned);
    return [streakWeeks, dateLearned];
};

export const transformDataToMarkDays = (
    sortedData,
    setMarkDaysLearned,
    changeBgAndApplyEffects,
    highlightedRowRefs,
    particleIntervalsRef,
    sparkleIntervalsRef
) => {
    // Sắp xếp dữ liệu theo ngày
    const sortedResponse = sortedData.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    let powLearned = {};
    sortedResponse.forEach((item) => {
        const date = dayjs(item.date);
        const positionOfWeek = calculateWeekPositionOfMonth(date, getClientWeekDay());
        if (!powLearned[positionOfWeek]) {
            powLearned[positionOfWeek] = [];
        }
        powLearned[positionOfWeek].push(date);
    });
    console.log();
    const [streakWeeks, dateLearned] =
        mapDataLearnedToCalendar(powLearned);
    // Áp dụng hiệu ứng cho các tuần có ngày học liên tiếp
    changeBgAndApplyEffects(
        streakWeeks,
        highlightedRowRefs,
        particleIntervalsRef,
        sparkleIntervalsRef
    );

    setMarkDaysLearned(dateLearned);
};
