import axios from "axios";
import api, {base_api, getAccessToken, getRefreshToken} from "src/apis/api.js";
import {toast} from "react-toastify";

export const register = async (userData) => {
    try {
        // const response = await base_api.post(`http://localhost:8080/api/v1/auth/signup`, userData)
        const response = await base_api.post(`/v1/auth/signup`, userData)
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const getYourProfile = async () => {
    try {
        localStorage.removeItem("user");
        // const response = await api.get(`http://localhost:8080/api/v1/auth/user-info`);
        const response = await api.get(`/v1/auth/user-info`);
        console.log(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
        return response.data;
    } catch (err) {
        console.log(err);
    }
}
export const logout = async () => {
    try {
        // const result = await api.post("http://localhost:8080/api/v1/auth/logout",
        //     {
        //         refresh_token: getRefreshToken(),
        //         access_token: getAccessToken(),
        //     },
        //     {withCredentials: true});
        const result = await api.post("/v1/auth/logout",
            {
                refresh_token: getRefreshToken(),
                access_token: getAccessToken(),
            },
            {withCredentials: true});
        console.log('logout:', result);
        return result;
    } catch (err) {
        throw err;
    }
}

export const logoutAll = async () => {
    try {
        // const result = await api.post("http://localhost:8080/api/v1/auth/logout-all", {withCredentials: true});
        const result = await api.post("/v1/auth/logout-all", {withCredentials: true});
        console.log('logout:', result);
        return result;
    } catch (err) {
        throw err;
    }
}

export const authenticate = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user;
}