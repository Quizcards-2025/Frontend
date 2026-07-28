import {
    Box, CssBaseline, ThemeProvider, Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {ColorModeContext, themeSettings, tokens, useMode} from "../../../theme.js";
import X from "../../../components/ts/Button/X";
import {Link, useNavigate, useParams} from "react-router-dom";
import React from "react";


function NavbarOnStudy({title, otherMenus}) {
    const [theme, colorMode] = useMode();
    const colorsTheme = themeSettings(theme.palette.mode);
    const isMdDevices = useMediaQuery("(max-width:768px)");
    const isXsDevices = useMediaQuery("(max-width:466px)");
    const colors = tokens(theme.palette.mode);
    const navigate=useNavigate();
    const {id}=useParams()
    const handleRedirect = () => {
        navigate(`/user/set/detail/${id}`)
    }
    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>

                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={2}
                    bgcolor={colorsTheme.palette.background.default}
                    sx={{
                        boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                    }}
                    pr={5}
                    pl={10}
                >
                    <div
                        className="title flex-[0_0_65%]"
                        style={{
                            color: colorsTheme.palette.text.default,
                        }}
                    >
                        {title}
                    </div>

                    <Box
                        className="flex-1 flex items-center justify-end gap-4 min-w-0"
                    >
                        <Box
                            className="flex-shrink min-w-0"
                        >
                            {otherMenus}
                        </Box>
                        <X onClick={handleRedirect} className="flex-shrink-0"/>
                    </Box>
                </Box>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default NavbarOnStudy;
