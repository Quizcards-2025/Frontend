import {api} from "src/apis/api.js";


export const getSrsSetting = async (setId, password = "", expiredAt = 0) => {
    try {
        const resSetting = await api.get(`/v1/setting-progress/get-setting?setId=${setId}`,
            {
                headers: {
                    "X-Set-Password": password,
                    "X-Set-Password-Valid-At": expiredAt,
                }
            });
        return resSetting.data;
    } catch (err) {
        throw err;
    }
};


export const getSrsEffectiveSetting = async (setId, password = "", expiredAt = 0) => {
    try {
        const resEffectSetting = await api.get(`/v1/setting-progress/get-effective-setting?setId=${setId}`,
            {
                headers: {
                    "X-Set-Password": password,
                    "X-Set-Password-Valid-At": expiredAt,
                }
            });
        return resEffectSetting.data;
    } catch (err) {
        throw err;
    }
}

export const resetSrsProgresses = async (setId) => {
    try {
        const resResetSetting = await api.delete(`/v1/srs-progress/reset-srs-progress?setId=${setId}`);
        return resResetSetting.data;
    } catch (err) {
        throw err;
    }
};