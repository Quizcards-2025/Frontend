import api from "src/apis/api.js";

export const fetchDataDeadline = async () => {
    try {
        // const response = await api.get("http://localhost:8080/api/v1/deadline/user");
        const response = await api.get("/v1/deadline/user");
        return response;
    } catch (err) {
        console.log(err);
    }
}