// State Management
const state = {
    title: "Design System Review",
    description: "Review the new design system components and provide feedback on accessibility and consistency across the design tokens. Ensure that all color contrasts meet WCAG 2.1 AA standards and that the typography scales correctly on ultra-wide monitors.",
    priority: "High",
    dueDate: new Date("2026-04-18T18:00:00Z"),
    status: "Pending",
    isEditing: false,
    isExpanded: false,
    isDeleted: false
};

// DOM Elements
const elements = {
    card: document.getElementById('todo-card'),
    viewMode: document.getElementById('view-mode'),
    editForm: document.getElementById('edit-form'),
    deletedState: document.getElementById('deleted-state'),

    // View Mode
    title: document.getElementById('todo-title'),
    description: document.getElementById('todo-description'),
    priorityBadge: document.getElementById('priority-badge'),
    priorityIndicator: document.getElementById('priority-indicator'),
    dueDate: document.getElementById('todo-due-date'),
    timeRemaining: document.getElementById('time-remaining'),
    overdueIndicator: document.getElementById('overdue-indicator'),
    statusBadge: document.getElementById('todo-status'),
    statusControl: document.getElementById('status-control'),
    completeToggle: document.getElementById('complete-toggle'),
    completeText: document.getElementById('complete-text'),
    expandToggle: document.getElementById('expand-toggle'),
    collapsibleSection: document.getElementById('collapsible-section'),

    // Edit Form
    editTitle: document.getElementById('edit-title'),
    editDescription: document.getElementById('edit-description'),
    editPriority: document.getElementById('edit-priority'),
    editDueDate: document.getElementById('edit-due-date'),

    // Buttons
    editBtn: document.getElementById('edit-button'),
    deleteBtn: document.getElementById('delete-button'),
    saveBtn: document.getElementById('save-button'),
    cancelBtn: document.getElementById('cancel-button'),
    undoBtn: document.getElementById('undo-delete')
};

// --- Initialization ---
function init() {
    setupEventListeners();
    updateTime();
    render();

    // Update time every 30 seconds
    setInterval(() => {
        if (state.status !== "Done" && !state.isDeleted) {
            updateTime();
        }
    }, 30000);
}

// --- Event Listeners ---
function setupEventListeners() {
    // View Actions
    elements.editBtn.addEventListener('click', () => {
        state.isEditing = true;
        render();
        elements.editTitle.focus();
    });

    elements.deleteBtn.addEventListener('click', () => {
        state.isDeleted = true;
        render();
    });

    elements.undoBtn.addEventListener('click', () => {
        state.isDeleted = false;
        render();
    });

    elements.expandToggle.addEventListener('click', () => {
        state.isExpanded = !state.isExpanded;
        render();
    });

    elements.completeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            state.status = "Done";
        } else {
            state.status = "Pending";
        }
        render();
    });

    elements.statusControl.addEventListener('change', (e) => {
        state.status = e.target.value;
        render();
    });

    // Edit Actions
    elements.saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        state.title = elements.editTitle.value;
        state.description = elements.editDescription.value;
        state.priority = elements.editPriority.value;
        state.dueDate = new Date(elements.editDueDate.value);
        state.isEditing = false;
        updateTime();
        render();
        elements.editBtn.focus();
    });

    elements.cancelBtn.addEventListener('click', () => {
        state.isEditing = false;
        render();
        elements.editBtn.focus();
    });
}

