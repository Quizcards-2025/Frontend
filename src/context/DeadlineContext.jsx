import React, { createContext, useState, useContext } from "react";
import * as deadlineService from "../services/fetchDeadline.js";

const DeadlineContext = createContext();

export const DeadlineProvider = ({ children }) => {
    const [listDeadline, setListDeadline] = useState([]);
    const refreshDeadline = async () => {
        try {
            const response = await deadlineService.fetchDataDeadline();
            // console.log(response);
            if (response.status === 200) {
                setListDeadline(response.data);
            } else if (response.status === 404) {
                setListDeadline([]);
            }
        } catch (err) {
            console.log(err);
        }
    };
    return (
        <DeadlineContext.Provider value={{ listDeadline, setListDeadline, refreshDeadline }}>
            {children}
        </DeadlineContext.Provider>
    );
};

export const useDeadline = () => useContext(DeadlineContext);