// authService.js

import {base_api, getAccessToken, getRefreshToken, setAccessToken} from "../apis/api.js";
import navigateByRole from "./NavigateByRole.jsx";

export const navigateByUserData = async (navigate) => {
    try {
        // Lấy thông tin người dùng ban đầu
        const res = await base_api.get("/v1/auth/user-info", {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        console.log(`res: ${JSON.stringify(res.data)}`);
        localStorage.setItem("user", JSON.stringify(res.data));
        navigateByRole(res.data, navigate);
    } catch (err) {
        if (err.response?.status === 401) {
            try {
                // Nếu gặp lỗi 401, thực hiện refresh token
                const refreshRes = await base_api.post("/v1/auth/refresh-token", {
                    refreshToken: getRefreshToken(),
                });
                setAccessToken(refreshRes.data.accessToken);
                try {
                    // Sau khi làm mới token, lấy lại thông tin người dùng
                    const userInfoRes = await base_api.get("/v1/auth/user-info", {
                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`,
                        },
                    });
                    localStorage.setItem("user", JSON.stringify(userInfoRes.data));
                    console.log(`res 1: ${JSON.stringify(userInfoRes.data)}`);
                    navigateByRole(userInfoRes.data, navigate);
                } catch (error) {
                    // Nếu lấy thông tin thất bại, xóa dữ liệu liên quan trong local storage
                    localStorage.removeItem("user");
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                }
            } catch (error) {
                // Nếu refresh token thất bại, xóa dữ liệu liên quan
                localStorage.removeItem("user");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
            }
        }
    }
};
