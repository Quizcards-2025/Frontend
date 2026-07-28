import {createTheme} from "@mui/material/styles";
import Stack from "./components/layouts/Stack.jsx";
import Drawer from "./components/navigation/Drawer.jsx";

export const themeAdmin = createTheme({
    components: {
        MuiStack: Stack,
        MuiDrawer: Drawer
    },
});