// --- Logic ---
function updateTime() {
    const now = new Date();
    const diff = state.dueDate.getTime() - now.getTime();
    const abs = Math.abs(diff);

    const mins = Math.floor(abs / 60000);
    const hrs = Math.floor(abs / 3600000);
    const days = Math.floor(abs / 86400000);

    const isOverdue = diff < 0;

    let text = "";
    if (state.status === "Done") {
        text = "Completed";
    } else if (isOverdue) {
        if (hrs < 1) text = `Overdue by ${mins}m`;
        else if (days < 1) text = `Overdue by ${hrs}h`;
        else text = `Overdue by ${days} day${days !== 1 ? "s" : ""}`;
    } else {
        if (days > 1) text = `Due in ${days} days`;
        else if (days === 1) text = "Due tomorrow";
        else if (hrs > 0) text = `Due in ${hrs}h`;
        else text = `Due in ${mins}m`;
    }

    state.timeText = text;
    state.isOverdue = isOverdue && state.status !== "Done";

    if (!state.isDeleted) {
        elements.timeRemaining.textContent = text;
        if (state.isOverdue) {
            elements.overdueIndicator.classList.remove('hidden');
            elements.timeRemaining.classList.add('overdue-text');
        } else {
            elements.overdueIndicator.classList.add('hidden');
            elements.timeRemaining.classList.remove('overdue-text');
        }
    }
}

function render() {
    // Handle Deleted State
    if (state.isDeleted) {
        elements.viewMode.classList.add('hidden');
        elements.editForm.classList.add('hidden');
        elements.deletedState.classList.remove('hidden');
        return;
    } else {
        elements.deletedState.classList.add('hidden');
    }

    // Handle Edit vs View Mode
    if (state.isEditing) {
        elements.viewMode.classList.add('hidden');
        elements.editForm.classList.remove('hidden');

        // Populate fields
        elements.editTitle.value = state.title;
        elements.editDescription.value = state.description;
        elements.editPriority.value = state.priority;
        elements.editDueDate.value = state.dueDate.toISOString().slice(0, 16);
    } else {
        elements.viewMode.classList.remove('hidden');
        elements.editForm.classList.add('hidden');

        // Update Content
        elements.title.textContent = state.title;
        elements.description.textContent = state.description;

        // Priority
        elements.priorityBadge.textContent = `${state.priority} Priority`;
        elements.priorityBadge.className = `badge badge--${state.priority.toLowerCase()}`;
        elements.priorityIndicator.className = `priority-dot ${state.priority.toLowerCase()}`;
        elements.card.setAttribute('data-priority', state.priority);

        // Due Date
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        elements.dueDate.textContent = `📅 ${state.dueDate.toLocaleDateString('en-US', options)}`;

        // Status & Checkbox Sync
        elements.statusBadge.textContent = state.status;
        elements.statusControl.value = state.status;
        elements.card.setAttribute('data-status', state.status);

        if (state.status === "Done") {
            elements.card.classList.add('card--done');
            elements.completeToggle.checked = true;
            elements.completeText.textContent = "✓ Completed";
            elements.timeRemaining.textContent = "Completed";
            elements.overdueIndicator.classList.add('hidden');
            elements.timeRemaining.classList.remove('overdue-text');
        } else {
            elements.card.classList.remove('card--done');
            elements.completeToggle.checked = false;
            elements.completeText.textContent = "Mark complete";
            updateTime();
        }

        // Expand / Collapse
        const descLength = state.description.length;
        if (descLength > 100) {
            elements.expandToggle.classList.remove('hidden');
            if (state.isExpanded) {
                elements.collapsibleSection.classList.remove('collapsed');
                elements.expandToggle.textContent = "Show less";
                elements.expandToggle.setAttribute('aria-expanded', 'true');
                elements.collapsibleSection.style.maskImage = "none";
            } else {
                elements.collapsibleSection.classList.add('collapsed');
                elements.expandToggle.textContent = "Show more";
                elements.expandToggle.setAttribute('aria-expanded', 'false');
                elements.collapsibleSection.style.maskImage = "linear-gradient(to bottom, black 50%, transparent 100%)";
            }
        } else {
            elements.expandToggle.classList.add('hidden');
            elements.collapsibleSection.classList.remove('collapsed');
            elements.collapsibleSection.style.maskImage = "none";
        }
    }
}

// Start the app
init();
