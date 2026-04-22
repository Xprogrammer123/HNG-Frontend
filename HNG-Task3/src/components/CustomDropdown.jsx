import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                className={`w-full p-3 md:px-4 md:py-4 border rounded bg-bg-primary text-text-primary text-[15px] font-bold transition-colors flex justify-between items-center focus-visible:outline-none ${isOpen ? 'border-primary' : 'border-border-color hover:border-primary'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedOption.label}</span>
                <svg width="11" height="7" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <path d="M1 1l4.228 4.228L9.456 1" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-bg-secondary rounded-lg shadow-[0_10px_20px_rgba(72,84,159,0.25)] dark:shadow-[0_10px_20px_rgba(0,0,0,0.25)] z-50 overflow-hidden">
                    {options.map((option, index) => (
                        <div
                            key={option.value}
                            className={`p-4 text-[15px] font-bold cursor-pointer transition-colors ${index !== options.length - 1 ? 'border-b border-border-color' : ''} text-text-primary hover:text-primary`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
