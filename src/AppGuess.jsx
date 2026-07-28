import {Box, CssBaseline, ThemeProvider} from "@mui/material";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {ColorModeContext, useMode} from "./theme.js";
import {ToggledContext} from "./App.jsx";
import React, {useEffect, useState} from "react";
import NavbarFreeUser from "./scenes/layout/navbar-free-user/NavbarFreeUser.jsx";
import {navigateByUserData} from "./utils/navigateByUserData.js";

export function AppGuess() {
    const [theme, colorMode] = useMode();
    const [toggled, setToggled] = useState(false);
    const values = {toggled, setToggled};

    const navigate = useNavigate();

    const location = useLocation();
    const isLoginOrRegister = ['/login', '/register'].includes(location.pathname);

    useEffect(() => {
        navigateByUserData(navigate).then().catch();
    }, []);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <ToggledContext.Provider value={values}>
                    {
                        !isLoginOrRegister && <NavbarFreeUser/>
                    }
                    <Box sx={{display: "flex", height: "100vh", maxWidth: "100%"}}>
                        <Outlet/>
                    </Box>
                </ToggledContext.Provider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    )
}