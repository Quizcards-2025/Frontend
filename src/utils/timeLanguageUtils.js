import dayjs from "dayjs";

export const getClientWeekDay = () => {
    // get the client start day of the week base of the browser locale
    const browserLocale = navigator.language || 'en-US';

    let weekStart = 0; // fallback

    try {
        const localeObj = new Intl.Locale(browserLocale);
        weekStart = localeObj.weekInfo?.firstDay ?? 0;
    } catch (e) {
        console.warn(`Intl.Locale not supported, fallback to weekStart = ${weekStart}`);
    }
    return weekStart;
}

export const getClientLanguageCode = () => {
    return navigator.language || 'en-US';
}

export const getOffsetHours = () => {
    return Math.floor(dayjs().tz(dayjs.tz.guess()).utcOffset() / 60);
};

export const getOffsetMinutes = () => {
    // return Math.abs(dayjs().tz(dayjs.tz.guess()).utcOffset() % 60);
    return dayjs().tz(dayjs.tz.guess()).utcOffset() % 60;
};

export const convertDateTimeToSeconds = ({days = 0,
                                         hours = 0,
                                         minutes = 0,
                                         seconds = 0}) => {

    return Math.max((days * 24 * 60 * 60) +
            (hours * 60 * 60) +
            (minutes * 60) +
            seconds, 0);
}

// // Not negative
// export const convertSecondsToDateTime = (inputSeconds) => {
//     // Convert seconds to days, hours, minutes, and seconds
//     let inputSecondsHandled = Number(inputSeconds) ? Number(inputSeconds) : 0;
//     const totalSeconds = Math.max(0, Math.floor(inputSecondsHandled));
//
//     const days = Math.floor(totalSeconds / 86400); // 86400 = 24 * 60 * 60
//
//     const remainderAfterDays = totalSeconds % 86400;
//     const hours = Math.floor(remainderAfterDays / 3600); // 3600 = 60 * 60
//
//     const remainderAfterHours = remainderAfterDays % 3600;
//     const minutes = Math.floor(remainderAfterHours / 60);
//
//     const seconds = remainderAfterHours % 60;
//
//     return { days, hours, minutes, seconds };
// }


export const convertSecondsToDateTime = (
    inputSeconds,
    dateSkip = false,
    hoursSkip = false,
    minutesSkip = false
) => {
    let inputSecondsHandled = Number(inputSeconds) ? Number(inputSeconds) : 0;
    const totalSeconds = Math.max(0, Math.floor(inputSecondsHandled));

    let remainingSeconds = totalSeconds;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    const SECONDS_IN_DAY = 86400; // 24 * 60 * 60
    const SECONDS_IN_HOUR = 3600; // 60 * 60
    const SECONDS_IN_MINUTE = 60;

    if (!dateSkip) {
        days = Math.floor(remainingSeconds / SECONDS_IN_DAY);
        remainingSeconds %= SECONDS_IN_DAY;
    }

    if (!hoursSkip) {
        hours = Math.floor(remainingSeconds / SECONDS_IN_HOUR);
        remainingSeconds %= SECONDS_IN_HOUR;
    }

    if (!minutesSkip) {
        minutes = Math.floor(remainingSeconds / SECONDS_IN_MINUTE);
        remainingSeconds %= SECONDS_IN_MINUTE;
    }

    // Số giây còn lại cuối cùng chính là giá trị của seconds
    seconds = remainingSeconds;

    return { days, hours, minutes, seconds };
}
