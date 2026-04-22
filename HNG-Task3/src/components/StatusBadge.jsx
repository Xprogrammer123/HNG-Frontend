import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-status-paid bg-status-paid-bg';
      case 'pending':
        return 'text-status-pending bg-status-pending-bg';
      case 'draft':
        return 'text-status-draft bg-status-draft-bg';
      default:
        return 'text-status-draft bg-status-draft-bg';
    }
  };

  return (
    <span className={`inline-flex items-center justify-center gap-2 w-[104px] h-[40px] rounded-md font-bold text-[15px] tracking-[-0.25px] capitalize ${getStatusStyles()}`}>
      <span className="w-2 h-2 rounded-full bg-current"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
