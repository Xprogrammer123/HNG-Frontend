import React, { useState } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import StatusBadge from './StatusBadge';
import DeleteConfirmation from './DeleteConfirmation';

const baseBtn = "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all cursor-pointer border-none no-underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 px-3 py-3 text-[11px] sm:px-6 sm:py-4 sm:text-[15px] w-full sm:w-auto";

const InvoiceDetail = ({ invoiceId, onBack, onEdit }) => {
  const { invoices, deleteInvoice, markAsPaid, updateInvoice } = useInvoices();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const invoice = invoices.find((inv) => inv.id === invoiceId);

  if (!invoice) {
    return (
      <div className="w-full max-w-[786px] mx-auto">
        <button className="bg-transparent text-text-primary font-bold py-2 px-0 mb-8 text-[13px] hover:text-text-secondary cursor-pointer border-none flex items-center gap-[24px]" onClick={onBack}>
          <svg width="7" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M6.342.886L2.114 5.114l4.228 4.228" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd" /></svg>
          Go back
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
    <div className="w-full max-w-[786px] mx-auto">
      <button className="bg-transparent text-text-primary font-bold py-2 px-0 mb-8 text-[13px] hover:text-text-secondary cursor-pointer border-none flex items-center gap-[24px]" onClick={onBack} aria-label="Go back to invoice list">
        <svg width="7" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M6.342.886L2.114 5.114l4.228 4.228" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd" /></svg>
        Go back
      </button>

      <div className="bg-bg-secondary rounded-lg p-6 flex justify-between mb-6 flex-wrap border border-border-color flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-4">
        <div className="flex items-center w-full justify-between sm:w-auto sm:justify-start gap-4">
          <span className="text-[12px] text-text-secondary font-medium uppercase tracking-[0.25px]">Status</span>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex gap-2 flex-wrap w-full flex-col sm:flex-row sm:w-auto">
          {invoice.status === 'draft' && (
            <>
              <button className={`${baseBtn} bg-bg-secondary text-text-tertiary border border-border-color hover:bg-action-hover`} onClick={handleEditDraft}>
                Edit
              </button>
              <button className={`${baseBtn} bg-danger text-white hover:bg-danger-hover`} onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </button>
              <button className={`${baseBtn} bg-primary text-white hover:bg-primary-hover`} onClick={handleMarkAsPending}>
                Send Invoice
              </button>
            </>
          )}
          {invoice.status === 'pending' && (
            <>
              <button className={`${baseBtn} bg-danger text-white hover:bg-danger-hover`} onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </button>
              <button className={`${baseBtn} bg-primary text-white hover:bg-primary-hover`} onClick={handleMarkAsPaid}>
                Mark as Paid
              </button>
            </>
          )}
          {invoice.status === 'paid' && (
            <button className={`${baseBtn} bg-danger text-white hover:bg-danger-hover`} onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="bg-bg-secondary rounded-lg p-6 sm:p-12 border border-border-color">
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-6 sm:gap-10 mb-8 sm:mb-12 border-b border-border-color pb-6 sm:pb-12">
          <div className="sm:col-span-2">
            <h1 className="text-[18px] sm:text-[24px] font-bold text-text-primary m-0 mb-2">#{invoice.id}</h1>
            <p className="text-[13px] text-text-secondary m-0">{invoice.description}</p>
          </div>

          <div className="flex flex-col gap-3 sm:col-span-1 sm:text-right">
            <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.25px] m-0">Invoice From</p>
            <p className="text-[13px] text-text-primary m-0 leading-relaxed font-bold">{invoice.senderAddress.street}</p>
            <p className="text-[13px] text-text-primary m-0 leading-relaxed">{invoice.senderAddress.city}</p>
            <p className="text-[13px] text-text-primary m-0 leading-relaxed">{invoice.senderAddress.postCode}</p>
            <p className="text-[13px] text-text-primary m-0 leading-relaxed">{invoice.senderAddress.country}</p>
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6 sm:col-span-3">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.25px] m-0">Invoice Date</p>
                <p className="text-[15px] text-text-primary font-bold m-0">{new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.25px] m-0">Payment Due</p>
                <p className="text-[15px] text-text-primary font-bold m-0">{new Date(invoice.paymentDue).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.25px] m-0">Bill To</p>
              <p className="text-[13px] text-text-primary m-0 leading-relaxed font-bold">{invoice.clientName}</p>
              <p className="text-[13px] text-text-primary m-0 leading-relaxed">{invoice.clientAddress.street}</p>
              <p className="text-[13px] text-text-primary m-0 leading-relaxed">{invoice.clientAddress.city}</p>
              <p className="text-[13px] text-text-primary m-0 leading-relaxed">{invoice.clientAddress.postCode}</p>
              <p className="text-[13px] text-text-primary m-0 leading-relaxed">{invoice.clientAddress.country}</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.25px] m-0">Sent To</p>
              <p className="text-[15px] text-text-primary font-bold break-all m-0">{invoice.clientEmail}</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-primary rounded-lg p-4 sm:p-8 mt-8">
          <table className="w-full border-collapse mb-6">
            <thead className="bg-action-hover">
              <tr>
                <th className="p-2 sm:p-4 text-left text-[11px] font-bold uppercase tracking-[0.25px] text-text-secondary">Item Name</th>
                <th className="p-2 sm:p-4 text-[11px] font-bold uppercase tracking-[0.25px] text-text-secondary text-right">QTY.</th>
                <th className="p-2 sm:p-4 text-[11px] font-bold uppercase tracking-[0.25px] text-text-secondary text-right">Price</th>
                <th className="p-2 sm:p-4 text-[11px] font-bold uppercase tracking-[0.25px] text-text-secondary text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="[&>td]:border-b [&>td]:border-border-color last:[&>td]:border-b-0">
                  <td className="p-2 sm:p-4 text-[11px] sm:text-[13px] text-text-primary font-bold">{item.name}</td>
                  <td className="p-2 sm:p-4 text-[11px] sm:text-[13px] text-text-primary text-right font-bold">{item.quantity}</td>
                  <td className="p-2 sm:p-4 text-[11px] sm:text-[13px] text-text-primary text-right font-bold">£{item.price.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                  <td className="p-2 sm:p-4 text-[11px] sm:text-[13px] text-text-primary text-right font-bold">£{item.total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center p-6 bg-action-hover rounded-lg mt-6 gap-2 sm:gap-0">
            <span className="text-[12px] text-text-secondary font-medium">Amount Due</span>
            <span className="text-[20px] sm:text-[24px] font-bold text-text-primary">£{invoice.total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
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
