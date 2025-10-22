import { useState, useEffect } from "react";

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("idToken");
        setIsAuthenticated(!!token);
    }, []);

    return { isAuthenticated };
}