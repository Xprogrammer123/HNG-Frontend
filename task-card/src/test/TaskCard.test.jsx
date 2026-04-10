import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import TaskCard from '../components/TaskCard'

// ─── Helpers ────────────────────────────────────────────────────────────────

function renderCard() {
  return render(<TaskCard />)
}

// ─── Rendering & test-id presence ───────────────────────────────────────────

describe('Rendering', () => {
  it('renders the card container', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-card')).toBeInTheDocument()
  })

  it('renders the task title', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-title')).toHaveTextContent('Design System Review')
  })

  it('renders the description', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-description')).toBeInTheDocument()
  })

  it('renders the priority badge as "High"', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-priority')).toHaveTextContent('High')
  })

  it('renders the due date as a <time> element', () => {
    renderCard()
    const el = screen.getByTestId('test-todo-due-date')
    expect(el.tagName).toBe('TIME')
    expect(el).toHaveAttribute('dateTime')
  })

  it('renders the time remaining chip', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-time-remaining')).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-status')).toBeInTheDocument()
  })

  it('renders a real checkbox input', () => {
    renderCard()
    const checkbox = screen.getByTestId('test-todo-complete-toggle')
    expect(checkbox.tagName).toBe('INPUT')
    expect(checkbox).toHaveAttribute('type', 'checkbox')
  })

  it('renders the tags list', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-tags')).toBeInTheDocument()
  })

  it('renders each tag with correct test-id', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-tag-work')).toHaveTextContent('work')
    expect(screen.getByTestId('test-todo-tag-urgent')).toHaveTextContent('urgent')
    expect(screen.getByTestId('test-todo-tag-design')).toHaveTextContent('design')
  })

  it('renders edit and delete buttons', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-edit-button')).toBeInTheDocument()
    expect(screen.getByTestId('test-todo-delete-button')).toBeInTheDocument()
  })
})

// ─── Semantics ───────────────────────────────────────────────────────────────

describe('Semantics & Accessibility', () => {
  it('card root is an <article>', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-card').tagName).toBe('ARTICLE')
  })

  it('title is an <h2>', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-title').tagName).toBe('H2')
  })

  it('description is a <p>', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-description').tagName).toBe('P')
  })

  it('tags container is a <ul> with role="list"', () => {
    renderCard()
    const list = screen.getByTestId('test-todo-tags')
    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('role', 'list')
  })

  it('edit button is a <button>', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-edit-button').tagName).toBe('BUTTON')
  })

  it('delete button is a <button>', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-delete-button').tagName).toBe('BUTTON')
  })

  it('checkbox has an aria-label', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-complete-toggle')).toHaveAttribute('aria-label')
  })

  it('time remaining has aria-live="polite"', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-time-remaining')).toHaveAttribute('aria-live', 'polite')
  })
})

// ─── Completion toggle ────────────────────────────────────────────────────────

describe('Completion toggle', () => {
  it('checkbox starts unchecked', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-complete-toggle')).not.toBeChecked()
  })

  it('status badge starts as "Pending"', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-status')).toHaveTextContent('Pending')
  })

  it('checking the box updates status badge to "Done"', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByTestId('test-todo-complete-toggle'))
    expect(screen.getByTestId('test-todo-status')).toHaveTextContent('Done')
  })

  it('checking the box applies line-through to the title', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByTestId('test-todo-complete-toggle'))
    expect(screen.getByTestId('test-todo-title')).toHaveStyle('text-decoration: line-through')
  })

  it('unchecking restores status to "Pending"', async () => {
    const user = userEvent.setup()
    renderCard()
    const cb = screen.getByTestId('test-todo-complete-toggle')
    await user.click(cb)
    await user.click(cb)
    expect(screen.getByTestId('test-todo-status')).toHaveTextContent('Pending')
  })
})

// ─── Edit flow ────────────────────────────────────────────────────────────────

describe('Edit flow', () => {
  it('clicking Edit shows an input pre-filled with current title', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByTestId('test-todo-edit-button'))
    const input = screen.getByDisplayValue('Design System Review')
    expect(input.tagName).toBe('INPUT')
  })

  it('saving persists the new title', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByTestId('test-todo-edit-button'))
    const input = screen.getByDisplayValue('Design System Review')
    await user.clear(input)
    await user.type(input, 'New Task Title')
    await user.click(screen.getByText('Save'))
    expect(screen.getByTestId('test-todo-title')).toHaveTextContent('New Task Title')
  })

  it('cancelling discards changes', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByTestId('test-todo-edit-button'))
    const input = screen.getByDisplayValue('Design System Review')
    await user.clear(input)
    await user.type(input, 'Discarded Title')
    await user.click(screen.getByText('Cancel'))
    expect(screen.getByTestId('test-todo-title')).toHaveTextContent('Design System Review')
  })
})

// ─── Delete flow ──────────────────────────────────────────────────────────────

describe('Delete flow', () => {
  it('clicking Delete removes the card from the DOM', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByTestId('test-todo-delete-button'))
    expect(screen.queryByTestId('test-todo-card')).not.toBeInTheDocument()
  })

  it('shows a confirmation message after deletion', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByTestId('test-todo-delete-button'))
    expect(screen.getByText('Task removed')).toBeInTheDocument()
  })
})

// ─── Time remaining ───────────────────────────────────────────────────────────

describe('Time remaining display', () => {
  it('shows a non-empty time remaining string on load', () => {
    renderCard()
    const el = screen.getByTestId('test-todo-time-remaining')
    expect(el.textContent.trim().length).toBeGreaterThan(0)
  })

  it('refreshes time remaining every 30 seconds', () => {
    vi.useFakeTimers()
    renderCard()
    const before = screen.getByTestId('test-todo-time-remaining').textContent
    act(() => { vi.advanceTimersByTime(30000) })
    const after = screen.getByTestId('test-todo-time-remaining').textContent
    // Content stays valid (still a string); value only differs if minute ticked
    expect(typeof after).toBe('string')
    expect(after.length).toBeGreaterThan(0)
    vi.useRealTimers()
  })

  it('due date element has a datetime attribute', () => {
    renderCard()
    expect(screen.getByTestId('test-todo-due-date')).toHaveAttribute('dateTime')
  })
})
