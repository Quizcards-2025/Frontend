import {Box, Typography} from "@mui/material";
import React from "react";

const OtherMode = ({
                       title = "",
                       description = "",
                       mainProps = "",
                       titleProps = "",
                       descriptionProps = "",
                       modeAction = () => {
                       },
                   }) => (
    <Box
        className={`flex flex-col w-full justify-between gap-3 items-center border-2 border-gray-300 border-solid rounded-2xl ${mainProps}`}
        onClick={modeAction}
    >
        <Typography
            variant="h3"
            className={`m-0 !text-xl !font-extrabold !leading-6 mt-2 ${titleProps}`}
        >
            {title}
        </Typography>
        <Typography
            variant="p"
            className={`m-0 !text-base !font-extrabold !leading-6 mb-2 text-center ${descriptionProps}`}
        >
            {description}
        </Typography>
    </Box>
);

export default OtherMode;