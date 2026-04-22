import React, { useState, useRef, useEffect } from 'react';

const CustomDatePicker = ({ value, onChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => {
        return value ? new Date(value) : new Date();
    });
    const datepickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datepickerRef.current && !datepickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const prevMonthDays = getDaysInMonth(year, month - 1);

        const days = [];

        // Previous month's trailing days (if any)
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthDays - i),
                isCurrentMonth: false
            });
        }

        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }

        // Next month's leading days to complete the grid (42 cells max)
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            // Just fill enough for 5 or 6 rows based on what's needed
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }

        // If the 6th row is entirely next month, don't show it
        if (days.length === 42 && !days[35].isCurrentMonth) {
            return days.slice(0, 35);
        }

        return days;
    };

    const handlePrevMonth = (e) => {
        e.stopPropagation();
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateSelect = (date) => {
        // Format to YYYY-MM-DD
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}`);
        setIsOpen(false);
    };

    const isSameDate = (date1, date2Str) => {
        if (!date2Str) return false;
        const date2 = new Date(date2Str);
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    };

    const monthYearStr = currentMonth.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    const days = generateCalendarDays();

    return (
        <div className="relative w-full" ref={datepickerRef}>
            <button
                type="button"
                disabled={disabled}
                className={`w-full p-3 md:px-4 md:py-4 border rounded bg-bg-primary text-text-primary text-[15px] font-bold transition-colors flex justify-between items-center focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${isOpen ? 'border-primary' : 'border-border-color hover:border-primary'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{formatDate(value)}</span>
                <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2h-.667V.667A.667.667 0 0012.667 0H12a.667.667 0 00-.667.667V2H4.667V.667A.667.667 0 004 0h-.667a.667.667 0 00-.666.667V2H2C.897 2 0 2.897 0 4v10c0 1.103.897 2 2 2h12c1.103 2 2-.897 2-2V4c0-1.103-.897-2-2-2zm.667 12c0 .367-.3.667-.667.667H2A.667.667 0 011.333 14V6.693h13.334V14z" fill="#7E88C3" fillRule="nonzero" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full md:w-[240px] bg-bg-secondary rounded-lg shadow-[0_10px_20px_rgba(72,84,159,0.25)] dark:shadow-[0_10px_20px_rgba(0,0,0,0.25)] z-50 p-6 pb-8">
                    <div className="flex justify-between items-center mb-6">
                        <button type="button" onClick={handlePrevMonth} className="p-1 hover:opacity-70 text-primary cursor-pointer focus:outline-none bg-transparent">
                            <svg width="7" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M6.342.886L2.114 5.114l4.228 4.228" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd" /></svg>
                        </button>
                        <span className="text-[15px] font-bold text-text-primary">{monthYearStr}</span>
                        <button type="button" onClick={handleNextMonth} className="p-1 hover:opacity-70 text-primary cursor-pointer focus:outline-none bg-transparent">
                            <svg width="7" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l4.228 4.228L1 9.456" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd" /></svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-y-4">
                        {days.map((dayObj, i) => {
                            const isSelected = isSameDate(dayObj.date, value);
                            return (
                                <div
                                    key={i}
                                    className="flex justify-center items-center"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleDateSelect(dayObj.date)}
                                        className={`text-[15px] font-bold cursor-pointer bg-transparent focus:outline-none 
                      ${dayObj.isCurrentMonth ? 'text-text-primary' : 'text-text-secondary opacity-25'}
                      ${isSelected ? 'text-primary' : 'hover:text-primary'}
                    `}
                                    >
                                        {dayObj.date.getDate()}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
