import {createContext, useCallback, useContext, useState} from "react";
import api from "src/apis/api.js";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(6);
    const [preferUnread, setPreferUnread] = useState(true);

    /*
    * notification = {
    *   notificationId: "string",
    *   message: "string",
    *   userId: "string",
    *   isRead: boolean,
    *   createdAt: "string",
    * }
    * */
    const [notifications, setNotifications] = useState([]);

    const notReadNotification = notifications.filter((noti) => noti.isRead === false).length;

    const handleSetPage = (page) => {
        setPage(page);
    };

    const handleSetSize = (size) => {
        setSize(size);
    };

    const handleAppendNotifications = useCallback((incoming) => {
        setNotifications(prev => {
            // chuẩn hóa thành mảng
            const items = Array.isArray(incoming) ? incoming : [incoming];

            // 2) merge và dedupe theo notificationId
            const merged = [...prev, ...items];
            const mapById = new Map();
            merged.forEach(n => mapById.set(n.notificationId, n));
            const unique = Array.from(mapById.values());

            // 3) sắp xếp
            // sort by isRead false -> true
            unique.sort((a, b) => {
                if (preferUnread && a.isRead !== b.isRead) {
                    return a.isRead ? 1 : -1;
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            // 4) điều chỉnh page nếu cần
            setPage(oldPage => {
                const total = unique.length;
                const pageCount = Math.ceil(total / size);
                return Math.min(oldPage, pageCount - 1);
            });

            return unique;
        });
    }, [size, preferUnread]);

    const onMarkAsRead = useCallback(async (notificationIds, apiLink) => {
        setNotifications(prev =>
            prev.map(n =>
                notificationIds.includes(n.notificationId)
                    ? { ...n, isRead: true }
                    : n
            )
        );
        try {
            const res = await api.patch(apiLink, notificationIds);
            // you could merge res.data if you want the server's source of truth
            console.log("Marked read:", res.data);
        } catch (err) {
            console.error("Failed to mark as read", err);
            // perhaps rollback UI if you want
        }
    }, []);

    const handleFetchDataApi = useCallback(async (apiLink) => {
        try {
            console.log("Before setting data...");
            const res = await api.get(apiLink, {
                params: { page, size, preferUnread }
            });
            handleAppendNotifications(res.data);
            console.log("After setting data...");
            console.log("Data: ", res.data);
        } catch (err) {
            console.error(err);
        }
    }, [page, size, handleAppendNotifications]);

    const handleFetchDataApiWithPageParam = async (apiLink, page, size) => {
        try {
            console.log("Before setting data...");
            const res = await api.get(apiLink, {
                params: { page, size, preferUnread }
            });
            handleAppendNotifications(res.data);
            console.log("After setting data...");
            console.log("Data: ", res.data);
            return res.data != null && res.data.length > 0;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const logoutNotification = useCallback(() => {
        setNotifications([]);
        setPage(0);
        setSize(6);
        setPreferUnread(true);
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                page,
                size,
                notifications,
                notReadNotification,
                handleSetPage,
                handleSetSize,
                handleAppendNotifications,
                onMarkAsRead,
                handleFetchDataApi,
                handleFetchDataApiWithPageParam,
                logoutNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);