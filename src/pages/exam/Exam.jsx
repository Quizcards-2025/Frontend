import {Box, CssBaseline, ThemeProvider} from "@mui/material";
import {ColorModeContext, useMode} from "../../theme.js";
import NavbarStudy from "../../scenes/layout/navbar-study/index.jsx";
import React from "react";
import NavbarOnStudy from "../../scenes/layout/navbar-study/index.jsx";
import NavbarExam from "../../scenes/layout/navbar-exam/index.jsx";
import NavbarOnExam from "../../scenes/layout/navbar-exam/index.jsx";

function Exam(props) {
    const [theme, colorMode] = useMode();
    const examData=[

    ]
    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <NavbarOnExam title={props.title}/>
                <Box sx={{display: "flex", height: "100vh", maxWidth: "100%"}} pt={9}>
                    <Box
                        bgcolor="#EDEDFF"
                        sx={{
                            flexGrow: 1,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                        }}
                        gap={4}
                    >

                    </Box>
                </Box>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default Exam;
