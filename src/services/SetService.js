import {api} from "src/apis/api.js";

export const getListCourse = async () => {
    try {
        // const response = await api.get(`http://localhost:8080/api/v1/set/list/sets`);
        const response = await api.get(`/v1/set/list/sets`);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
export const getDetailSetById = async (setId) => {
    try {
        // const response = await api.get(`http://localhost:8080/api/v1/set/detail/${setId}`)
        const response = await api.get(`/v1/set/detail/${setId}`)
        // console.log(response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getSetDetail = async (setId) => {
    try {
        const response = await api.get(`/v1/set/set-detail/${setId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getTotalPublicSetsByAuthor = async (userId) => {
    try {
        // const response = await api.get(`http://localhost:8080/api/v1/set/count-public-set/${userId}`)
        const response = await api.get(`/v1/set/count-public-set/${userId}`)
        // console.log(response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const getListCardBySetId = async (setId) => {
    try {
        // const response = await api.get(`http://localhost:8080/api/v1/set/list/${setId}`)
        const response = await api.get(`/v1/set/list/${setId}`)
        // console.log(response);
        return response;
    } catch (error) {
        throw error;
    }
}
export const getListFolder = async () => {
    try {
        // const response = await api.get(`http://localhost:8080/api/v1/folder/user`)
        const response = await api.get(`/v1/folder/user`)
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}