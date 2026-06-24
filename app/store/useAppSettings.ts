import { useState, useEffect } from "react";

type Settings = {
    allNotifications: boolean;
    alertsEnabled: boolean;
    emergency: boolean;
    flood: boolean;
    sos: boolean;

    //future
    weather: boolean;
    fire: boolean;
    earthquake: boolean;
};

let globalState: Settings = {
    allNotifications: true,
    alertsEnabled: true,
    emergency: true,
    flood: true,
    sos: true,

    weather: false,
    fire: false,
    earthquake: false,
};

let listeners: ((state: Settings) => void)[] = [];

export const useAppSettings = () => {
    const [state, setState] = useState(globalState);

    const updateState = (newState: Partial<Settings>) => {
        globalState = { ...globalState, ...newState };

        // 🔥 RULE: if ALL OFF → force alerts OFF
        if (!globalState.allNotifications) {
            globalState = {
                ...globalState,
                alertsEnabled: true,
                emergency: true,
                flood: true,
                sos: true,
            };
        }

        listeners.forEach((l) => l(globalState));
    };

   useEffect(() => {
        listeners.push(setState);
        return () => {
            listeners = listeners.filter((l) => l !== setState);
        };
    }, []);

    return {
        settings: state,
        updateState,
    };
};