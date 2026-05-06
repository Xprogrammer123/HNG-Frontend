# AI Page Summarizer - Chrome Extension

A premium, high-performance Chrome Extension built with **React**, **Vite**, and **Groq AI** that instantly summarizes webpages, extracts key insights, and provides reading statistics.

![Aesthetics](https://img.shields.io/badge/UI-Vercel--Inspired-black?style=for-the-badge)
![Manifest](https://img.shields.io/badge/Manifest-V3-blue?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Llama_3.3-purple?style=for-the-badge)

## 🎯 Objective
The goal was to create a functional, useful, and visually stunning Chrome Extension that meets the HNG Stage 4A requirements. It streamlines information consumption by distilling long-form content into digestible bullet points and surprising insights.

## 🚀 Features
- **Instant Summarization**: Get high-level overviews of any article in seconds.
- **Key Insights Tab**: Discover unique takeaways and "pro-tips" hidden in the text.
- **Reading Statistics**: Real-time word count and estimated reading time (WPM-based).
- **Dark/Light Mode**: Full theme support with a monochromatic Vercel-inspired aesthetic.
- **Flexible API Management**: Use the built-in key or provide your own via Settings.
- **One-Click Actions**: Clear, refresh, and copy-to-clipboard functionality.

## 🏗 Architecture
The extension follows the modern **Manifest V3** standard and is architected into three main layers:

1.  **Popup UI (React + Vite)**:
    - Built using a modular theme system.
    - Handles user interaction, state management (via Hooks), and display logic.
    - Uses a custom Vite configuration to bundle React into a browser-friendly structure.
2.  **Background Service Worker (`background.js`)**:
    - Acts as the "AI Hub" of the extension.
    - Handles secure communication with the Groq API to avoid CORS issues.
    - Manages secrets injected via environment variables.
3.  **Content Script (`content.js`)**:
    - The "Data Extractor" that runs in the context of the webpage.
    - Uses heuristic targeting (`article`, `main`, etc.) to isolate meaningful content from ads and sidebars.
    - Calculates word counts and metadata locally.

## 🧠 AI Integration
We utilize the **Groq API** with the **Llama 3.3 70B Versatile** model for high-speed, high-quality summarization.

### Prompt Engineering
The extension uses a structured multi-part prompt that forces the AI to output results in a specific format:
- **Part 1**: Concise overview + Bulleted takeaways.
- **Part 2**: Unique insights + Surprising facts.
This structure is parsed by the background script to populate the "Summary" and "Insights" tabs independently.

## 🔒 Security Decisions
- **Environment Variables**: API keys are stored in a `.env` file and inlined during the build process, preventing them from being committed to version control.
- **Local Storage**: User-provided API keys are stored strictly in `chrome.storage.local`, ensuring they never leave the user's browser.
- **Permissions**: The extension uses a "Least Privilege" model, requesting only `activeTab`, `storage`, and `scripting` permissions.
- **Code Injection**: Content scripts are injected dynamically only when needed, reducing the extension's memory footprint on other tabs.

## ⚖️ Trade-offs
- **Heuristic vs. Readability.js**: We chose a custom heuristic-based extraction over large libraries like Mozilla's Readability to keep the content script lightweight (sub-1KB), ensuring zero impact on page performance.
- **Vite Multi-Entry Build**: To support the Extension structure, we moved away from a standard SPA build to a multi-entry configuration. This adds complexity to the build script but ensures 100% compatibility with Chrome's MIME-type and CSP requirements.
- **Client-side Processing**: Summarization is done via a service worker rather than a dedicated backend. This minimizes latency and cost but exposes the API endpoint logic (though keys are managed securely).

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v18+)
- NPM or Yarn

### 1. Local Development
```bash
# Install dependencies
npm install

# Run Vite dev server (for UI work)
npm run dev
```

### 2. Environment Setup
Create a `.env` file in the root:
```env
VITE_GROQ_API_KEY=your_groq_key_here
```

### 3. Production Build
```bash
# Build the extension
npm run build
```
The production-ready files will be generated in the `dist/` directory.

### 4. Loading into Chrome
1.  Open `chrome://extensions/`.
2.  Enable **Developer Mode** (top right).
3.  Click **Load Unpacked**.
4.  Select the **`dist`** folder from this project.
5.  Refresh any article page and click the extension icon to start summarizing!

## 📜 License
MIT © 2026 Saka_Builds / HNG Stage 4A Task
