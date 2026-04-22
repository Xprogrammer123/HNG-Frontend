import React, { useState } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import StatusBadge from './StatusBadge';
import FilterStatus from './FilterStatus';

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
    <div className="w-full max-w-[786px] mx-auto">
      <div className="flex justify-between items-center mb-8 gap-0 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-[20px] sm:text-[36px] font-bold text-text-primary tracking-[-1.13px] m-0 mb-1">Invoices</h1>
          <p className="text-[12px] text-text-secondary font-medium m-0">
            {filteredInvoices.length > 0 ? <span className="hidden sm:inline">There are {filteredInvoices.length} total invoices</span> : <span className="hidden sm:inline">No invoices</span>}
            {filteredInvoices.length > 0 ? <span className="sm:hidden">{filteredInvoices.length} invoices</span> : <span className="sm:hidden">No invoices</span>}
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-10">
          <FilterStatus filters={filters} onFilterChange={handleFilterChange} />

          <button
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-[30px] hover:bg-primary-hover transition-colors border-none cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 p-2 pr-4 sm:py-3 sm:px-4 sm:pr-6"
            onClick={onNewInvoice}
            aria-label="Create new invoice"
          >
            <span className="bg-white w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0">
              <svg width="11" height="11" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.313 10.023v-3.71h3.71v-2.58h-3.71V.023h-2.58v3.71H.023v2.58h3.71v3.71z" fill="#7C5DFA" fillRule="nonzero" />
              </svg>
            </span>
            <span className="font-bold text-[15px]">New<span className="hidden sm:inline"> Invoice</span></span>
          </button>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-[60px] px-5">
          <div className="w-[250px] h-[250px] mx-auto mb-6 text-text-secondary ">
            <img src="/nothing.svg" height={250} width={250} alt="No invoices illustration" />
          </div>
          <h2 className="text-[20px] font-bold text-text-primary mb-2">There is nothing here</h2>
          <p className="text-[12px] text-text-secondary ">Create an invoice by clicking the <br /><span className="font-bold">New Invoice</span> button and get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-bg-secondary border border-transparent rounded-lg shadow-custom-sm hover:border-primary transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 grid grid-cols-2 p-6 sm:grid-cols-[80px_140px_1fr_auto_120px_20px] sm:items-center sm:gap-x-4 sm:p-4 sm:px-8"
              onClick={() => onSelectInvoice(invoice.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectInvoice(invoice.id);
                }
              }}
            >
              <div className="col-start-1 row-start-1 sm:col-auto sm:row-auto">
                <span className="font-bold text-[15px] text-text-primary"><span className="text-text-tertiary">#</span>{invoice.id}</span>
              </div>
              <div className="col-start-1 row-start-2 mt-4 sm:mt-0 sm:col-auto sm:row-auto">
                <p className="text-[12px] text-text-secondary m-0">Due {new Date(invoice.paymentDue).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="col-start-2 row-start-1 text-right sm:text-left sm:col-auto sm:row-auto">
                <span className="text-[12px] text-text-secondary">{invoice.clientName}</span>
              </div>
              <div className="col-start-1 row-start-3 mt-1 sm:mt-0 sm:col-auto sm:row-auto sm:text-right">
                <span className="font-bold text-[16px] text-text-primary">£ {invoice.total?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '0.00'}</span>
              </div>
              <div className="col-start-2 row-start-2 row-span-2 flex justify-end items-center sm:col-auto sm:row-auto">
                <StatusBadge status={invoice.status} />
              </div>
              <div className="hidden sm:flex sm:justify-end sm:col-auto sm:row-auto">
                <svg width="7" height="10" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1l4 4-4 4" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
