import { styled } from "@mui/material";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

// Component ngày tùy chỉnh
const StreakCustomDay = styled(PickersDay, {
    shouldForwardProp: (prop) =>
        !["isMarkDay", "isCurrentDay", "isCurrentDayLearned"].includes(prop),
})(({ theme, isCurrentDay, isMarkDay, isCurrentDayLearned }) => ({
    ...{
        pointerEvents: "none",
        border: "none", // Loại bỏ border mặc định
        borderRadius: 0,
        // Áp dụng style cho ngày hiện tại (isCurrentDay)
        ...(isCurrentDay && {
            border: "2px solid orange !important",
            borderRadius: "50% !important",
            background: "orange !important",
        }),
        ...(isMarkDay && {
            backgroundColor: "inherit !important",
            borderRadius: "50% !important",
            border: "5px solid orange !important",
        }),
        ...(isCurrentDay &&
            !isCurrentDayLearned && {
                backgroundColor: "inherit !important",
                border: "2px solid black !important",
            }),
        ...(isCurrentDay &&
            isCurrentDayLearned && {
                backgroundColor: "orange !important",
                border: "1px solid black !important",
            }),
    },
    "&:hover": {
        cursor: "default",
        backgroundColor: "inherit",
    },
}));

export default StreakCustomDay;