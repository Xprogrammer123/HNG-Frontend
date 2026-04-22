import React from 'react';
import './FilterStatus.css';

const FilterStatus = ({ filters, onFilterChange }) => {
  const handleChange = (status) => {
    onFilterChange(status);
  };

  return (
    <div className="filter-status">
      <label className="filter-item">
        <input
          type="checkbox"
          checked={filters.all}
          onChange={() => handleChange('all')}
          aria-label="Filter by all invoices"
        />
        <span>All</span>
      </label>
      <label className="filter-item">
        <input
          type="checkbox"
          checked={filters.draft}
          onChange={() => handleChange('draft')}
          aria-label="Filter by draft invoices"
        />
        <span>Draft</span>
      </label>
      <label className="filter-item">
        <input
          type="checkbox"
          checked={filters.pending}
          onChange={() => handleChange('pending')}
          aria-label="Filter by pending invoices"
        />
        <span>Pending</span>
      </label>
      <label className="filter-item">
        <input
          type="checkbox"
          checked={filters.paid}
          onChange={() => handleChange('paid')}
          aria-label="Filter by paid invoices"
        />
        <span>Paid</span>
      </label>
    </div>
  );
};

export default FilterStatus;
