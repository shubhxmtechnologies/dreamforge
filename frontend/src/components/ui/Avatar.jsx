import { LayoutGrid, LogOut } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'

import { useAuth } from "../../utils/AuthContext"
const Avatar = () => {

    const { logout, user } = useAuth()

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Mock user data


    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex cursor-pointer items-center gap-2 bg-white border w-10 h-10 overflow-hidden border-slate-300  rounded-full hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <img src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user.avatar}`} alt="User Avatar" className="w-full h-full" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-down">
                    <div className="p-4 border-b border-slate-200">
                        <p className="font-semibold text-slate-800">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <div className="p-2">
                        <div className="px-2 py-1.5 text-sm text-slate-600">
                            Credits remaining: <span className="font-semibold text-indigo-600">{user.credits}</span>
                        </div>
                        <a href="/gallery" className="flex items-center gap-3 w-full px-2 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 transition">
                            <LayoutGrid size={16} />
                            <span>My Gallery</span>
                        </a>
                        <button onClick={logout} className="flex cursor-pointer items-center gap-3 w-full px-2 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition">
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Avatar