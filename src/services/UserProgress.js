
import {api} from "src/apis/api.js";


export const getProgressBySetIdUserId = async (userID,setID, setPassword = "", expiredAt = 0) => {
    try {
        // const response = await api.get(`/v1/progress/user/${userID}/set/${setID}`)
        const response = await api.get(`/v1/progress/user/set/${setID}`, {
            headers: {
                'X-Set-Password': setPassword,
                'X-Set-Password-Valid-At' : expiredAt,
            }
        });
        // console.log(response.data)
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getProgressAnalysisBySetIdUserId = async (userID,setID) => {
    try {
        const response = await api.get(`/v1/progress/user/analysis/set/${setID}`);
        // console.log(response.data)
        return response.data;
    } catch (error) {
        throw error;
    }
}