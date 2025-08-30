import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from "axios"
import { useNavigate } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_SERVER_URL;

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    // 3. Check for user session on initial load
    async function fetchUser() {

        try {
            setLoading(true)
            const token = localStorage.getItem('user');
            if (!token) {
                return setUser(null)
            }


            const userDetails = await axios.get(apiUrl + "/api/v1/getUser", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            setUser(userDetails.data.user)

            //  get details of user
        } catch (error) {
            console.log("Failed to parse user from localStorage", error);
            // If parsing fails, clear the invalid data
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate("/signup")
    };

    const checkLocalStorage = () => {
        const dbUser = localStorage.getItem("user")
        
        return !!dbUser
    }

    // 5. Value to be passed to consuming components
    const value = {
        user,
        checkLocalStorage,
        loading,
        setUser,
        logout,
        fetchUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 7. Create a custom hook for easy access to the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
