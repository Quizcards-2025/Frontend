import { Box, styled } from "@mui/material";

// Styled component cho container để thêm CSS toàn cục
const StreakCalendarContainer = styled(Box)(({ theme }) => ({
    margin: "auto",
    position: "relative",

    // CSS cho header
    "& .MuiDayCalendar-header > *": {
        fontWeight: 900,
    },
}));

export default StreakCalendarContainer;