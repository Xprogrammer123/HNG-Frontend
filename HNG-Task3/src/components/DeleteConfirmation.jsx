import React from 'react';
import './DeleteConfirmation.css';

const DeleteConfirmation = ({ onConfirm, onCancel, invoiceId }) => {
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    const modal = document.querySelector('.delete-modal');
    if (modal) {
      modal.focus();
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  return (
    <div className="delete-overlay" onClick={onCancel}>
      <div
        className="delete-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
        tabIndex={-1}
      >
        <h2 id="delete-title">Confirm Deletion</h2>
        <p id="delete-description">
          Are you sure you want to delete invoice <strong>#{invoiceId}</strong>? This action cannot be undone.
        </p>
        <div className="delete-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
