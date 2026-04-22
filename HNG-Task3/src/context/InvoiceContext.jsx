import React, { createContext, useContext, useState, useEffect } from 'react';
import initialData from '../data/data.json';

const InvoiceContext = createContext();

export const InvoiceProvider = ({ children }) => {
    const [invoices, setInvoices] = useState(() => {
        const saved = localStorage.getItem('invoices');
        if (saved) {
            return JSON.parse(saved);
        }
        return initialData;
    });

    useEffect(() => {
        localStorage.setItem('invoices', JSON.stringify(invoices));
    }, [invoices]);

    const addInvoice = (invoice) => {
        setInvoices(prev => [...prev, invoice]);
    };

    const updateInvoice = (id, updatedInvoice) => {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updatedInvoice } : inv));
    };

    const deleteInvoice = (id) => {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
    };

    const markAsPaid = (id) => {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'paid' } : inv));
    };

    return (
        <InvoiceContext.Provider value={{ invoices, addInvoice, updateInvoice, deleteInvoice, markAsPaid }}>
            {children}
        </InvoiceContext.Provider>
    );
};

export const useInvoices = () => useContext(InvoiceContext);
