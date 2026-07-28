// LogoutPage.jsx
import React, {useEffect, useState} from 'react';
import {Box, Typography, Button, Container, Paper} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import styles from './LogoutPage.module.css';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import SyncIcon from '@mui/icons-material/Sync';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {toast} from "react-toastify";
import dayjs from "dayjs";
import {useSSENoti} from "src/context/SSENotiContext.jsx";
import {useNotification} from "src/context/NotificationContext.jsx";

const LogoutPage = () => {
    const { logoutSse } = useSSENoti();
    const { logoutNotification } = useNotification();

    const navigate = useNavigate();
    const handleRedirectLogin = () => {
        navigate("/login");
    }
    const handleRedirectFreeUserPage = () => {
        navigate("/");
    }
    const [lastTime, setLastTime] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let time = null;
        if (!localStorage.getItem("last_time_use")) {
            const jsonTime = JSON.stringify(dayjs().tz(dayjs.tz.guess()));
            localStorage.setItem("last_time_use", jsonTime);
            time = JSON.parse(jsonTime);
        } else {
            time = JSON.parse(localStorage.getItem("last_time_use"));
        }

        logoutNotification();
        logoutSse();

        setLastTime(dayjs(time));
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <>
            </>
        );
    }

    return (
        <div className={styles.goodbyeContainer}>
            <Container maxWidth="md">
                <Paper elevation={3} className={styles.goodbyePaper}>
                    <Box className={styles.goodbyeContent}>
                        <div className={styles.waveEmoji}>👋</div>

                        <Typography variant="h3" className={styles.goodbyeTitle}>
                            See you soon!
                        </Typography>

                        <Typography variant="h6" className={styles.goodbyeMessage}>
                            You&#39;ve been successfully logged out. Thanks for using our platform!
                        </Typography>

                        <div className={styles.statsContainer}>
                            <div className={styles.statItem}>
                                <Typography variant="h4">0</Typography>
                                <Typography>Cards Studied</Typography>
                            </div>
                            <div className={styles.statItem}>
                                <Typography
                                    variant="h4">{!lastTime ? 0 : lastTime.diff(dayjs(JSON.parse(localStorage.getItem("starting_use"))).tz(), 'minute')}</Typography>
                                <Typography>Minutes Spent</Typography>
                            </div>
                        </div>

                        {/* New Download Section */}
                        <div className={styles.downloadSection}>
                            {/*<Typography variant="h4" className={styles.downloadTitle}>*/}
                            {/*    Download the App to study on the go*/}
                            {/*</Typography>*/}

                            {/*<div className={styles.downloadButtons}>*/}
                            {/*    <Button*/}
                            {/*        variant="contained"*/}
                            {/*        startIcon={<AppleIcon/>}*/}
                            {/*        className={styles.iosButton}*/}
                            {/*        href="#"*/}
                            {/*    >*/}
                            {/*        iOS*/}
                            {/*    </Button>*/}

                            {/*    <Button*/}
                            {/*        variant="contained"*/}
                            {/*        startIcon={<AndroidIcon/>}*/}
                            {/*        className={styles.androidButton}*/}
                            {/*        href="#"*/}
                            {/*    >*/}
                            {/*        Android*/}
                            {/*    </Button>*/}
                            {/*</div>*/}

                            {/*<div className={styles.qrSection}>*/}
                            {/*    <div className={styles.qrCode}>*/}
                            {/*        <div className={styles.qrPlaceholder}></div>*/}
                            {/*    </div>*/}
                            {/*    <div className={styles.mascot}>*/}
                            {/*        <div className={styles.mascotPlaceholder}></div>*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            <div className={styles.features}>
                                <div className={styles.featureItem}>
                                    <PhoneIphoneIcon className={styles.featureIcon}/>
                                    <Typography variant="h6">Study on the go</Typography>
                                    <Typography>Access notes and flashcards from anywhere</Typography>
                                </div>

                                <div className={styles.featureItem}>
                                    <SyncIcon className={styles.featureIcon}/>
                                    <Typography variant="h6">Seamless syncing</Typography>
                                    <Typography>All your study progress syncs between web and mobile</Typography>
                                </div>

                                <div className={styles.featureItem}>
                                    <MenuBookIcon className={styles.featureIcon}/>
                                    <Typography variant="h6">Keep track of your exams</Typography>
                                    <Typography>Study from our curated guides for AP, IB, and GCSE exams</Typography>
                                </div>
                            </div>
                        </div>

                        <div className={styles.buttonsContainer}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleRedirectLogin}
                                className={styles.loginButton}
                            >
                                Log In Again
                            </Button>

                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleRedirectFreeUserPage}
                                className={styles.homeButton}
                            >
                                Go to Homepage
                            </Button>
                        </div>

                        <Typography className={styles.footerText}>
                            Want to learn more? Check out our{' '}
                            <a className={styles.link} href="/features">features</a> or{' '}
                            <a className={styles.link} href="/blog">blog</a>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </div>
    );
};

export default LogoutPage;