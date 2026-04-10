import './TaskCard.css';
import { useState, useEffect, useCallback } from "react";

const DUE_DATE = new Date("2026-05-01T18:00:00Z");

const TAGS = [
  { id: "work", label: "work" },
  { id: "urgent", label: "urgent" },
  { id: "design", label: "design" },
];

function calcTime() {
  const now = new Date();
  const diff = DUE_DATE.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const mins = Math.floor(abs / 60000);
  const hrs = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);
  const months = Math.floor(days / 30);

  const isOverdue = diff < 0;
  const isDueNow = diff >= 0 && diff < 60000;

  let text, urgency;
  if (isDueNow) {
    text = "Due now!";
    urgency = "now";
  } else if (isOverdue) {
    if (hrs < 1) text = `Overdue by ${mins}m`;
    else if (days < 1) text = `Overdue by ${hrs}h`;
    else text = `Overdue by ${days} day${days !== 1 ? "s" : ""}`;
    urgency = "overdue";
  } else {
    if (months > 1) { text = `Due in ${months} months`; urgency = "safe"; }
    else if (days > 3) { text = `Due in ${days} days`; urgency = "safe"; }
    else if (days === 1) { text = "Due tomorrow"; urgency = "soon"; }
    else if (days > 0) { text = `Due in ${days} day${days !== 1 ? "s" : ""}`; urgency = "soon"; }
    else if (hrs > 0) { text = `Due in ${hrs}h`; urgency = "soon"; }
    else { text = `Due in ${mins}m`; urgency = "now"; }
  }
  return { text, urgency };
}

const URGENCY_COLOR = { safe: "#059669", soon: "#d97706", overdue: "#dc2626", now: "#dc2626" };
const URGENCY_BG    = { safe: "#ecfdf5", soon: "#fffbeb", overdue: "#fef2f2", now: "#fef2f2" };
const TAG_STYLES    = {
  work:   { background: "#eff6ff", color: "#1d4ed8" },
  urgent: { background: "#fef2f2", color: "#b91c1c" },
  design: { background: "#fdf4ff", color: "#7e22ce" },
};

export default function TaskCard() {
  const [done, setDone]         = useState(false);
  const [deleted, setDeleted]   = useState(false);
  const [editing, setEditing]   = useState(false);
  const [title, setTitle]       = useState("Design System Review");
  const [desc, setDesc]         = useState(
    "Review the new design system components and provide feedback on accessibility and consistency across the design tokens."
  );
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc]   = useState(desc);
  const [timeInfo, setTimeInfo]   = useState(calcTime);
  const [pulse, setPulse]         = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTimeInfo(calcTime()), 30000);
    return () => clearInterval(id);
  }, []);

  const handleCheck = useCallback(() => {
    setDone((p) => !p);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
  }, []);

  const handleDelete = useCallback(() => setDeleted(true), []);

  const saveEdit = useCallback(() => {
    setTitle(editTitle);
    setDesc(editDesc);
    setEditing(false);
  }, [editTitle, editDesc]);

  const dueFmt = DUE_DATE.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const status = done ? "Done" : "Pending";

  if (deleted) {
    return (
      <div className="deleted-state">
        <div className="deleted-icon">✓</div>
        <p>Task removed</p>
      </div>
    );
  }

  return (
    <article
      data-testid="test-todo-card"
      className={`card${done ? " card--done" : ""}`}
    >
      {/* Hero */}
      <section className="card__hero">
        <header className="card__hero-header">
          <span data-testid="test-todo-priority" className="badge badge--priority-high">
            High
          </span>

          <label
            className="check-label"
            style={{
              background: done ? "#ecfdf5" : "#f3f4f6",
              border: `1px solid ${done ? "#a7f3d0" : "#e5e7eb"}`,
              transform: pulse ? "scale(0.95)" : "scale(1)",
            }}
          >
            <input
              type="checkbox"
              data-testid="test-todo-complete-toggle"
              className="check-input"
              checked={done}
              onChange={handleCheck}
              aria-label="Mark task as complete"
            />
            <span className="check-text" style={{ color: done ? "#059669" : "#6b7280" }}>
              {done ? "Done" : "Mark done"}
            </span>
          </label>
        </header>

        {editing ? (
          <input
            className="edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
          />
        ) : (
          <h2
            data-testid="test-todo-title"
            className="card__title"
            style={{
              color: done ? "#9ca3af" : "#111827",
              textDecoration: done ? "line-through" : "none",
            }}
          >
            {title}
          </h2>
        )}
      </section>

      {/* Body */}
      <div className="card__body">
        {editing ? (
          <div className="edit-block">
            <textarea
              className="edit-textarea"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
            <div className="edit-actions">
              <button className="btn btn--save" onClick={saveEdit}>Save</button>
              <button className="btn btn--cancel" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <p
            data-testid="test-todo-description"
            className="card__desc"
            style={{ color: done ? "#d1d5db" : "#6b7280" }}
          >
            {desc}
          </p>
        )}

        {!editing && (
          <div className="card__meta">
            <time
              data-testid="test-todo-due-date"
              dateTime="2026-05-01T18:00:00Z"
              className="due-date"
            >
              Due {dueFmt}
            </time>
            <span
              data-testid="test-todo-time-remaining"
              aria-live="polite"
              className="time-chip"
              style={{
                color: URGENCY_COLOR[timeInfo.urgency],
                background: URGENCY_BG[timeInfo.urgency],
              }}
            >
              {timeInfo.text}
            </span>
          </div>
        )}

        <ul data-testid="test-todo-tags" role="list" className="card__tags">
          {TAGS.map(({ id, label }) => (
            <li key={id}>
              <span
                data-testid={`test-todo-tag-${id}`}
                className="tag"
                style={TAG_STYLES[id] || { background: "#f3f4f6", color: "#374151" }}
              >
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <footer className="card__footer">
        <span
          data-testid="test-todo-status"
          className={`badge badge--status-${status.toLowerCase()}`}
        >
          {status}
        </span>

        <div className="card__actions">
          <button
            data-testid="test-todo-edit-button"
            aria-label="Edit task"
            className="btn btn--edit"
            onClick={() => { setEditTitle(title); setEditDesc(desc); setEditing(true); }}
          >
            Edit
          </button>
          <button
            data-testid="test-todo-delete-button"
            aria-label="Delete task"
            className="btn btn--delete"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </footer>
    </article>
  );
}
