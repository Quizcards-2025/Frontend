import {createContext, useContext, useMemo} from "react";

const TabIdContext = createContext(null);

export const TabIdProvider = ({children}) => {
    const tabId = useMemo(() =>
        Math.random().toString(), [])

    return (
        <TabIdContext.Provider value={{
            tabId,
        }}>
            {children}
        </TabIdContext.Provider>
    );
};

export const useTabId = () => useContext(TabIdContext);