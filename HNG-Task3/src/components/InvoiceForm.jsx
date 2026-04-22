import React, { useState, useEffect } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import './InvoiceForm.css';

const InvoiceForm = ({ invoiceId, onBack, onSuccess }) => {
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
      senderStreet: '19 Union Terrace',
      senderCity: 'London',
      senderPostCode: 'E1 3EZ',
      senderCountry: 'United Kingdom',
      clientStreet: '',
      clientCity: '',
      clientPostCode: '',
      clientCountry: '',
      items: [{ name: '', quantity: 1, price: 0, total: 0 }],
    };
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id?.trim()) newErrors.id = 'Invoice ID is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.clientName?.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.clientEmail?.trim()) newErrors.clientEmail = 'Client email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail))
      newErrors.clientEmail = 'Invalid email format';

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
    onBack();
  };

  const total = calculateTotal();

  return (
    <div className="invoice-form-container">
      <button className="btn btn-back" onClick={onBack} aria-label="Cancel invoice creation">
        ← Go back
      </button>

      <form onSubmit={(e) => handleSubmit(e, false)} className="invoice-form">
        <div className="form-section">
          <h2>{existingInvoice ? 'Edit Invoice' : 'Create Invoice'}</h2>
        </div>

        <div className="form-section">
          <h3>Bill From</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senderStreet">Street Address</label>
              <input
                type="text"
                id="senderStreet"
                name="senderStreet"
                value={formData.senderStreet}
                onChange={handleInputChange}
                disabled
                className="input-disabled"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senderCity">City</label>
              <input
                type="text"
                id="senderCity"
                name="senderCity"
                value={formData.senderCity}
                onChange={handleInputChange}
                disabled
                className="input-disabled"
              />
            </div>
            <div className="form-group">
              <label htmlFor="senderPostCode">Post Code</label>
              <input
                type="text"
                id="senderPostCode"
                name="senderPostCode"
                value={formData.senderPostCode}
                onChange={handleInputChange}
                disabled
                className="input-disabled"
              />
            </div>
            <div className="form-group">
              <label htmlFor="senderCountry">Country</label>
              <input
                type="text"
                id="senderCountry"
                name="senderCountry"
                value={formData.senderCountry}
                onChange={handleInputChange}
                disabled
                className="input-disabled"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Bill To</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientName">Client's Name</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                placeholder="e.g. Alex Grim"
                className={errors.clientName ? 'input-error' : ''}
                aria-invalid={!!errors.clientName}
              />
              {errors.clientName && <span className="error-message">{errors.clientName}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientEmail">Client's Email</label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                placeholder="e.g. email@example.com"
                className={errors.clientEmail ? 'input-error' : ''}
                aria-invalid={!!errors.clientEmail}
              />
              {errors.clientEmail && <span className="error-message">{errors.clientEmail}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientStreet">Street Address</label>
              <input
                type="text"
                id="clientStreet"
                name="clientStreet"
                value={formData.clientStreet}
                onChange={handleInputChange}
                placeholder="e.g. 19 Union Terrace"
                className={errors.clientStreet ? 'input-error' : ''}
                aria-invalid={!!errors.clientStreet}
              />
              {errors.clientStreet && <span className="error-message">{errors.clientStreet}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientCity">City</label>
              <input
                type="text"
                id="clientCity"
                name="clientCity"
                value={formData.clientCity}
                onChange={handleInputChange}
                placeholder="e.g. London"
                className={errors.clientCity ? 'input-error' : ''}
                aria-invalid={!!errors.clientCity}
              />
              {errors.clientCity && <span className="error-message">{errors.clientCity}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="clientPostCode">Post Code</label>
              <input
                type="text"
                id="clientPostCode"
                name="clientPostCode"
                value={formData.clientPostCode}
                onChange={handleInputChange}
                placeholder="e.g. E1 3EZ"
                className={errors.clientPostCode ? 'input-error' : ''}
                aria-invalid={!!errors.clientPostCode}
              />
              {errors.clientPostCode && <span className="error-message">{errors.clientPostCode}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="clientCountry">Country</label>
              <input
                type="text"
                id="clientCountry"
                name="clientCountry"
                value={formData.clientCountry}
                onChange={handleInputChange}
                placeholder="e.g. United Kingdom"
                className={errors.clientCountry ? 'input-error' : ''}
                aria-invalid={!!errors.clientCountry}
              />
              {errors.clientCountry && <span className="error-message">{errors.clientCountry}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="createdAt">Invoice Date</label>
              <input
                type="date"
                id="createdAt"
                name="createdAt"
                value={formData.createdAt}
                onChange={handleInputChange}
                disabled
                className="input-disabled"
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentTerms">Payment Terms</label>
              <select
                id="paymentTerms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
              >
                <option value={1}>Net 1 Day</option>
                <option value={7}>Net 7 Days</option>
                <option value={14}>Net 14 Days</option>
                <option value={30}>Net 30 Days</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g. Graphic Design"
                className={errors.description ? 'input-error' : ''}
                aria-invalid={!!errors.description}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="invoiceId">Invoice ID</label>
            <input
              type="text"
              id="invoiceId"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              placeholder="e.g. INV-0001"
              className={errors.id ? 'input-error' : ''}
              aria-invalid={!!errors.id}
              disabled={!!existingInvoice}
            />
            {errors.id && <span className="error-message">{errors.id}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Item List</h3>
          {errors.items && <span className="error-message">{errors.items}</span>}

          <div className="items-table-header">
            <div className="item-name">Item Name</div>
            <div className="item-qty">Qty.</div>
            <div className="item-price">Price</div>
            <div className="item-total">Total</div>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="item-row">
              <div className="form-group item-name">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder="Item name"
                  className={errors[`itemName${index}`] ? 'input-error' : ''}
                  aria-invalid={!!errors[`itemName${index}`]}
                />
                {errors[`itemName${index}`] && <span className="error-message">{errors[`itemName${index}`]}</span>}
              </div>
              <div className="form-group item-qty">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  placeholder="0"
                  min="1"
                  className={errors[`itemQty${index}`] ? 'input-error' : ''}
                  aria-invalid={!!errors[`itemQty${index}`]}
                />
                {errors[`itemQty${index}`] && <span className="error-message">{errors[`itemQty${index}`]}</span>}
              </div>
              <div className="form-group item-price">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={errors[`itemPrice${index}`] ? 'input-error' : ''}
                  aria-invalid={!!errors[`itemPrice${index}`]}
                />
                {errors[`itemPrice${index}`] && <span className="error-message">{errors[`itemPrice${index}`]}</span>}
              </div>
              <div className="item-total">
                <span>£{item.total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
              </div>
              <button
                type="button"
                className="btn-delete-item"
                onClick={() => removeItem(index)}
                aria-label={`Delete item ${index + 1}`}
              >
                🗑️
              </button>
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={addItem}>
            + Add New Item
          </button>
        </div>

        <div className="form-section">
          <div className="total-display">
            <span>Amount Due</span>
            <span className="total-amount">£{total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-secondary-outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
          >
            {existingInvoice ? 'Update as Draft' : 'Save as Draft'}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {existingInvoice ? 'Update Invoice' : 'Send Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
