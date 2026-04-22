import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot"></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
