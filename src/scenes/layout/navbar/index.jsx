import {
    Box,
    IconButton, Typography,
    useMediaQuery,
} from "@mui/material";
import {useContext} from "react";
import {
    MenuOutlined,
} from "@mui/icons-material";
import {ToggledContext} from "../../../App";
import {FaPlusSquare} from "react-icons/fa";
import {IoNotifications} from "react-icons/io5";
import LogoQuizcard from "../../../components/icon/LogoQuizcard.jsx";
import {Link, useNavigate} from "react-router-dom";
import {authenticate} from "src/services/AuthenticationService.js";
import SvgStreakLearnedIcon from "../../../components/icon/StreakLearnedIcon.jsx";
import SvgStreakNotLearnIcon from "../../../components/icon/StreakNotLearnIcon.jsx";
import {useStreakContext} from "../../../context/StreakContext.jsx";
import {useNotification} from "src/context/NotificationContext.jsx";
import {NotificationBellAndPanel} from "src/components/notification-comp/NotificationBellAndPanel.jsx";

const Navbar = ({menuVisible, avatar}) => {
    const {toggled, setToggled} = useContext(ToggledContext);
    const isMdDevices = useMediaQuery("(max-width:768px)");
    const isXsDevices = useMediaQuery("(max-width:466px)");
    const {isLearnedCurrentDay,
        currentDateStreak,
        streakModalState,
        setStreakModalState
    } = useStreakContext();

    const navigate = useNavigate();
    const user = authenticate();
    const redirectPageCreateSet = () => {
        navigate('create');
    }
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
                <Link to="/user">
                    <LogoQuizcard size={32}/>
                </Link>
                <IconButton
                    sx={{display: `${isMdDevices ? "flex" : "none"}`}}
                    onClick={() => setToggled(!toggled)}
                >
                    <MenuOutlined/>
                </IconButton>
            </Box>
            <Box className="!flex flex-row gap-[1.2]">
                <Box
                    className="!flex flex-row items-center justify-center pr-0 lg:pr-2 gap-[1.1] cursor-pointer
                        hover:bg-[#D1D1FF] hover:text-white rounded-[10px]
                    "
                    onClick={() => {
                        setStreakModalState(!streakModalState);
                    }}
                >
                    {
                        isLearnedCurrentDay ? (
                            <SvgStreakLearnedIcon size={40}/>
                        ) : (
                            <SvgStreakNotLearnIcon size={40}/>
                        )
                    }
                    <Typography variant="p" className="pl-1 pr-2">{currentDateStreak}</Typography>
                </Box>
                <IconButton onClick={redirectPageCreateSet}>
                    <FaPlusSquare color="0E22E9"/>
                </IconButton>
                {/*<IconButton sx={{*/}
                {/*    position: 'relative',*/}
                {/*}}>*/}
                {/*    <IoNotifications color="0E22E9"/>*/}
                {/*    <Box className={`absolute top-0 right-0 w-5 h-5 rounded-full font-bold text-black*/}
                {/*        text-xs z-[1000] flex items-center justify-center`}>*/}
                {/*        {*/}
                {/*            notReadNotification > 99 ? '99+' : notReadNotification === 0 ?*/}
                {/*                '' : notReadNotification*/}
                {/*        }*/}
                {/*    </Box>*/}
                {/*</IconButton>*/}
                <NotificationBellAndPanel
                    useNotificationHook={useNotification}
                    apiLink={'/v1/notification/data'}
                    apiLinkUpdate={'/v1/notification/data/read'}
                />
                <IconButton onClick={menuVisible}>
                    {user.role[0] === "ROLE_ADMIN" && <img width="27" height="27"
                                                                  src={avatar || "https://img.icons8.com/color/48/user-male-circle--v1.png"}
                                                                  style={{
                                                                      borderRadius: "50%",
                                                                      border: "4px solid orange"
                                                                  }}
                                                                  alt="user-male-circle--v1"/>
                    }
                    {user.role[0] === "ROLE_PREMIUM_USER" && <img width="27" height="27"
                                                                  src={avatar || "https://img.icons8.com/color/48/user-male-circle--v1.png"}
                                                                  style={{
                                                                      borderRadius: "50%",
                                                                      border: "2px solid blue"
                                                                  }}
                                                                  alt="user-male-circle--v1"/>
                    }
                    {user.role[0] === "ROLE_FREE_USER" && <img width="27" height="27"
                                                                  src={avatar || "https://img.icons8.com/color/48/user-male-circle--v1.png"}
                                                                  style={{
                                                                      borderRadius: "50%",
                                                                  }}
                                                                  alt="user-male-circle--v1"/>
                    }
                </IconButton>
            </Box>
        </Box>
    );
};

export default Navbar;
