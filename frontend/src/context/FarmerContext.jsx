import { createContext, useState, useContext } from 'react';

const FarmerContext = createContext();

export const FarmerProvider = ({ children }) => {
    const [preferences, setPreferences] = useState({});

    return (
        <FarmerContext.Provider value={{ preferences, setPreferences }}>
            {children}
        </FarmerContext.Provider>
    );
};

export const useFarmer = () => useContext(FarmerContext);
