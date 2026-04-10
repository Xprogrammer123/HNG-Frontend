const todoCard = document.querySelector('[data-testid="test-todo-card"]');
const completeToggle = document.querySelector('[data-testid="test-todo-complete-toggle"]');
const editButton = document.querySelector('[data-testid="test-todo-edit-button"]');
const deleteButton = document.querySelector('[data-testid="test-todo-delete-button"]');
const timeRemaining = document.querySelector('[data-testid="test-todo-time-remaining"]');
const dueDateElement = document.querySelector('[data-testid="test-todo-due-date"]');

const DUE_DATE = new Date('2026-03-01T18:00:00Z');
const UPDATE_INTERVAL = 60000; // 60 seconds

let isCompleted = false;

/**
 * Calculate time remaining until due date
 * @returns {Object} { text: string, isOverdue: boolean, isDueNow: boolean }
 */
function calculateTimeRemaining() {
  const now = new Date();
  const due = new Date(DUE_DATE);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // Check if overdue
  if (diffMs < 0) {
    const hoursOverdue = Math.abs(diffHours);
    const daysOverdue = Math.abs(diffDays);
    
    if (hoursOverdue < 1) {
      return { text: 'Overdue by ' + Math.abs(diffMinutes) + ' minutes', isOverdue: true, isDueNow: false };
    } else if (daysOverdue < 1) {
      return { text: 'Overdue by ' + hoursOverdue + ' hours', isOverdue: true, isDueNow: false };
    } else {
      return { text: 'Overdue by ' + daysOverdue + ' days', isOverdue: true, isDueNow: false };
    }
  }

  if (diffMs <= 0) {
    return { text: 'Due now!', isOverdue: false, isDueNow: true };
  }
  
 
  if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    return { text: 'Due in ' + months + ' month' + (months > 1 ? 's' : ''), isOverdue: false, isDueNow: false };
  } else if (diffDays > 0) {
    if (diffDays === 1) {
      return { text: 'Due tomorrow', isOverdue: false, isDueNow: false };
    }
    return { text: 'Due in ' + diffDays + ' days', isOverdue: false, isDueNow: false };
  } else if (diffHours > 0) {
    return { text: 'Due in ' + diffHours + ' hours', isOverdue: false, isDueNow: false };
  } else if (diffMinutes > 0) {
    return { text: 'Due in ' + diffMinutes + ' minutes', isOverdue: false, isDueNow: false };
  } else {
    return { text: 'Due now!', isOverdue: false, isDueNow: true };
  }
}


function updateTimeRemaining() {
  const result = calculateTimeRemaining();
  timeRemaining.textContent = result.text;
  

  timeRemaining.classList.remove('due-soon', 'overdue', 'due-now');
  if (result.isOverdue) {
    timeRemaining.classList.add('overdue');
  } else if (result.isDueNow) {
    timeRemaining.classList.add('due-now');
  } else if (result.text.includes('Due in') && result.text.includes('days')) {
    const days = parseInt(result.text.match(/\d+/)?.[0] || '0');
    if (days <= 3) {
      timeRemaining.classList.add('due-soon');
    }
  }
}

function updateCardState() {
  if (isCompleted) {
    todoCard.classList.add('completed');
    updateStatusBadge('Done');
  } else {
    todoCard.classList.remove('completed');
    updateStatusBadge('Pending');
  }
}

/**
 * Update status badge text and class
 * @param {string} status - 'Pending', 'In Progress', or 'Done'
 */
function updateStatusBadge(status) {
  const statusBadge = document.querySelector('[data-testid="test-todo-status"]');
  statusBadge.textContent = status;
  statusBadge.className = 'status-badge status-' + status.toLowerCase();
}

function handleCompleteToggle() {
  isCompleted = completeToggle.checked;
  updateCardState();
}

function handleEditClick() {
  console.log('Edit clicked - Task: Design System Review');

}

function handleDeleteClick() {
  const confirmed = confirm('Are you sure you want to delete this task?');
  if (confirmed) {
    console.log('Delete clicked - Task removed');

    todoCard.style.opacity = '0';
    setTimeout(() => {
      todoCard.remove();
    }, 300);
  }
}

function init() {
 
  const dueDateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  dueDateElement.textContent = 'Due ' + DUE_DATE.toLocaleDateString('en-US', dueDateOptions);
  
  
  updateTimeRemaining();
  
  
  completeToggle.addEventListener('change', handleCompleteToggle);
  editButton.addEventListener('click', handleEditClick);
  deleteButton.addEventListener('click', handleDeleteClick);
  
 
  setInterval(updateTimeRemaining, UPDATE_INTERVAL);
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
