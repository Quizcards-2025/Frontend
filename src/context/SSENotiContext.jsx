import {createContext, useContext, useEffect, useRef} from "react";
import {useNotification} from "src/context/NotificationContext.jsx";
import {api, apiStr, getAccessToken} from "src/apis/api.js";
import {EventSourcePolyfill} from "event-source-polyfill";
import {toast} from "react-toastify";

const SSENotiContext = createContext();

export const SSENotiProvider = ({ children }) => {
    const { handleAppendNotifications, handleFetchDataApi } = useNotification();
    const sseRef = useRef(null);
    const reconnectDelay = 25000;
    const disconnectAfterDelay = 50000;

    const initialId = (() => {
        const stored = localStorage.getItem('lastStreakEventId');
        if (stored) return stored;
        localStorage.setItem('lastStreakEventId', '0-0');
        return '';
    })();

    const lastIdRef = useRef(initialId);

    const connectSse = () => {
        if (sseRef.current) sseRef.current.close();

        const userItem = localStorage.getItem("user");
        if (!userItem) return;

        const token = getAccessToken();
        const es = new EventSourcePolyfill(
            `${apiStr}/v1/notification/sse/streak-stream`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Last-Event-ID': lastIdRef.current,
                },
                withCredentials: true,
            }
        );
        sseRef.current = es;

        es.onopen = () => {
            console.log('[SSE] connected');
            setTimeout(() => {
                console.log(`[SSE] closing after ${disconnectAfterDelay / 1000}s`);
                es.close();
                console.log(`[SSE] connecting again after ${reconnectDelay / 1000}s to refresh`);
                setTimeout(connectSse, reconnectDelay);
            }, disconnectAfterDelay);
        };

        es.onmessage = (event) => {
            toast.success("Get from SSE");
            lastIdRef.current = event.lastEventId || lastIdRef.current;
            // const mockNoti = {
            //     notificationId: crypto.randomUUID(),
            //     message: 'Hello world',
            //     userId: '',
            //     isRead: false,
            //     createdAt: new Date().toISOString(),
            // };
            // console.log("Push to notification: ", mockNoti);
            // handleAppendNotifications(mockNoti);
        };

        // es.addEventListener('message', (event) => {
        //     toast.info("Get from SSE hello world", {
        //         position: "bottom-right",
        //     });
        //     console.log("Event data: ", event.data);
        //     lastIdRef.current = event.lastEventId || lastIdRef.current;
        //     const mockNoti = {
        //         notificationId: crypto.randomUUID(),
        //         message: 'Hello world ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        //         userId: '',
        //         isRead: false,
        //         createdAt: new Date().toISOString(),
        //     };
        //     console.log("Push to notification: ", mockNoti);
        //     handleAppendNotifications(mockNoti);
        // });

        // Khi có sự kiện mới
        es.addEventListener('message', evt => {
            try {
                const raw = JSON.parse(evt.data);
                const resp = raw.response || {};
                const payload = resp.payload || {};

                // Map về đúng shape NotificationEntry của bạn
                const entry = {
                    notificationId: payload.notificationId,
                    userId: payload.userId,
                    message: resp.message,
                    urlLink: payload.urlLink,      // nếu có
                    payload,                       // giữ nguyên toàn bộ payload
                    isRead: false,
                    createdAt: payload.createdAt   // ISO-8601 UTC string
                };

                console.log();

                // Cập nhật Last-Event-ID để resume
                lastIdRef.current = evt.lastEventId || lastIdRef.current;
                sessionStorage.setItem('lastStreakEventId', lastIdRef.current);

                console.log("Event: ", evt);

                console.log("Sended from server...");

                handleAppendNotifications(entry);
            } catch (e) {
                console.error('[SSE] parse error:', e, evt.data);
            }
        });

        es.addEventListener('ping', (event) => {
            // toast.info("Get from SSE ping", {
            //     position: "bottom-right",
            // });
            console.log("Event data ping: ", event.data);
            lastIdRef.current = event.lastEventId || lastIdRef.current;
        });


        es.onerror = (err) => {
            console.error('[SSE] error:', err);
            es.close();
            setTimeout(connectSse, reconnectDelay);
        };
    };

    const disconnectSse = () => {
        if (sseRef.current) {
            sseRef.current.close();
            sseRef.current = null;
        }
    };

    const logoutSse = () => {
        disconnectSse();
        localStorage.removeItem('lastStreakEventId');
    };

    useEffect(() => {
        connectSse();
        return () => sseRef.current?.close();
    }, []);

    return (
        <SSENotiContext.Provider value={{
            logoutSse,
        }}>
            {children}
        </SSENotiContext.Provider>
    );
};

export const useSSENoti = () => useContext(SSENotiContext);