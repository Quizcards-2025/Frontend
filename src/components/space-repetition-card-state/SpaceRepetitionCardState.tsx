import React from "react";
import {Box, Typography} from "@mui/material";
import {Circle} from "lucide-react";
import HalfColorCircle from "../ts/Icon/HalfColorCircle";

interface SpaceRepetitionStateProps {
    state?: string;
    className?: string;
    boxClassName?: string;
}

const SpaceRepetitionCardState: React.FC<SpaceRepetitionStateProps> = ({
                                                                           state,
                                                                           className = "",
                                                                           boxClassName = "",
                                                                       }) => {
    return (
        <Box className={`space-repetition-state ${className}`}>
            {
                state === "new" &&
                <>
                    <Box className={`flex justify-center items-center gap-4 rounded-3xl bg-[#F5B2B2] px-4 py-2`}>
                        <Circle color={"red"} strokeWidth={4} width={25} height={25}/>
                        <Typography variant="span" className={
                            `state-new text-red-600 font-medium font-[inherit] text-[1.05rem] ${boxClassName}
                            `}>
                            New
                        </Typography>
                    </Box>
                </>
            }
            {
                state === "learning" &&
                <>
                    <Box className={`flex justify-center items-center gap-4 rounded-3xl bg-[#FFD9A4] px-4 py-2`}>
                        <HalfColorCircle
                            diameter={25}
                            color={"#FF9500"}
                            strokeWidth={5.5}
                            halfOpacity={0.45}
                            darkPercentage={35}
                        />
                        <Typography variant="span" className={
                            `state-learning text-[#FF9500] font-medium font-[inherit] text-[1.05rem] ${boxClassName}
                            `}>
                            Learning
                        </Typography>
                    </Box>
                </>
            }
            {
                state === "almost_done" &&
                <>
                    <Box className={`flex justify-center items-center gap-4 rounded-3xl bg-[#96F29E] px-4 py-2`}>
                        <HalfColorCircle
                            diameter={25}
                            color={"#00C310"}
                            strokeWidth={5.5}
                            halfOpacity={0.45}
                            darkPercentage={70}
                        />
                        <Typography variant="span" className={
                            `state-learning text-[#00C310] font-medium font-[inherit] text-[1.05rem] ${boxClassName}
                            `}>
                            Almost learned
                        </Typography>
                    </Box>
                </>
            }
            {
                state === "mastered" &&
                <>
                    <Box className={`flex justify-center items-center gap-4 rounded-3xl bg-[#E0E0FE] px-4 py-2`}>
                        <Circle color={"blue"} strokeWidth={4} width={25} height={25}/>
                        <Typography variant="span" className={
                            `state-remembered text-blue-600 font-medium font-[inherit] text-[1.05rem] ${boxClassName}
                            `}>
                            Learned
                        </Typography>
                    </Box>
                </>
            }
        </Box>
    );
};

export default SpaceRepetitionCardState;