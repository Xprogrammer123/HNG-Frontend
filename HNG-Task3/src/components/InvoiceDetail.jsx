import React, { useState, useEffect } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import StatusBadge from './StatusBadge';
import DeleteConfirmation from './DeleteConfirmation';
import './InvoiceDetail.css';

const InvoiceDetail = ({ invoiceId, onBack, onEdit }) => {
  const { invoices, deleteInvoice, markAsPaid, updateInvoice } = useInvoices();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const invoice = invoices.find((inv) => inv.id === invoiceId);

  if (!invoice) {
    return (
      <div className="invoice-detail-container">
        <button className="btn btn-back" onClick={onBack}>
          ← Go back
        </button>
        <p>Invoice not found</p>
      </div>
    );
  }

  const handleDelete = () => {
    deleteInvoice(invoiceId);
    onBack();
  };

  const handleMarkAsPaid = () => {
    markAsPaid(invoiceId);
  };

  const handleEditDraft = () => {
    onEdit(invoiceId);
  };

  const handleMarkAsPending = () => {
    updateInvoice(invoiceId, { status: 'pending' });
  };

  return (
    <div className="invoice-detail-container">
      <button className="btn btn-back" onClick={onBack} aria-label="Go back to invoice list">
        ← Go back
      </button>

      <div className="invoice-detail-header">
        <div className="header-status-section">
          <span className="status-label">Status</span>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="header-actions">
          {invoice.status === 'draft' && (
            <>
              <button className="btn btn-secondary" onClick={handleEditDraft}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </button>
              <button className="btn btn-primary" onClick={handleMarkAsPending}>
                Send Invoice
              </button>
            </>
          )}
          {invoice.status === 'pending' && (
            <>
              <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </button>
              <button className="btn btn-primary" onClick={handleMarkAsPaid}>
                Mark as Paid
              </button>
            </>
          )}
          {invoice.status === 'paid' && (
            <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="invoice-detail-content">
        <div className="invoice-details-section">
          <div className="invoice-id-section">
            <h1>#{invoice.id}</h1>
            <p>{invoice.description}</p>
          </div>

          <div className="sender-address">
            <p className="label">Invoice From</p>
            <p className="name">{invoice.senderAddress.street}</p>
            <p>{invoice.senderAddress.city}</p>
            <p>{invoice.senderAddress.postCode}</p>
            <p>{invoice.senderAddress.country}</p>
          </div>

          <div className="invoice-dates">
            <div className="date-field">
              <p className="label">Invoice Date</p>
              <p className="date">{new Date(invoice.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="date-field">
              <p className="label">Payment Due</p>
              <p className="date">{new Date(invoice.paymentDue).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="client-info">
            <div className="client-address">
              <p className="label">Bill To</p>
              <p className="name">{invoice.clientName}</p>
              <p>{invoice.clientAddress.street}</p>
              <p>{invoice.clientAddress.city}</p>
              <p>{invoice.clientAddress.postCode}</p>
              <p>{invoice.clientAddress.country}</p>
            </div>
            <div className="client-email">
              <p className="label">Sent To</p>
              <p className="email">{invoice.clientEmail}</p>
            </div>
          </div>
        </div>

        <div className="invoice-items-section">
          <table className="items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th className="qty">QTY.</th>
                <th className="price">Price</th>
                <th className="total">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td className="qty">{item.quantity}</td>
                  <td className="price">£{item.price.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                  <td className="total">£{item.total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-summary">
            <div className="summary-row">
              <span className="label">Amount Due</span>
              <span className="amount">£{invoice.total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmation
          invoiceId={invoice.id}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

export default InvoiceDetail;
