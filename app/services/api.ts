const BASE_URL = "http://192.168.18.135:8000";

export const getZonesMap = async () => {
    try{
        const res = await fetch(`${BASE_URL}/api/zones/map`);
        const json = await res.json();
        return json;
    }catch (err) {
        console.log("API ERROR", err);
        return { zones: [] };
    }
};

export const getDashboardData = async () => {
    try{
        const res = await fetch(`${BASE_URL}/api/zones/map`);
        const json = await res.json();
        return json;
    }catch (err) {
        console.log("Dashboard API ERROR", err);
        return [];
    }
};
