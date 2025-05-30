import dayjs from "dayjs";
import api from "../apis/api.js";
import {getClientLanguageCode, getOffsetHours, getOffsetMinutes} from "../utils/timeLanguageUtils.js";

export const getStreakData = async (month, year) => {
    // http://localhost:8080/streak-learning/get-learned-data-by-month-year
    // http://localhost:8080/api/v1/streak-learning/get-learned-data-in-client-offset?offset=7
    const [resStreakAnalysis, resStreakInMonth] = await Promise.all([
        api.get("/v1/streak-learning/get-learned-data-in-client-time", {
            params: {
                offsetHours: getOffsetHours(),
                offsetMinutes: getOffsetMinutes(),
                locale: getClientLanguageCode(),
            },
        }),
        api.get("/v1/streak-learning/get-learned-data-by-month-year", {
            params: {
                month,
                year,
                locale: getClientLanguageCode(),
            },
        }),
    ]);

    return {
        streakAnalysis: resStreakAnalysis.data,
        streakInMonth: resStreakInMonth.data,
    };
};

export const getStreakAnalysis = async () => {
    // http://localhost:8080/api/v1/streak-learning/get-learned-data-in-client-offset?offset=7

    return (await api.get("/v1/streak-learning/get-learned-data-in-client-time", {
        params: {
            offsetHours: getOffsetHours(),
            offsetMinutes: getOffsetMinutes(),
            locale: getClientLanguageCode(),
        },
    })).data;
};

export const getStreakByMonthYear = async (month, year) => {
    // http://localhost:8080/streak-learning/get-learned-data-by-month-year
    return (await api.get("/v1/streak-learning/get-learned-data-by-month-year", {
        params: {
            month,
            year,
            locale: getClientLanguageCode(),
        },
    })).data;
};

export const updatingStreak = async () => {
    // const timeNow = dayjs().tz(dayjs.tz.guess()); // Lấy thời gian hiện tại theo timezone máy client
    //
    // const formattedTime = timeNow.format("YYYY-MM-DDTHH:mm:ss.SSSZ"); // Offset format giống OffsetDateTime
    //
    // return await api.patch("/v1/streak-learning/update-streak-data", {
    //     timeFromClient: formattedTime
    // });

    // Lấy offset hiện tại (số phút so với UTC)
    const offsetInMinutes = dayjs().utcOffset();

    // Tính hours và minutes
    const offsetHours = Math.trunc(offsetInMinutes / 60);
    const offsetMinutes = offsetInMinutes - offsetHours * 60;

    // Gọi API với đúng payload mà backend mong muốn
    return api.patch('/v2/streak-learning/update-streak-data', {
        offsetHours,
        offsetMinutes
    });
};