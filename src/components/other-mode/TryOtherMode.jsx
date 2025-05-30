import {Box, Typography} from "@mui/material";
import React from "react";
import OtherMode from "src/components/other-mode/OtherMode.jsx";

const TryOtherMode = ({
                          navigate = () => {
                          },
                          params = {},
                      }) => (
    <Box className="pt-2.5 mt-2 w-full rounded-2xl text-zinc-950">
        <Typography variant="p"
                    className="m-0 !self-start !text-lg !font-semibold !leading-6">
            Bored and want to try other learning modes? Checkout them below
        </Typography>
        <Box
            className="flex z-10 flex-col justify-center w-full mt-4"
        >
            <OtherMode
                title="Take a test"
                description="Try a timed quiz and see how you do!"
                mainProps="bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-all duration-200 cursor-pointer"
                titleProps="text-blue-600"
                descriptionProps="text-gray-800"
                modeAction={() => navigate(`/user/set-up-test/${params.setId}`)}
            />

            <OtherMode
                title="Space repetition"
                description="Boost memory by reviewing at spaced intervals."
                mainProps="bg-green-50 mt-2 hover:bg-green-100 active:bg-green-200 transition-all duration-200 cursor-pointer"
                titleProps="text-green-600"
                descriptionProps="text-gray-800"
            />

            <OtherMode
                title="Matching card mode"
                description="Strengthen your memory by pairing related cards."
                mainProps="bg-yellow-50 mt-2 hover:bg-yellow-100 active:bg-yellow-200 transition-all duration-200 cursor-pointer"
                titleProps="text-yellow-600"
                descriptionProps="text-gray-800"
            />

            <OtherMode
                title="Knowledge Arena"
                description="Test your knowledge against others in real-time."
                mainProps="bg-red-50 mt-2 hover:bg-red-100 active:bg-red-200 transition-all duration-200 cursor-pointer"
                titleProps="text-red-600"
                descriptionProps="text-gray-800"
                modeAction={() => navigate(`/arena/room-code?id=2&setId=${params.setId}`)}
            />
        </Box>
    </Box>
);

export default TryOtherMode;