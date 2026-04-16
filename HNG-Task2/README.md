# HNG Stage 1: Advanced Frontend Tasks

This repository contains the implementation for HNG Stage 1 (Parts 1a and 1b), focused on building interactive, stateful, and accessible components using pure HTML, CSS, and vanilla JavaScript.

## 📂 Project Structure

```text
HNG-Task2/
├── task1a/            # Stage 1a: Advanced Todo Card
│   ├── index.html
│   ├── style.css
│   └── main.js
└── task1b/            # Stage 1b: Profile Card
    ├── profile.html
    ├── profile.css
    └── profile.js
```

---

## 📝 Stage 1a: Advanced Todo Card

A premium, stateful Todo Card component ported from Stage 0 (React) to plain JavaScript.

### Key Changes from Stage 0
- **Framework-Free**: Re-implemented with vanilla JS and DOM manipulation.
- **Edit Mode**: Interactive form to modify title, description, priority, and due date.
- **Status Synchronization**: Bidirectional sync between completion checkbox and a status dropdown (Pending, In Progress, Done).
- **Expand/Collapse**: Large descriptions are collapsed by default to save space, with an accessible toggle.
- **Advanced Time Logic**: Real-time overdue tracking that updates every 30 seconds.

### Design Decisions
- **Premium Aesthetic**: Used a warm cream palette (`#fffaf5`) with refined typography (Inter and DM Sans).
- **Micro-interactions**: Subtle hover effects, scale transformations on checkboxes, and smooth transitions for all state changes.
- **Flexbox & Grid**: Utilized modern CSS layouts to ensure stability across different orientations.

### Accessibility Notes
- **Semantic HTML**: Proper use of `<article>`, `<h2>`, `<label>`, and `<button>` tags.
- **Live Updates**: Used `aria-live="polite"` for the time remaining indicator to ensure screen readers announce updates without interruption.
- **Keyboard Navigation**: Optimized tab order and visible `:focus` states for all interactive elements.

---

## 👤 Stage 1b: Profile Card

A semantic and accessible user information card focused on precision and layout stability.

### Core Features
- **Real-time Epoch Clock**: A precision ticker displaying `Date.now()` in milliseconds, updating every 10ms.
- **Semantic Markup**: Built entirely with accessibility in mind using `<article>`, `<figure>`, `<nav>`, and `<section>`.
- **Responsive Layout**: Adapts from a vertical stack on mobile to a side-by-side header layout on desktop for optimal space utilization.

### Design Decisions
- **Balanced Proportions**: Centered avatar for mobile focus, with refined side-by-side arrangement for desktop clarity.
- **Data Testability**: Every required element is tagged with the exact `data-testid` requested for stable automated testing.

### Accessibility Notes
- **Meaningful Alt-Text**: The avatar includes descriptive alt text for screen reader users.
- **High Contrast**: Colors were carefully selected to meet WCAG AA standards.
- **Social Links**: Social icons/links are clearly identified and follow external link best practices (`target="_blank"`, `rel="noopener noreferrer"`).

---

## 🛠️ Known Limitations
- **LocalStorage**: Current state (tasks/profile) is not persisted across reloads (in-memory state only).
- **Dynamic Tags**: Tag addition/removal in Task 1a is via the Edit form, but the UI currently displays a fixed set of demo tags.

## 🚀 Getting Started
1. Clone the repository.
2. Open `task1a/index.html` or `task1b/profile.html` directly in any modern web browser.
