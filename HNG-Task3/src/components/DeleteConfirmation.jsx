import React, { useEffect, useRef } from 'react';

const DeleteConfirmation = ({ onConfirm, onCancel, invoiceId }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;

    if (!modal) return;
    const firstFocusableElement = modal.querySelectorAll(focusableElements)[0];
    const focusableContent = modal.querySelectorAll(focusableElements);
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus the modal contentwrapper to allow screen readers to read the alertdialog
    modal.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  const baseBtn = "px-6 py-[14px] rounded-full font-bold text-[15px] tracking-[-0.25px] transition-colors w-full sm:w-auto flex-1 h-[48px]";

  return (
    <div className="fixed inset-0 w-full h-full bg-black/50 flex items-center justify-center z-1000 animate-fadeIn" onClick={onCancel}>
      <div
        className="bg-bg-secondary rounded-lg p-6 sm:p-12 max-w-[480px] w-[90%] shadow-[0_10px_40px_rgba(0,0,0,0.2)] animate-slideUp"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
        tabIndex={-1}
      >
        <h2 id="delete-title" className="text-[24px] font-bold text-text-primary tracking-[-0.5px] leading-[32px] mb-3">Confirm Deletion</h2>
        <p id="delete-description" className="text-[13px] text-text-secondary mb-6 leading-[22px] tracking-[-0.1px]">
          Are you sure you want to delete invoice <strong className="text-text-primary">#{invoiceId}</strong>? This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end">
          <button className={`${baseBtn} bg-[#F9FAFE] text-[#7E88C3] hover:bg-[#DFE3FA] dark:bg-[#252945] dark:text-[#DFE3FA] dark:hover:bg-[#FFFFFF]`} onClick={onCancel}>
            Cancel
          </button>
          <button className={`${baseBtn} bg-danger text-white hover:bg-danger-hover`} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;

