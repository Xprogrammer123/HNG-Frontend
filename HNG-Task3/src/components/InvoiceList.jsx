import React, { useState } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import StatusBadge from './StatusBadge';
import FilterStatus from './FilterStatus';
import './InvoiceList.css';

const InvoiceList = ({ onSelectInvoice, onNewInvoice }) => {
  const { invoices } = useInvoices();
  const [filters, setFilters] = useState({
    all: true,
    draft: false,
    pending: false,
    paid: false,
  });

  const handleFilterChange = (status) => {
    if (status === 'all') {
      setFilters({
        all: !filters.all,
        draft: false,
        pending: false,
        paid: false,
      });
    } else {
      const newFilters = {
        ...filters,
        all: false,
        [status]: !filters[status],
      };
      const hasAnyFilter = newFilters.draft || newFilters.pending || newFilters.paid;
      if (!hasAnyFilter) {
        newFilters.all = true;
      }
      setFilters(newFilters);
    }
  };

  const getFilteredInvoices = () => {
    if (filters.all) {
      return invoices;
    }
    return invoices.filter((inv) => {
      if (filters.draft && inv.status === 'draft') return true;
      if (filters.pending && inv.status === 'pending') return true;
      if (filters.paid && inv.status === 'paid') return true;
      return false;
    });
  };

  const filteredInvoices = getFilteredInvoices();

  return (
    <div className="invoice-list-container">
      <div className="invoice-list-header">
        <div>
          <h1>Invoices</h1>
          <p className="invoice-count">
            {filteredInvoices.length > 0 ? `${filteredInvoices.length} invoice${filteredInvoices.length !== 1 ? 's' : ''}` : 'No invoices'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={onNewInvoice} aria-label="Create new invoice">
          <span className="btn-plus">+</span> New Invoice
        </button>
      </div>

      <FilterStatus filters={filters} onFilterChange={handleFilterChange} />

      {filteredInvoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
              <path fill="currentColor" d="M50 0C22.38 0 0 22.38 0 50s22.38 50 50 50 50-22.38 50-50S77.62 0 50 0zm0 94C26.43 94 7 74.57 7 50S26.43 6 50 6s43 19.43 43 44-19.43 44-43 44z" />
            </svg>
          </div>
          <h2>No invoices</h2>
          <p>Create your first invoice to get started</p>
        </div>
      ) : (
        <div className="invoice-list">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="invoice-item"
              onClick={() => onSelectInvoice(invoice.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectInvoice(invoice.id);
                }
              }}
            >
              <div className="invoice-item-id">
                <span className="invoice-id">#{invoice.id}</span>
                <p className="invoice-client-name">{invoice.clientName}</p>
              </div>
              <div className="invoice-item-due">
                <p className="due-date">Due {new Date(invoice.paymentDue).toLocaleDateString()}</p>
              </div>
              <div className="invoice-item-total">
                <span className="total-amount">£{invoice.total?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '0.00'}</span>
              </div>
              <div className="invoice-item-status">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
