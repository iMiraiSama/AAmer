import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(null);
    const navigate = useNavigate();

    const login = (type) => {
        setIsAuthenticated(true);
        setUserType(type);
        navigate(type === "user" ? "/user-dashboard" : "/provider-dashboard");
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserType(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userType, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};