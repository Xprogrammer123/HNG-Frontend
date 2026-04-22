import React, { useState, useRef, useEffect } from 'react';

const FilterStatus = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleChange = (status) => {
    onFilterChange(status);
  };

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
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        className="bg-transparent text-text-primary font-bold text-[15px] flex items-center border-[none] cursor-pointer p-0"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="hidden md:inline">Filter by status</span>
        <span className="inline md:hidden">Filter</span>
        <svg
          width="11"
          height="7"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', marginLeft: '12px' }}
        >
          <path d="M1 1l4.228 4.228L9.456 1" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-6 bg-bg-secondary rounded-lg shadow-custom-sm p-6 flex flex-col gap-4 w-[192px] z-10">
          {['all', 'draft', 'pending', 'paid'].map((status) => (
            <label key={status} className="flex items-center gap-3 cursor-pointer select-none font-bold text-[15px] text-text-primary group">
              <input
                type="checkbox"
                className="absolute opacity-0 cursor-pointer h-0 w-0 peer"
                checked={filters[status]}
                onChange={() => handleChange(status)}
                aria-label={`Filter by ${status} invoices`}
              />
              <span className="h-4 w-4 bg-border-color rounded-sm inline-flex items-center justify-center transition-all border border-transparent group-hover:border-primary peer-checked:bg-primary after:content-[''] after:w-2 after:h-[5px] after:border-l-2 after:border-b-2 after:border-white after:-rotate-45 after:mb-[2px] after:hidden peer-checked:after:block"></span>
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterStatus;
