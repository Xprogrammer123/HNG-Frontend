import './TaskCard.css';
import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, Check, X } from 'lucide-react';

/* ---------------- TYPES ---------------- */

type Urgency = "safe" | "soon" | "overdue" | "now";
type Tag = "work" | "urgent" | "design";

interface TimeInfo {
  text: string;
  urgency: Urgency;
}

/* ---------------- CONSTANTS ---------------- */

const DUE_DATE = new Date("2026-05-01T18:00:00Z");

const TAGS: { id: Tag; label: string }[] = [
  { id: "work", label: "work" },
  { id: "urgent", label: "urgent" },
  { id: "design", label: "design" },
];

const URGENCY_COLOR: Record<Urgency, string> = {
  safe: "#059669",
  soon: "#d97706",
  overdue: "#dc2626",
  now: "#dc2626",
};

const URGENCY_BG: Record<Urgency, string> = {
  safe: "#ecfdf5",
  soon: "#fffbeb",
  overdue: "#fef2f2",
  now: "#fef2f2",
};

const TAG_STYLES: Record<Tag, { background: string; color: string }> = {
  work: { background: "#eff6ff", color: "#1d4ed8" },
  urgent: { background: "#fef2f2", color: "#b91c1c" },
  design: { background: "#fdf4ff", color: "#7e22ce" },
};

/* ---------------- HELPERS ---------------- */

function calcTime(): TimeInfo {
  const now = new Date();
  const diff = DUE_DATE.getTime() - now.getTime();
  const abs = Math.abs(diff);

  const mins = Math.floor(abs / 60000);
  const hrs = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);
  const months = Math.floor(days / 30);

  const isOverdue = diff < 0;
  const isDueNow = diff >= 0 && diff < 60000;

  let text: string;
  let urgency: Urgency;

  if (isDueNow) {
    text = "Due now!";
    urgency = "now";
  } else if (isOverdue) {
    if (hrs < 1) text = `Overdue by ${mins}m`;
    else if (days < 1) text = `Overdue by ${hrs}h`;
    else text = `Overdue by ${days} day${days !== 1 ? "s" : ""}`;
    urgency = "overdue";
  } else {
    if (months > 1) {
      text = `Due in ${months} months`;
      urgency = "safe";
    } else if (days > 3) {
      text = `Due in ${days} days`;
      urgency = "safe";
    } else if (days === 1) {
      text = "Due tomorrow";
      urgency = "soon";
    } else if (days > 0) {
      text = `Due in ${days} day${days !== 1 ? "s" : ""}`;
      urgency = "soon";
    } else if (hrs > 0) {
      text = `Due in ${hrs}h`;
      urgency = "soon";
    } else {
      text = `Due in ${mins}m`;
      urgency = "now";
    }
  }

  return { text, urgency };
}

/* ---------------- COMPONENT ---------------- */

export default function TaskCard() {
  const [done, setDone] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState("Design System Review");
  const [desc, setDesc] = useState(
    "Review the new design system components and provide feedback on accessibility and consistency across the design tokens."
  );

  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(desc);

  const [timeInfo, setTimeInfo] = useState<TimeInfo>(calcTime);

  useEffect(() => {
    const id = setInterval(() => setTimeInfo(calcTime()), 30000);
    return () => clearInterval(id);
  }, []);

  const handleCheck = useCallback(() => {
    setDone((p) => !p);
  }, []);

  const handleDelete = useCallback(() => setDeleted(true), []);

  const saveEdit = useCallback(() => {
    setTitle(editTitle);
    setDesc(editDesc);
    setEditing(false);
  }, [editTitle, editDesc]);

  const dueFmt = DUE_DATE.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const status = done ? "Completed" : "To do";

  if (deleted) {
    return (
      <div className="deleted-state">
        <div className="deleted-icon">✓</div>
        <p>Task has been deleted</p>
      </div>
    );
  }

  return (
    <article data-testid="test-todo-card" className={`card${done ? " card--done" : ""}`}>
      
      {/* HERO */}
      <section className="card__hero">
        <header className="card__hero-header">
          <span data-testid="test-todo-priority" className="badge badge--priority-high">
            High
          </span>

          <label className="check-label">
            <input
              type="checkbox"
              data-testid="test-todo-complete-toggle"
              className="check-input"
              checked={done}
              onChange={handleCheck}
              aria-label="Mark task as complete"
            />
            <span className="check-text">
              {done ? "Completed" : "Mark as done"}
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
          <h2 data-testid="test-todo-title" className="card__title">
            {title}
          </h2>
        )}
      </section>

      {/* BODY */}
      <div className="card__body">
        {editing ? (
          <div className="edit-block">
            <textarea
              className="edit-textarea"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
            <div className="edit-actions">
              <button 
                onClick={saveEdit}
                className="save-btn"
              >
                <Check size={18} />
                Save changes
              </button>
              <button 
                onClick={() => setEditing(false)}
                className="cancel-btn"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p data-testid="test-todo-description" className="card__desc">
            {desc}
          </p>
        )}

        {!editing && (
          <div className="card__meta">
            <time
              data-testid="test-todo-due-date"
              dateTime={DUE_DATE.toISOString()}
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

        <ul data-testid="test-todo-tags" role="list">
          {TAGS.map(({ id, label }) => (
            <li key={id}>
              <span data-testid={`test-todo-tag-${id}`} style={TAG_STYLES[id]}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* FOOTER */}
      <footer className="card__footer">
        <span data-testid="test-todo-status">
          {status}
        </span>

        <div className="action-buttons">
          <button
            data-testid="test-todo-edit-button"
            onClick={() => {
              setEditTitle(title);
              setEditDesc(desc);
              setEditing(true);
            }}
            className="edit-btn"
          >
            <Edit2 size={18} />
            Edit
          </button>

          <button
            data-testid="test-todo-delete-button"
            onClick={handleDelete}
            className="delete-btn"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </footer>
    </article>
  );
}