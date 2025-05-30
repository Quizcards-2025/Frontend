// src/api/api.js
import axios from 'axios';
import {toast} from "react-toastify";

export const apiStr = 'http://localhost:8080/api';
export const baseApiStr = 'http://localhost:8080/api';

// export const apiStr = 'https://13.212.202.156/api';
// export const baseApiStr = 'https://13.212.202.156/api';

export const api = axios.create({
    baseURL: apiStr,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const base_api = axios.create({
    baseURL: baseApiStr,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAccessToken = () => localStorage.getItem('access_token');

export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const setAccessToken = (token) => localStorage.setItem('access_token', token);

export const setRefreshToken = (token) => localStorage.setItem('refresh_token', token);

// const refreshAccessToken = async () => {
//     try {
//         const response = await api.post('/v1/auth/refresh-token');
//         setAccessToken(response.data.accessToken);
//         setRefreshToken(response.data.refreshToken);
//         return response.data.accessToken;
//     } catch (error) {
//         console.error('Lỗi khi refresh token:', error);
//         return null;
//     }
// };
//
// api.interceptors.request.use(
//     (config) => {
//         const token = getAccessToken();
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );
//
// api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;
//
//         if (error.response?.status === 401 || error.response?.status === 403) {
//             if (!originalRequest._retry) {
//                 originalRequest._retry = true;
//                 try {
//                     const newAccessToken = await refreshAccessToken();
//                     if (newAccessToken) {
//                         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//                         return api(originalRequest);
//                     } else {
//                         localStorage.removeItem('access_token');
//                         localStorage.removeItem('refresh_token');
//
//                         toast.error("Session expired. Please log in again.");
//                         window.location.href = '/login';
//                     }
//                 } catch (err) {
//                     localStorage.removeItem('access_token');
//                     localStorage.removeItem('refresh_token');
//
//                     toast.error("Session expired. Please log in again.");
//                     window.location.href = '/login';
//                 }
//
//                 // if (!originalRequest._retry || !getRefreshToken()) {
//                 //
//                 // }
//             } else {
//                 localStorage.removeItem('access_token');
//                 localStorage.removeItem('refresh_token');
//
//                 toast.error("Session expired. Please log in again.");
//                 window.location.href = '/login';
//             }
//             // Nếu không refresh được token
//
//         }
//         return Promise.reject(error);
//     }
// );
//
//
// export default api;

// biến quản lý luồng refresh
let isRefreshing = false;
let refreshSubscribers = [];

// notify tất cả những request “đang đợi”
function onRefreshed(token) {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
}

// thêm callback vào hàng đợi
function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

const refreshAccessToken = async () => {
    try {
        const response = await api.post('/v1/auth/refresh-token');
        const { accessToken, refreshToken } = response.data;
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        return accessToken;
    } catch (err) {
        console.error('Lỗi khi refresh token:', err);
        return null;
    }
};

// inject Bearer vào mọi request
api.interceptors.request.use(cfg => {
    const token = getAccessToken();
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// response interceptor
api.interceptors.response.use(
    res => res,
    error => {
        const { config, response } = error;
        const originalRequest = config;

        // console.log(response);

        if ((response?.status === 401 || response?.status === 403) &&
            (response?.headers['x-validate-again'] === "true")
            && !originalRequest._retry) {
            // đánh dấu đã retry
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                refreshAccessToken().then(newToken => {
                    isRefreshing = false;
                    if (newToken) {
                        onRefreshed(newToken);
                    } else {
                        // nếu refresh fail thì clear queue và redirect
                        onRefreshed(null);
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        toast.error('Session expired. Please log in again.');
                        window.location.href = '/login';
                    }
                });
            }

            // trả về promise mới, đợi token rồi retry
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh(token => {
                    if (token) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    } else {
                        reject(error);
                    }
                });
            });
        }

        // những lỗi khác hoặc đã retry rồi
        return Promise.reject(error);
    }
);

export default api;