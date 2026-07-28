import React from 'react';
import {Box} from '@mui/material';
import {IoPersonSharp} from 'react-icons/io5';
import {CiLogout} from 'react-icons/ci';
import './index.css';
import {RxAvatar} from 'react-icons/rx';
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify";
import * as autheService from "src/services/AuthenticationService.js";

const UserMenu = ({
                      userName,
                      email,
                      avatar,
                      menuVisible,
                      setShowMenuVisible
                  }) => {
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await autheService.logout();
            toast.success("Logout successfully");
        } catch (err) {
            console.error(err);
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            navigate("/logout");
        }
    }
    const handleRedirectPayment = () => {
        navigate('/payment');
    }
    return (
        <div>
            {menuVisible && (
                <Box className="user-menu-container">
                    <div className="user-menu-header">
                        <div>
                            {avatar ? (
                                <img src={avatar || ""} alt="User Avatar" className="user-avatar"/>
                            ) : (
                                <RxAvatar size={50} className="default-avatar-icon"/>
                            )}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{userName || ""}</div>
                            <div className="user-email">{email}</div>
                        </div>
                    </div>

                    <div className="user-menu-options">
                        <Box className="menu-option"
                             onClick={() => {
                                 setShowMenuVisible && setShowMenuVisible(false)
                                 navigate("/user/profile");
                             }}
                        >
                            <div className="icon-user-menu">
                                <IoPersonSharp size={24}/>
                            </div>
                            <div className="menu-name">
                                My Profile
                            </div>
                        </Box>
                        <Box className="menu-option" onClick={handleRedirectPayment}>
                            <div className="icon-user-menu">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                     stroke-linejoin="round"
                                     className="icon icon-tabler icons-tabler-outline icon-tabler-shopping-bag-plus">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path
                                        d="M12.5 21h-3.926a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304h11.339a2 2 0 0 1 1.977 2.304l-.263 1.708"/>
                                    <path d="M16 19h6"/>
                                    <path d="M19 16v6"/>
                                    <path d="M9 11v-5a3 3 0 0 1 6 0v5"/>
                                </svg>
                            </div>
                            <div className="menu-name">Upgrade premium</div>
                        </Box>
                        <Box className="menu-option logout" onClick={handleLogout}>
                            <div className="icon-user-menu">
                                <CiLogout size={24}/>
                            </div>
                            <div>Logout</div>
                        </Box>
                    </div>
                </Box>
            )}
        </div>
    );
};

export default UserMenu;
