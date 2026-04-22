import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="26">
                    <path fill="#FFF" fillRule="evenodd" d="M20.513 0C24.965 2.309 28 6.91 28 12.21 28 19.826 21.732 26 14 26S0 19.826 0 12.21C0 6.91 3.035 2.309 7.487 0L14 12.9z" />
                </svg>
            </div>
            <div className="sidebar-bottom">
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'light' ? (
                        <Moon color="#888EB0" size={20} />
                    ) : (
                        <Sun color="#888EB0" size={20} />
                    )}
                </button>
                <div className="divider"></div>
                <div className="avatar">
                    <img src="/image-avatar.jpg" alt="User Avatar" />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
