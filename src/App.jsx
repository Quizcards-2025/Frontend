import {createContext, useEffect, useRef, useState} from "react";
import {Box, Button, CssBaseline, ThemeProvider} from "@mui/material";
import {ColorModeContext, themeSettings, useMode} from "./theme.js";
import {Navbar, SideBar} from "./scenes";
import {Outlet} from "react-router-dom";
import UserMenu from "./components/MenuUser/UserMenu.jsx";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isoWeek from "dayjs/plugin/isoWeek";
import updateLocale from 'dayjs/plugin/updateLocale'
import api, {apiStr, getAccessToken} from "./apis/api.js";
import {toast} from "react-toastify";
import {getClientWeekDay} from "./utils/timeLanguageUtils.js";
import {useStreakContext} from "./context/StreakContext.jsx";
import { EventSourcePolyfill } from 'event-source-polyfill';
import {useStreakBackgroundContext} from "./context/StreakBackgroundContext.jsx";

export const ToggledContext = createContext(null)

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
    weekStart: getClientWeekDay(),
});

const PUBLIC_VAPID_KEY = import.meta.env.VITE_PUSH_NOTIFICATION_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function App() {
    const [theme, colorMode] = useMode();
    const [toggled, setToggled] = useState(false);
    const bgColor = themeSettings(theme.palette.mode);
    console.log(bgColor.palette.background.default);
    const values = {toggled, setToggled};
    const [showUserMenu, setShowUserMenu] = useState(false);
    const handleShowUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    }
    const user = JSON.parse(localStorage.getItem("user"));

    const setupPushNotification = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', {scope: "/"}).then(reg => {
                reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
                }).then(subscription => {
                    // Gửi subscription về server Java
                    api.post('/v1/notifi/save-subscription', subscription).then(r => {
                        // console.log(r);
                    }).catch(err => {
                        console.error(err);
                        toast.error("Cannot setup auto notification");
                    });
                });
            });
        }

        Notification.requestPermission().then((result) => {
            if (result === "granted") {
                // navigator.serviceWorker.ready.then((registration) => {
                //     // Show a notification that includes an action titled Archive.
                //     registration.showNotification("Register notification success", {
                //         actions: [
                //             {
                //                 action: "archive",
                //                 title: "Archive",
                //             },
                //         ],
                //     }).then(r => {
                //         console.log(r);
                //     }).catch(e => {
                //         console.error(e);
                //     });
                // });
            }
        });
    };

    const {
        fetchLearnedData,
    } = useStreakContext();

    const fetchStreakData = () => {
        fetchLearnedData();
    };

    useEffect(() => {
        if (!localStorage.getItem("starting_use")) {
            localStorage.setItem("starting_use", JSON.stringify(dayjs().tz(dayjs.tz.guess())));
        }
        // setupPushNotification();
        fetchStreakData();
    }, []);
    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <ToggledContext.Provider value={values}>
                    {/*<Button*/}
                    {/*    sx={{*/}
                    {/*        position: "fixed",*/}
                    {/*        top: 0,*/}
                    {/*        left: 0,*/}
                    {/*        width: "200px",*/}
                    {/*        height: "200px",*/}
                    {/*        backgroundColor: "blue",*/}
                    {/*        textTransform: "none",*/}
                    {/*        fontFamily: "inherit",*/}
                    {/*        zIndex: 1000,*/}
                    {/*    }}*/}
                    {/*    onClick={() => {*/}
                    {/*        setStreakBgModalState(!streakBgModalState);*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    Click me*/}
                    {/*</Button>*/}
                    <Navbar position="relative" sx={{zIndex: "1"}}
                            menuVisible={handleShowUserMenu}
                            avatar={user?.avatar}
                    />
                    {
                        user &&
                        <UserMenu
                            userName={user?.userName || ""}
                            email={user?.email || ""} avatar={user?.avatar}
                            menuVisible={showUserMenu}
                            setShowMenuVisible={setShowUserMenu}
                        />
                    }

                    <Box sx={{display: "flex", height: "100vh", maxWidth: "100%", zIndex: "1"}} pt={9}
                         onClick={() => setShowUserMenu(false)}>
                        <SideBar/>
                        <Box
                            bgcolor={bgColor.palette.background.default}
                            sx={{
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                                overflowY: "scroll"
                            }}
                        >
                            <Outlet/>
                        </Box>
                    </Box>
                </ToggledContext.Provider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default App;
