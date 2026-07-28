import React, {useEffect, useState} from "react";
import {Box, Button, Card, CardContent, Container, CssBaseline, Grid2, ThemeProvider, Typography} from "@mui/material";
import {ColorModeContext, useMode} from "../../theme.js";
import {useNavigate} from "react-router-dom";
import TryOtherMode from "src/components/other-mode/TryOtherMode.jsx";


const SatisfactionSurvey = () => (
    <section className="w-full rounded-2xl">
        <div className="flex flex-col px-4 py-5 w-full rounded-2xl bg-slate-50">
            <h3 className="self-start text-base font-bold leading-none text-center text-zinc-950">
                Satisfy with your work?
            </h3>
            <div className="flex gap-3.5 mt-5">
                <div className="flex flex-col whitespace-nowrap">
          <span className="self-center text-3xl font-bold leading-none text-zinc-950">
            😄
          </span>
                    <span className="mt-1.5 text-xs font-medium leading-none text-gray-400">
            Satisfied
          </span>
                </div>
                <div className="flex flex-col">
                    <div
                        className="flex gap-6 self-start text-3xl font-bold leading-none whitespace-nowrap text-zinc-950">
                        <span>😊</span>
                        <span>😐</span>
                        <span>😓</span>
                        <span>😭</span>
                    </div>
                    <span className="self-end mt-1.5 text-xs font-medium leading-none text-gray-400">
            Not at all
          </span>
                </div>
            </div>
        </div>
    </section>
);

// const ScoreCard = ({type, score, bgColor, textColor}) => (
//     <Card className={`!mt-4 !w-full !font-bold !leading-none ${textColor} !rounded-2xl`}>
//         <CardContent className={`!flex !gap-5 !justify-between !p-4 ${bgColor} !rounded-2xl`}>
//             <Typography variant="b" className="!my-auto !text-2xl">{type}</Typography>
//             <Typography variant="b" className="!text-3xl !text-right">{score}</Typography>
//         </CardContent>
//     </Card>
// );
const ScoreCard = ({type, score, bgColor, textColor, percent, percentBgColor}) => {
    const [animatedPercent, setAnimatedPercent] = useState(0);

    useEffect(() => {
        // Bắt đầu từ 0 và chuyển đến giá trị percent trong 2 giây
        setAnimatedPercent(0);
        const timer = setTimeout(() => {
            setAnimatedPercent(percent);
        }, 10);

        return () => clearTimeout(timer);
    }, [percent]);

    return (
        <Card className={`!mt-4 !w-full !font-bold !leading-none ${textColor} ${bgColor} !rounded-2xl`}>
            <Box sx={{position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '16px'}}>
                {/* Background container */}
                <Box className="!absolute !w-full !h-full !z-0">
                    {/* Progress Bar background */}
                    <Box
                        className="!absolute !left-0 !top-0 !h-full !transition-[width] !duration-[2000ms] !ease-[ease] !z-[1]"
                        sx={{
                            width: `${animatedPercent}%`,
                            backgroundColor: `${percentBgColor}`,
                        }}
                    />
                </Box>

                {/* Content */}
                <CardContent
                    className={`!flex !gap-5 !justify-between !p-4 !rounded-2xl`}
                    sx={{position: 'relative', zIndex: 2}}
                >
                    <Typography variant="b" className="!my-auto !text-2xl">
                        {type}
                    </Typography>
                    <Typography variant="b" className="!text-3xl !text-right">
                        {score}
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    );
};


