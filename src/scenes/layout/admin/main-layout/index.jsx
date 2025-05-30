import {useState, PropsWithChildren, createContext, useEffect} from 'react';
import Stack from '@mui/material/Stack';

import Footer from '../main-layout/footer/index.jsx';
import Sidebar from "../main-layout/sidebar-admin/index.jsx";
import Topbar from "../main-layout/topbar/index.jsx";
import {Outlet} from "react-router-dom";
import {ColorModeContext, useMode} from "src/theme.js";
import {CssBaseline} from "@mui/material";
import {ThemeProvider} from "@mui/material/styles";
import {themeAdmin} from "src/theme-admin/themeAdmin.jsx";
import {toast} from "react-toastify";
import api, {base_api, getAccessToken, getRefreshToken, setAccessToken} from "src/apis/api.js";
import navigateByRole from "src/utils/NavigateByRole.jsx";
import {canAccess, Roles} from "src/roles/roles.js";
import dayjs from "dayjs";
import {AxiosError} from "axios";

export const ToggledContext = createContext(null);

const MainLayout = () => {
    const [theme, colorMode] = useMode();
    const [toggled, setToggled] = useState(false);
    const values = {toggled, setToggled};
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const [isVerfied, setIsVerfied] = useState(false);
    const [isError, setIsError] = useState(false);

    const isAdminRoles = (role) => canAccess(role, [Roles.ADMIN]);

    const fetchUserInfo = async () => {
        const res = await base_api.get("/v1/auth/user-info", {
            headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        localStorage.setItem("user", JSON.stringify(res.data));
        return res.data;
    };

    const refreshAccessToken = async () => {
        const res = await base_api.post('/v1/auth/refresh-token', {
            refreshToken: getRefreshToken(),
        });
        setAccessToken(res.data.accessToken);
    };

    const checkUserRoles = async () => {
        try {
            const user = await fetchUserInfo();
            if (!isAdminRoles(user.role)) throw new Error("Cannot admin role");
        } catch (err) {
            if (err && err.response && err.response?.status === 401) {
                try {
                    await refreshAccessToken();
                    const user = await fetchUserInfo();
                    if (!isAdminRoles(user.role)) throw new Error("Cannot admin role");
                } catch (refreshErr) {
                    if (refreshErr instanceof AxiosError) {
                        toast.error("Network error");
                        throw new Error();
                    } else {
                        cleanupAndThrow(refreshErr);
                    }
                }
            } else {
                if (err instanceof AxiosError) {
                    toast.error("Network error");
                    throw new Error();
                } else {
                    cleanupAndThrow(err);
                }
            }
        }
    };

    const cleanupAndThrow = (err) => {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        throw err;
    };

    useState(() => {
        if (!localStorage.getItem("starting_use")) {
            localStorage.setItem("starting_use", JSON.stringify(dayjs().tz(dayjs.tz.guess())));
        }
        checkUserRoles().then(() => {
            setIsVerfied(true);
        }).catch((err) => {
            toast.error("Cannot access to this page");
            setIsError(true);
            setIsVerfied(true);
        });
    }, []);

    if (!isVerfied || isError) {
        return (
            <>
                <div style={{
                    width: '100% !important',
                    height: '100% !important',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '2.5rem !important',
                }}>
                    {
                        isError && <>
                            <h1>
                                Cannot go to Admin page
                            </h1>
                        </>
                    }
                    {
                        !isVerfied && <>
                            <h1>
                                Verifying......
                            </h1>
                        </>
                    }
                </div>
            </>
        )
    }

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={Object.assign({}, theme, themeAdmin)}>
                <CssBaseline/>
                <ToggledContext.Provider value={values}>
                    <Stack width={1} minHeight="100vh">
                        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} setIsClosing={setIsClosing} />
                        <Stack
                            component="main"
                            direction="column"
                            px={3}
                            width={{ xs: 1, lg: `calc(100% - 300px)` }}
                            flexGrow={1}
                        >
                            <Topbar isClosing={isClosing} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
                            <Outlet />
                            <Footer />
                        </Stack>
                    </Stack>
                </ToggledContext.Provider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default MainLayout;
