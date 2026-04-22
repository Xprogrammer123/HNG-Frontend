import React, { useState, useEffect } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import CustomDatePicker from './CustomDatePicker';
import CustomDropdown from './CustomDropdown';

const InvoiceForm = ({ invoiceId, onClose, onSuccess }) => {
  const { invoices, addInvoice, updateInvoice } = useInvoices();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingInvoice = invoiceId ? invoices.find((inv) => inv.id === invoiceId) : null;

  const [formData, setFormData] = useState(() => {
    if (existingInvoice) {
      return {
        id: existingInvoice.id,
        createdAt: existingInvoice.createdAt,
        description: existingInvoice.description,
        paymentTerms: existingInvoice.paymentTerms,
        clientName: existingInvoice.clientName,
        clientEmail: existingInvoice.clientEmail,
        status: existingInvoice.status,
        senderStreet: existingInvoice.senderAddress.street,
        senderCity: existingInvoice.senderAddress.city,
        senderPostCode: existingInvoice.senderAddress.postCode,
        senderCountry: existingInvoice.senderAddress.country,
        clientStreet: existingInvoice.clientAddress.street,
        clientCity: existingInvoice.clientAddress.city,
        clientPostCode: existingInvoice.clientAddress.postCode,
        clientCountry: existingInvoice.clientAddress.country,
        items: existingInvoice.items,
      };
    }
    return {
      id: '',
      createdAt: new Date().toISOString().split('T')[0],
      description: '',
      paymentTerms: 30,
      clientName: '',
      clientEmail: '',
      status: 'draft',
      senderStreet: '',
      senderCity: '',
      senderPostCode: '',
      senderCountry: '',
      clientStreet: '',
      clientCity: '',
      clientPostCode: '',
      clientCountry: '',
      items: [{ name: '', quantity: 1, price: 0, total: 0 }],
    };
  });

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id?.trim()) newErrors.id = 'Invoice ID is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.clientName?.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.clientEmail?.trim()) newErrors.clientEmail = 'Client email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail))
      newErrors.clientEmail = 'Invalid email format';

    if (!formData.senderStreet?.trim()) newErrors.senderStreet = 'Street address is required';
    if (!formData.senderCity?.trim()) newErrors.senderCity = 'City is required';
    if (!formData.senderPostCode?.trim()) newErrors.senderPostCode = 'Post code is required';
    if (!formData.senderCountry?.trim()) newErrors.senderCountry = 'Country is required';

    if (!formData.clientStreet?.trim()) newErrors.clientStreet = 'Street address is required';
    if (!formData.clientCity?.trim()) newErrors.clientCity = 'City is required';
    if (!formData.clientPostCode?.trim()) newErrors.clientPostCode = 'Post code is required';
    if (!formData.clientCountry?.trim()) newErrors.clientCountry = 'Country is required';

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.name?.trim()) {
          newErrors[`itemName${index}`] = 'Item name is required';
        }
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`itemQty${index}`] = 'Quantity must be greater than 0';
        }
        if (!item.price || item.price <= 0) {
          newErrors[`itemPrice${index}`] = 'Price must be greater than 0';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'name' ? value : parseFloat(value) || 0,
    };

    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0, total: 0 }],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const invoiceData = {
      id: formData.id || `INV-${Date.now()}`,
      createdAt: formData.createdAt,
      paymentDue: new Date(new Date(formData.createdAt).getTime() + formData.paymentTerms * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: formData.description,
      paymentTerms: formData.paymentTerms,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      status: saveAsDraft ? 'draft' : formData.status || 'pending',
      senderAddress: {
        street: formData.senderStreet,
        city: formData.senderCity,
        postCode: formData.senderPostCode,
        country: formData.senderCountry,
      },
      clientAddress: {
        street: formData.clientStreet,
        city: formData.clientCity,
        postCode: formData.clientPostCode,
        country: formData.clientCountry,
      },
      items: formData.items,
      total: calculateTotal(),
    };

    if (existingInvoice) {
      updateInvoice(invoiceId, invoiceData);
    } else {
      addInvoice(invoiceData);
    }

    setIsSubmitting(false);
    onSuccess?.();
  };

  const total = calculateTotal();

  const inputClass = "w-full p-3 md:px-4 md:py-3 border border-border-color rounded bg-bg-primary text-text-primary text-[15px] font-medium transition-colors hover:border-primary disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";
  const labelClass = "text-[12px] font-semibold text-text-secondary uppercase tracking-[0.25px] flex flex-col gap-2";
  const errorInputClass = "border-danger focus-visible:border-danger focus-visible:ring-danger";
  const baseBtn = "inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full font-bold transition-all cursor-pointer border-none no-underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 px-6 py-3 max-sm:px-4 max-sm:py-3 max-sm:text-[11px] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-80 transition-opacity duration-300 opacity-100" onClick={onClose}></div>
      <div className="fixed left-0 top-0 bottom-0 w-full max-w-[719px] pl-[103px] bg-bg-secondary rounded-r-3xl shadow-[4px_0_20px_rgba(0,0,0,0.1)] flex flex-col z-90 max-lg:pl-0 max-lg:pt-20 max-lg:max-w-[616px] max-sm:max-w-full max-sm:rounded-none transition-transform duration-300 translate-x-0">
        <div className="p-6 sm:px-10 sm:py-8 border-b border-border-color flex sm:items-center flex-col sm:flex-row items-start gap-4">
          <button
            className="bg-transparent border-none text-text-primary text-[16px] font-semibold cursor-pointer p-0 whitespace-nowrap sm:hidden hover:text-text-secondary flex items-center gap-[24px]"
            onClick={onClose}
            aria-label="Close form"
          >
            <svg width="7" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M6.342.886L2.114 5.114l4.228 4.228" stroke="#7C5DFA" strokeWidth="2" fill="none" fillRule="evenodd" /></svg>
            Go back
          </button>
          <h2 className="text-[20px] sm:text-[24px] font-bold m-0">{existingInvoice ? 'Edit Invoice' : 'New Invoice'}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 pb-4 sm:pb-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-text-secondary [&::-webkit-scrollbar-thumb]:rounded-md">
          <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-12">

            <div className="flex flex-col gap-6">
              <h3 className="text-[12px] font-bold text-primary uppercase tracking-[0.25px] m-0">Bill From</h3>
              <div className="flex flex-col gap-4">
                <label className={labelClass} htmlFor="senderStreet">
                  <span>Street Address</span>
                  <input
                    type="text"
                    id="senderStreet"
                    name="senderStreet"
                    value={formData.senderStreet}
                    onChange={handleInputChange}
                    className={`${inputClass} ${errors.senderStreet ? errorInputClass : ''}`}
                    aria-invalid={!!errors.senderStreet}
                  />
                  {errors.senderStreet && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.senderStreet}</span>}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className={labelClass} htmlFor="senderCity">
                  <span>City</span>
                  <input
                    type="text"
                    id="senderCity"
                    name="senderCity"
                    value={formData.senderCity}
                    onChange={handleInputChange}
                    className={`${inputClass} ${errors.senderCity ? errorInputClass : ''}`}
                    aria-invalid={!!errors.senderCity}
                  />
                  {errors.senderCity && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.senderCity}</span>}
                </label>

                <label className={labelClass} htmlFor="senderPostCode">
                  <span>Post Code</span>
                  <input
                    type="text"
                    id="senderPostCode"
                    name="senderPostCode"
                    value={formData.senderPostCode}
                    onChange={handleInputChange}
                    className={`${inputClass} ${errors.senderPostCode ? errorInputClass : ''}`}
                    aria-invalid={!!errors.senderPostCode}
                  />
                  {errors.senderPostCode && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.senderPostCode}</span>}
                </label>

                <label className={labelClass} htmlFor="senderCountry">
                  <span>Country</span>
                  <input
                    type="text"
                    id="senderCountry"
                    name="senderCountry"
                    value={formData.senderCountry}
                    onChange={handleInputChange}
                    className={`${inputClass} ${errors.senderCountry ? errorInputClass : ''}`}
                    aria-invalid={!!errors.senderCountry}
                  />
                  {errors.senderCountry && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.senderCountry}</span>}
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-[12px] font-bold text-primary uppercase tracking-[0.25px] m-0">Bill To</h3>
              <div className="flex flex-col gap-4">
                <label className={labelClass} htmlFor="clientName">
                  <span>Client's Name</span>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="e.g. Alex Grim"
                    className={`${inputClass} ${errors.clientName ? errorInputClass : ''}`}
                    aria-invalid={!!errors.clientName}
                  />
                  {errors.clientName && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.clientName}</span>}
                </label>

                <label className={labelClass} htmlFor="clientEmail">
                  <span>Client's Email</span>
                  <input
                    type="email"
                    id="clientEmail"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    placeholder="e.g. email@example.com"
                    className={`${inputClass} ${errors.clientEmail ? errorInputClass : ''}`}
                    aria-invalid={!!errors.clientEmail}
                  />
                  {errors.clientEmail && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.clientEmail}</span>}
                </label>

                <label className={labelClass} htmlFor="clientStreet">
                  <span>Street Address</span>
                  <input
                    type="text"
                    id="clientStreet"
                    name="clientStreet"
                    value={formData.clientStreet}
                    onChange={handleInputChange}
                    placeholder="e.g. 19 Union Terrace"
                    className={`${inputClass} ${errors.clientStreet ? errorInputClass : ''}`}
                    aria-invalid={!!errors.clientStreet}
                  />
                  {errors.clientStreet && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.clientStreet}</span>}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className={labelClass} htmlFor="clientCity">
                  <span>City</span>
                  <input
                    type="text"
                    id="clientCity"
                    name="clientCity"
                    value={formData.clientCity}
                    onChange={handleInputChange}
                    placeholder="e.g. London"
                    className={`${inputClass} ${errors.clientCity ? errorInputClass : ''}`}
                    aria-invalid={!!errors.clientCity}
                  />
                  {errors.clientCity && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.clientCity}</span>}
                </label>

                <label className={labelClass} htmlFor="clientPostCode">
                  <span>Post Code</span>
                  <input
                    type="text"
                    id="clientPostCode"
                    name="clientPostCode"
                    value={formData.clientPostCode}
                    onChange={handleInputChange}
                    placeholder="e.g. E1 3EZ"
                    className={`${inputClass} ${errors.clientPostCode ? errorInputClass : ''}`}
                    aria-invalid={!!errors.clientPostCode}
                  />
                  {errors.clientPostCode && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.clientPostCode}</span>}
                </label>

                <label className={labelClass} htmlFor="clientCountry">
                  <span>Country</span>
                  <input
                    type="text"
                    id="clientCountry"
                    name="clientCountry"
                    value={formData.clientCountry}
                    onChange={handleInputChange}
                    placeholder="e.g. United Kingdom"
                    className={`${inputClass} ${errors.clientCountry ? errorInputClass : ''}`}
                    aria-invalid={!!errors.clientCountry}
                  />
                  {errors.clientCountry && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.clientCountry}</span>}
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={labelClass}>
                  <span>Invoice Date</span>
                  <CustomDatePicker
                    value={formData.createdAt}
                    onChange={(date) => handleInputChange({ target: { name: 'createdAt', value: date } })}
                    disabled={!!existingInvoice}
                  />
                </div>

                <div className={labelClass}>
                  <span>Payment Terms</span>
                  <CustomDropdown
                    options={[
                      { value: 1, label: 'Net 1 Day' },
                      { value: 7, label: 'Net 7 Days' },
                      { value: 14, label: 'Net 14 Days' },
                      { value: 30, label: 'Net 30 Days' },
                    ]}
                    value={parseInt(formData.paymentTerms)}
                    onChange={(val) => handleInputChange({ target: { name: 'paymentTerms', value: val } })}
                  />
                </div>

                <label className={`${labelClass} md:col-span-2`} htmlFor="description">
                  <span>Description</span>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g. Graphic Design"
                    className={`${inputClass} ${errors.description ? errorInputClass : ''}`}
                    aria-invalid={!!errors.description}
                  />
                  {errors.description && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.description}</span>}
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <label className={labelClass} htmlFor="invoiceId" style={{ marginBottom: 0 }}>
                <span>Invoice ID</span>
                <input
                  type="text"
                  id="invoiceId"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="e.g. INV-0001"
                  className={`${inputClass} ${errors.id ? errorInputClass : ''}`}
                  aria-invalid={!!errors.id}
                  disabled={!!existingInvoice}
                />
                {errors.id && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.id}</span>}
              </label>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-[18px] font-bold text-[#777F98] m-0">Item List</h3>
              {errors.items && <span className="text-[10px] text-danger font-semibold -mt-1">{errors.items}</span>}

              <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-[0.25px]">
                <div>Item Name</div>
                <div>Qty.</div>
                <div>Price</div>
                <div>Total</div>
                <div></div>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 sm:items-center p-4 sm:p-0 bg-bg-primary xl:bg-bg-secondary sm:bg-transparent rounded sm:rounded-none border sm:border-0 border-border-color mb-4 sm:mb-0">
                  <label className={`${labelClass} sm:hidden`}>Item Name</label>
                  <div className="w-full">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="Item name"
                      className={`${inputClass} ${errors[`itemName${index}`] ? errorInputClass : ''}`}
                      aria-invalid={!!errors[`itemName${index}`]}
                    />
                    {errors[`itemName${index}`] && <span className="text-[10px] text-danger font-semibold -mt-1">{errors[`itemName${index}`]}</span>}
                  </div>

                  <div className="flex gap-4 sm:contents">
                    <div className="w-full">
                      <label className={`${labelClass} sm:hidden mb-2`}>Qty.</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        placeholder="0"
                        min="1"
                        className={`${inputClass} ${errors[`itemQty${index}`] ? errorInputClass : ''}`}
                        aria-invalid={!!errors[`itemQty${index}`]}
                      />
                      {errors[`itemQty${index}`] && <span className="text-[10px] text-danger font-semibold -mt-1">{errors[`itemQty${index}`]}</span>}
                    </div>

                    <div className="w-full">
                      <label className={`${labelClass} sm:hidden mb-2`}>Price</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className={`${inputClass} ${errors[`itemPrice${index}`] ? errorInputClass : ''}`}
                        aria-invalid={!!errors[`itemPrice${index}`]}
                      />
                      {errors[`itemPrice${index}`] && <span className="text-[10px] text-danger font-semibold -mt-1">{errors[`itemPrice${index}`]}</span>}
                    </div>

                    <div className="w-full flex items-center justify-between sm:contents">
                      <label className={`${labelClass} sm:hidden`}>Total</label>
                      <div className="font-bold text-text-primary self-center text-right">
                        <span>£{item.total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <button
                        type="button"
                        className="bg-transparent border-none cursor-pointer text-[18px] p-2 transition-opacity hover:opacity-70 sm:ml-4 sm:justify-self-end mt-4 sm:mt-0"
                        onClick={() => removeItem(index)}
                        aria-label={`Delete item ${index + 1}`}
                      >
                        <svg width="13" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M11.583 3.556v10.666c0 .982-.795 1.778-1.778 1.778H2.694a1.777 1.777 0 01-1.777-1.778V3.556h10.666zM8.473 0l.888.889h3.111v1.778H.028V.889h3.11L4.029 0h4.444z" fill="#888EB0" fillRule="nonzero" className="hover:fill-danger transition-colors" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className={`${baseBtn} w-full mt-4 bg-bg-secondary text-text-tertiary border border-border-color hover:bg-action-hover`} onClick={addItem}>
                + Add New Item
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center p-6 bg-bg-primary rounded mt-4">
                <span className="text-[15px] font-medium text-text-secondary">Amount Due</span>
                <span className="text-[24px] font-bold text-primary">£{total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 p-6 sm:p-10 border-t border-border-color bg-bg-secondary shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] sm:shadow-none relative z-10 w-full sm:justify-end">
          <button type="button" className={`${baseBtn} bg-bg-secondary text-text-tertiary border border-border-color hover:bg-action-hover sm:mr-auto`} onClick={onClose}>
            {existingInvoice ? 'Cancel' : 'Discard'}
          </button>
          <button
            type="button"
            className={`${baseBtn} bg-[#373B53] text-[#888EB0] hover:bg-[#0C0E16] dark:hover:bg-[#1E2139] border-none`}
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
          >
            {existingInvoice ? 'Update as Draft' : 'Save as Draft'}
          </button>
          <button
            type="submit"
            className={`${baseBtn} bg-primary text-white hover:bg-primary-hover border-none`}
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting}
          >
            {existingInvoice ? 'Update Invoice' : 'Save & Send'}
          </button>
        </div>
      </div>
    </>
  );
};

export default InvoiceForm;
