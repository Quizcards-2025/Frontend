import React, {createContext, useContext, useRef, useState} from "react";

const SetPasswordContext = createContext();

export const SetPasswordProvider = ({children}) => {
    const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
    // const havePasswordRef = useRef(false);

    return (
        <SetPasswordContext.Provider value={{
            modalConfirmOpen,
            setModalConfirmOpen,
            // havePasswordRef,
        }}>
            {children}
        </SetPasswordContext.Provider>
    );
};

export const useSetCardPassword = () => useContext(SetPasswordContext);