const ResultSummary = ({
                           message = "",
                           navigate = () => {
                           },
                           onLearningAgain = () => {
                           },
                       }) => (
    <Box className="flex flex-col w-full max-md:mt-7">
        <svg width="148" height="73" viewBox="0 0 148 73" fill="none" xmlns="http://www.w3.org/2000/svg"
             xmlnsXlink="http://www.w3.org/1999/xlink"
             className="object-contain self-center max-w-full aspect-[2.03] w-[9.25rem]"
        >
            <rect width="148" height="73" fill="url(#pattern0_47_797)"/>
            <defs>
                <pattern id="pattern0_47_797" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use xlinkHref="#image0_47_797" transform="matrix(0.00239234 0 0 0.00485023 0 -0.166907)"/>
                </pattern>
                <image id="image0_47_797" width="418" height="275" preserveAspectRatio="none"
                       xlinkHref="data:image/png;base64,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"/>
            </defs>
        </svg>

        <svg width="364" height="77" viewBox="0 0 364 77" fill="none" xmlns="http://www.w3.org/2000/svg"
             xmlnsXlink="http://www.w3.org/1999/xlink"
             className="object-contain self-center aspect-[4.72] w-[22.75rem]"
        >
            <rect width="364" height="77" fill="url(#pattern0_47_798)"/>
            <defs>
                <pattern id="pattern0_47_798" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use xlinkHref="#image0_47_798" transform="matrix(0.00203402 0 0 0.00961538 -0.00138683 0)"/>
                </pattern>
                <image id="image0_47_798" width="493" height="104" preserveAspectRatio="none"
                       xlinkHref="data:image/png;base64,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"/>
            </defs>
        </svg>

        <Typography variant="h2"
                    className="!self-start !mt-6 !text-3xl !font-extrabold !leading-10 !text-zinc-950">
            {message}
        </Typography>
        <Button
            className="!gap-2.5 !self-stretch !px-10 !py-4 !mt-8 !text-xl !font-bold !leading-none
            !text-center !text-[#212529] !rounded-2xl !bg-[#f8f9fa] !min-h-[3.125rem] !shadow-[0px_4px_6px_rgba(0,0,0,1)]
            !max-md:px-5 !normal-case !font-[inherit]"
            onClick={() => navigate("/user")}
        >
            Go to Homepage
        </Button>
        <Button
            className="!gap-2.5 !self-stretch !px-10 !py-4 !mt-8 !text-xl !font-bold !leading-none
            !text-center !text-violet-100 !bg-blue-700 !rounded-2xl !min-h-[3.125rem] !shadow-[0px_5px_0px_rgba(2,14,199,1)]
            !max-md:px-5 !normal-case !font-[inherit]"
            onClick={onLearningAgain}
        >
            Practice flashcards again
        </Button>
    </Box>
);

const ResultDetails = ({
                           resultLearned = 0,
                           resultInProgress = 0,
                           resultNotLearn = 0,
                       }) => {
    const sum = resultInProgress + resultLearned + resultNotLearn;
    const percentLearned = parseFloat(((resultLearned / sum) * 100).toFixed(2));
    const percentInProgress = parseFloat(((resultInProgress / sum) * 100).toFixed(2));
    // const percentNotLearned = parseFloat(((resultNotLearned / sum) * 100).toFixed(2));
    return (

        <div className="max-w-full">
            <ScoreCard
                type="Learned"
                score={resultLearned}
                bgColor="!bg-[#d4edda]"
                textColor="!text-[#155724]"
                percent={percentLearned}
                percentBgColor={"#3cab56"}
            />
            <ScoreCard
                type="In progress"
                score={resultInProgress}
                bgColor="!bg-[#fff3cd]"
                textColor="!text-[#856404]"
                percent={percentInProgress}
                percentBgColor={"#f0cb60"}
            />
            {/*<ScoreCard*/}
            {/*    type="Not learn"*/}
            {/*    score="0"*/}
            {/*    bgColor="!bg-[#f8d7da]"*/}
            {/*    textColor="!text-[#721c24]"*/}
            {/*/>*/}
        </div>
    );
};

const AfterFinishLearningFlashcard = ({
                                              setId = null,
                                              recall = 0,
                                              remember = 0,
                                              onLearningAgain = () => {
                                              },
                                          }) => {
    const [theme, colorMode] = useMode();
    const navigate = useNavigate();

    const sentences = [
        "You're making amazing progress — keep pushing forward and never stop learning!",
        "Every step you take is a step closer to mastery. Keep it up!",
        "You're doing an awesome job — stay curious and keep growing!",
        "Your hard work is paying off. Keep learning, you're on the right path!",
        "Believe in your journey — you're doing fantastic, just keep going!",
        "Keep going — every bit of effort is shaping a stronger, smarter you!",
        "You’ve come so far already — imagine where you’ll be if you keep learning like this!",
        "Your dedication is inspiring — keep up the great work and continue to learn!",
    ];

    const randomIndex = Math.floor(Math.random() * sentences.length);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <Box
                    className="w-full h-full overflow-scroll"
                >
                    {/*<NavbarStudy title={<>Progress learning done for set: <b*/}
                    {/*    className="text-[#70cfc6] !ml-4"*/}
                    {/*>{title}</b></>}/>*/}
                    <Container className="pt-[6.5rem] !px-[3rem] self-center">
                        <Grid2
                            container
                            spacing={5}
                            direction="row"
                        >
                            <Grid2 item size={{xs: 12, md: 6}} className="!pl-0 max-md:!ml-0 md:!pl-[5rem]">
                                <ResultSummary
                                    message={sentences[randomIndex]}
                                    navigate={navigate}
                                    onLearningAgain={onLearningAgain}
                                />
                            </Grid2>
                            <Grid2 item size={{xs: 12, md: 6}} className="!pr-0 max-md:!ml-0 md:!pr-[5rem]">
                                <Box className="grow pb-36 mt-4 max-md:pb-24 max-md:mt-10">
                                    <ResultDetails
                                        resultLearned={remember}
                                        resultInProgress={recall}
                                    />
                                    <TryOtherMode
                                        navigate={navigate}
                                        params={{
                                            setId: setId,
                                        }}
                                    />
                                </Box>
                            </Grid2>
                        </Grid2>
                    </Container>
                </Box>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default AfterFinishLearningFlashcard;