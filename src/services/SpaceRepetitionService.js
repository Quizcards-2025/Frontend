import {api} from "src/apis/api.js";

import {getOffsetHours, getOffsetMinutes} from "../utils/timeLanguageUtils.js";

export const getSrsData = async (setId, password, expiredAt) => {
    try {
        const offsetHours = getOffsetHours();
        const offsetMinutes = getOffsetMinutes();
        const resSrsData = await api.get("/v1/srs-progress/get-progress-card-base-on-round", {
            params: {
                setId,
                offsetHours,
                offsetMinutes,
            },
            headers: {
                "X-Set-Password": password,
                "X-Set-Password-Valid-At": expiredAt,
            }
        });
        return resSrsData.data;
    } catch (err) {
        throw err;
    }
};

export const getAnalysisSrsProgress = async (setId) => {
    try {
        const resAnalysisSrsProgress = await api.get("/v1/srs-progress/get-analysis-progress", {
            params: {
                setId,
            },
        });
        return resAnalysisSrsProgress.data;
    } catch (err) {
        throw err;
    }
};

export const submitSrsProgress = async (requestData) => {
    try {
        const resResult = await api.post("/v1/srs-progress/submit-progress", {
            ...requestData,
        });
        return resResult.data;
    } catch (err) {
        throw err;
    }
};