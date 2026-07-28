import React, {createContext, useReducer, useEffect, useContext} from "react";
import api from "../apis/api.js";

// Tạo Context
const UserContext = createContext();

const defaultUser = {
    id: -1
};

// Reducer
const userReducer = (state, action) => {
    switch (action.type) {
        case "SET_USER":
            return {...state, user: action.payload};
        case "CLEAR_USER":
            return {...state, user: defaultUser};
        default:
            throw new Error(`Unknown action: ${action.type}`);
    }
};

// Provider
export const UserProvider = ({children}) => {
    const [state, dispatch] = useReducer(userReducer, defaultUser);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userInfo = await api.get("/v1/auth/user-info");
                dispatch({type: "SET_USER", payload: userInfo.data});
            } catch {
                dispatch({type: "CLEAR_USER"});
            }
        };
        fetchUser().then().catch();
    }, []);

    return (
        <UserContext.Provider value={{state, dispatch}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);
