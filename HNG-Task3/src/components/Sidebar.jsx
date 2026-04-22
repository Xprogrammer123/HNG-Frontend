import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Sidebar = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <aside className="bg-sidebar z-100 flex justify-between items-center relative h-[80px] w-full flex-row transition-colors duration-300 lg:flex-col lg:h-screen lg:w-[103px] lg:fixed lg:left-0 lg:top-0 lg:rounded-r-[20px]">
            <div className="bg-primary flex items-center justify-center relative overflow-hidden rounded-r-[20px] h-[80px] w-[80px] lg:h-[103px] lg:w-full after:absolute after:top-1/2 after:left-0 after:right-0 after:bottom-0 after:bg-primary-hover after:rounded-tl-[20px] after:z-1 after:content-['']">
                <svg className="z-2 relative" xmlns="http://www.w3.org/2000/svg" width="28" height="26">
                    <path fill="#FFF" fillRule="evenodd" d="M20.513 0C24.965 2.309 28 6.91 28 12.21 28 19.826 21.732 26 14 26S0 19.826 0 12.21C0 6.91 3.035 2.309 7.487 0L14 12.9z" />
                </svg>
            </div>
            <div className="flex flex-row items-center w-auto lg:flex-col lg:w-full">
                <button className="bg-transparent flex items-center justify-center px-8 lg:px-0 lg:py-8 text-text-tertiary hover:text-text-secondary transition-colors" onClick={toggleTheme}>
                    {theme === 'light' ? (
                        <Moon color="currentColor" size={20} />
                    ) : (
                        <Sun color="currentColor" size={20} />
                    )}
                </button>
                <div className="w-px h-[80px] bg-[#494E6E] lg:w-full lg:h-px"></div>
                <div className="px-8 lg:px-0 lg:py-6">
                    <img className="w-[40px] h-[40px] rounded-full" src="/user.png" alt="User Avatar" />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
