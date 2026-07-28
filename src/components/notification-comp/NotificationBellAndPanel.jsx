import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Button,
    IconButton,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Box,
} from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { IoNotifications } from 'react-icons/io5';

const GlobalStyles = () => (
    <style jsx global>{`
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes newNotificationEntry {
      0% { transform: scale(0.8); opacity: 0; }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pulse-custom { animation: pulse 1.5s infinite; }
    .animate-fadeIn-custom { animation: fadeIn 0.5s ease-out forwards; }
    .animate-newNotificationEntry-custom { animation: newNotificationEntry 0.5s ease-out; }
  `}</style>
);

function AdaptedNotificationItem({ notification, onMarkAsReadContext, index, apiLinkUpdate }) {
    const handleItemClick = () => {
        if (!notification.isRead) {
            onMarkAsReadContext([notification.notificationId], apiLinkUpdate);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.round(diffMs / 1000);
        const diffMins = Math.round(diffSecs / 60);
        const diffHours = Math.round(diffMins / 60);
        const diffDays = Math.round(diffHours / 24);

        if (diffSecs < 60) return `${diffSecs} seconds ago`;
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return `yesterday`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US');
    };

    return (
        <ListItem
            alignItems="flex-start"
            onClick={handleItemClick}
            className={`p-4 border-b border-gray-200 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${notification.isRead ? '' : 'bg-blue-50 hover:bg-blue-100'} animate-fadeIn-custom`}
            style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
            secondaryAction={
                !notification.isRead ? (
                    <Box className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0 self-center" />
                ) : null
            }
        >
            <ListItemText
                primary={
                    <Typography variant="body2" className="!text-sm text-gray-800 leading-snug !break-words"
                                dangerouslySetInnerHTML={{ __html: notification.message }} />
                }
                secondary={
                    <Typography variant="caption" className="!text-xs text-gray-500">
                        {formatTime(notification.createdAt)}
                    </Typography>
                }
            />
        </ListItem>
    );
}

export function NotificationBellAndPanel({ useNotificationHook, apiLink, apiLinkUpdate }) {
    const {
        notifications,
        notReadNotification,
        onMarkAsRead,
        handleFetchDataApi,
        page,
        size,
        handleSetPage,
        handleFetchDataApiWithPageParam,
    } = useNotificationHook();

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreToLoad, setHasMoreToLoad] = useState(true);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isPanelHovered, setIsPanelHovered] = useState(false);

    const notificationContentRef = useRef(null);
    const panelTimeoutRef = useRef(null);
    const initialLoadDoneRef = useRef(false);

    useEffect(() => {
        if (!initialLoadDoneRef.current && notifications.length === 0) {
            const userItem = localStorage.getItem("user");
            if (!userItem) return;
            console.log("Waiting for fetching, current: ...", initialLoadDoneRef.current);
            handleFetchDataApi(apiLink);
            initialLoadDoneRef.current = true;
        }
    }, [handleFetchDataApi, apiLink, notifications.length]);
    // useEffect(() => {
    //     handleFetchDataApi(apiLink);
    // }, []);


    useEffect(() => {
        if (isButtonHovered || isPanelHovered) {
            if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
            setIsPanelOpen(true);
        } else {
            panelTimeoutRef.current = setTimeout(() => setIsPanelOpen(false), 300);
        }
        return () => { if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current); };
    }, [isButtonHovered, isPanelHovered]);

    const handleMarkAllReadInternal = () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.notificationId);
        if (unreadIds.length > 0) {
            onMarkAsRead(unreadIds, apiLinkUpdate);
        }
    };

    const loadMoreNotifications = useCallback(async () => {
        if (isLoadingMore || !hasMoreToLoad) return;
        setIsLoadingMore(true);

        const previousNotificationsCount = notifications.length;
        handleSetPage(page + 1);

        try {
            const haveNextPage = await handleFetchDataApiWithPageParam(apiLink, page + 1, size);
            // This is a trick to wait for the state to update if handleFetchDataApi doesn't return new items
            // A better solution would be for handleFetchDataApi to return the fetched items or a status
            setTimeout(() => {
                // const currentNotifications = notificationsRef.current; // Use a ref to get latest notifications
                // if (currentNotifications.length === previousNotificationsCount || currentNotifications.length < (page + 1) * size) {
                //     setHasMoreToLoad(false);
                // }
                setHasMoreToLoad(haveNextPage);
                setIsLoadingMore(false);
            }, 0);

        } catch (error) {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMoreToLoad, handleFetchDataApi, apiLink, page, handleSetPage, notifications, size]);

    const notificationsRef = useRef(notifications);
    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);


    useEffect(() => {
        const contentElement = notificationContentRef.current;
        if (!contentElement) return;
        const handleScroll = () => {
            if (contentElement.scrollTop + contentElement.clientHeight >= contentElement.scrollHeight - 50 && !isLoadingMore && hasMoreToLoad) {
                loadMoreNotifications().then(r => {});
            }
        };
        contentElement.addEventListener('scroll', handleScroll);
        return () => contentElement.removeEventListener('scroll', handleScroll);
    }, [isLoadingMore, hasMoreToLoad, loadMoreNotifications]);


    return (
        <>
            <GlobalStyles />
            <Box
                className="relative"
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
            >
                <IconButton sx={{ position: 'relative', }} aria-label="notifications">
                    <IoNotifications size={24} color="#0E22E9" />
                    {notReadNotification > 0 && (
                        <Box className={`absolute top-0 right-0 w-5 h-5 rounded-full font-bold text-black text-xs z-[1000] flex items-center justify-center bg-red-500 ${notReadNotification > 0 ? 'animate-pulse-custom' : ''}`}
                             sx={{color: 'white', backgroundColor: '#ff4757'}}
                        >
                            {notReadNotification > 99 ? '99+' : notReadNotification}
                        </Box>
                    )}
                </IconButton>

                <Paper
                    elevation={10}
                    className={`absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white !rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] ${isPanelOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-5'}`}
                    onMouseEnter={() => setIsPanelHovered(true)}
                    onMouseLeave={() => setIsPanelHovered(false)}
                    style={{ maxHeight: 'calc(100vh - 120px)', zIndex: 1100 }}
                >
                    <Box className="p-3 bg-blue-600 text-white flex justify-between items-center rounded-t-xl">
                        <Typography variant="subtitle1" className="!font-semibold !text-base">Notifications</Typography>
                        {notReadNotification > 0 && (
                            <Button size="small" onClick={handleMarkAllReadInternal} className="text-white normal-case !text-xs opacity-90 hover:opacity-100 hover:underline" startIcon={<CheckIcon style={{ fontSize: 16 }}/>}>
                                Mark all as read
                            </Button>
                        )}
                    </Box>

                    <Box ref={notificationContentRef} className="overflow-y-auto flex-grow" style={{maxHeight: '350px'}}>
                        {notifications.length === 0 && !isLoadingMore ? (
                            <Box className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                                <InboxOutlinedIcon className="text-5xl text-gray-300 mb-3" />
                                <Typography>You have no notifications</Typography>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {notifications.map((notification, index) => (
                                    <AdaptedNotificationItem
                                        key={notification.notificationId}
                                        notification={notification}
                                        onMarkAsReadContext={onMarkAsRead}
                                        index={index}
                                        apiLinkUpdate={apiLinkUpdate}
                                    />
                                ))}
                            </List>
                        )}
                        {isLoadingMore && notifications.length === 0 && (
                            <Box className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                                <CircularProgress size={30} />
                            </Box>
                        )}
                    </Box>

                    {notifications.length > 0 && hasMoreToLoad && (
                        <Box className="p-2 text-center border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            {isLoadingMore ? (
                                <CircularProgress size={24} />
                            ) : (
                                <Button onClick={loadMoreNotifications} fullWidth className="text-blue-600 normal-case !text-sm py-1 hover:bg-blue-50">
                                    Load more
                                </Button>
                            )}
                        </Box>
                    )}
                    {!hasMoreToLoad && notifications.length > 0 && (
                        <Box className="p-2 text-center border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <Typography variant="caption" className="text-gray-500 !text-sm">No more notifications</Typography>
                        </Box>
                    )}
                </Paper>
            </Box>
        </>
    );
}