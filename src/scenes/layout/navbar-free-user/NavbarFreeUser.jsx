import {
    Box,
    IconButton,
    InputBase,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {tokens, ColorModeContext} from "../../../theme.js";
import {useContext} from "react";
import {
    MenuOutlined,
} from "@mui/icons-material";
import {ToggledContext} from "../../../App";
import {FaPlus, FaPlusSquare} from "react-icons/fa";
import {IoNotifications} from "react-icons/io5";
import {IoIosSearch} from "react-icons/io";
import LogoQuizcard from "../../../components/icon/LogoQuizcard.jsx";
import {Link, useNavigate} from "react-router-dom";

const NavbarFreeUser = () => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    const {toggled, setToggled} = useContext(ToggledContext);
    const isMdDevices = useMediaQuery("(max-width:768px)");
    const isXsDevices = useMediaQuery("(max-width:466px)");
    const colors = tokens(theme.palette.mode);

    const navigate = useNavigate();

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={2}
            bgcolor="#EDEDFF"
            sx={{
                boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
            }}
        >
            <Box display="flex" alignItems="center" gap={5} ml={5}>
                <LogoQuizcard size={32} onClick={() => {
                    navigate("/");
                }}/>
                <Box
                    display="flex"
                    alignItems="center"
                    bgcolor={colors.primary[400]}
                    borderRadius="10px"
                    sx={{display: `${isXsDevices ? "none" : "flex"}`, width: isMdDevices ? "200px" : "500px",}}
                >
                    <InputBase placeholder="Search" sx={{ml: 2, flex: 1}}/>
                    <IconButton type="button" sx={{p: 1}}>
                        <IoIosSearch color="0E22E9"/>
                    </IconButton>
                </Box>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" gap={4}>
                {/*<button style={{*/}
                {/*    display: "flex",*/}
                {/*    justifyContent: "center",*/}
                {/*    alignItems: "center",*/}
                {/*    height: "50px",*/}
                {/*    width: "120px",*/}
                {/*    borderRadius: "15px",*/}
                {/*    backgroundColor: "white",*/}
                {/*    color: "#0c0f6e",*/}
                {/*    borderBottom: "3px solid #0c0f6e",*/}
                {/*    borderTop: "0px",*/}
                {/*    borderRight: "0px",*/}
                {/*    borderLeft: "0px",*/}
                {/*    gap: "10px"*/}
                {/*}}><FaPlus/>Create*/}
                {/*</button>*/}
                <Link to="/login" style={{textDecorationLine: "none"}}>
                    <button style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "50px",
                        width: "150px",
                        borderRadius: "15px",
                        backgroundColor: "#0c0f6e",
                        color: "white",
                        gap: "10px"
                    }}>Log in
                    </button>
                </Link>

            </Box>
        </Box>
    );
};

export default NavbarFreeUser;
