# Task Card Component HNG-Frontend

A premium, fully-featured task management card component built with React, TypeScript, and Vite.

## Features

### Core Functionality
- ✅ **Mark as Complete** - Click the checkbox to toggle task completion with strikethrough effect
- ✏️ **Edit Tasks** - Inline editing for task title and description
- 🗑️ **Delete Tasks** - Remove tasks with confirmation state display
- 📅 **Due Date Tracking** - Real-time countdown timer showing urgency levels
- 🏷️ **Tags & Priority** - Display work, urgent, and design tags with color coding
- 🎨 **Visual Feedback** - Smooth animations and transitions on all interactions

### Design
- **Premium UI** - Clean, modern design with warm cream background (#fffaf5)
- **Responsive** - Works seamlessly on desktop and mobile devices
- **Accessibility** - Proper ARIA labels and semantic HTML
- **Reduced Motion Support** - Respects `prefers-reduced-motion` preference

### Task States
- **Urgency Levels**: Safe (green), Soon (orange), Now (red), Overdue (red)
- **Visual Indicators**: Color-coded badges and time chips
- **Completed State**: 50% opacity with strikethrough text

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Lucide React** - Icon library
- **CSS3** - Styling with gradients, transitions, and animations

## Getting Started

### Installation

```bash
npm install
npm install lucide-react
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Build

```bash
npm run build
```

## Component Structure

### TaskCard Component
Main component located in `src/components/TaskCard.tsx`

**State Management:**
- `done` - Task completion status
- `deleted` - Task deletion state
- `editing` - Edit mode toggle
- `title` & `desc` - Task content
- `timeInfo` - Real-time urgency calculation

**Key Methods:**
- `handleCheck()` - Toggle completion
- `handleDelete()` - Mark as deleted
- `saveEdit()` - Save changes
- `calcTime()` - Calculate time remaining

## Styling

All component styles are in `src/components/TaskCard.css` with:
- Warm color palette (creams, browns, accent colors)
- Smooth cubic-bezier transitions
- Gradient backgrounds
- Shadow effects for depth
- Responsive media queries

## Features Highlights

✨ **Strikethrough Text** - Completed tasks show striking through text with gray color
🎯 **Enhanced Checkbox** - Larger, better-scaled checkbox with smooth interactions
🌟 **Premium Buttons** - Gradient save button, border-based action buttons
📊 **Live Time Tracking** - Updates every 30 seconds to show task urgency
🏷️ **Tag System** - Work, urgent, design tags with unique color schemes

## Testing

Tests are located in `src/test/TaskCard.test.tsx`

Run tests with:
```bash
npm run test
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT