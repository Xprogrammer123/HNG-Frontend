/**
 * Popup script for AI Page Summarizer.
 * Handles UI interactions and communication with content and background scripts.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // --- DOM Elements ---
  const views = {
    initial: document.getElementById('initial-state'),
    loading: document.getElementById('loading-state'),
    summary: document.getElementById('summary-state'),
    error: document.getElementById('error-state'),
    settings: document.getElementById('settings-view')
  };

  const elements = {
    pageTitle: document.getElementById('page-title'),
    pageMeta: document.getElementById('page-meta'),
    summaryContent: document.getElementById('summary-content'),
    errorMessage: document.getElementById('error-message'),
    apiKeyInput: document.getElementById('api-key'),
    summarizeBtn: document.getElementById('summarize-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    backBtn: document.getElementById('back-btn'),
    saveSettingsBtn: document.getElementById('save-settings'),
    copyBtn: document.getElementById('copy-btn'),
    clearBtn: document.getElementById('clear-btn'),
    retryBtn: document.getElementById('retry-btn')
  };

  let pageData = null;

  // --- Initialization ---
  await initPopup();

  // --- Event Listeners ---
  elements.summarizeBtn.addEventListener('click', handleSummarize);
  elements.settingsBtn.addEventListener('click', () => showView('settings'));
  elements.backBtn.addEventListener('click', () => showView('initial'));
  elements.saveSettingsBtn.addEventListener('click', saveSettings);
  elements.copyBtn.addEventListener('click', copyToClipboard);
  elements.clearBtn.addEventListener('click', () => showView('initial'));
  elements.retryBtn.addEventListener('click', handleSummarize);

  // --- Functions ---

  async function initPopup() {
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
        showError("This extension doesn't work on system pages.");
        elements.summarizeBtn.disabled = true;
        return;
      }

      // Check if API key exists
      const { apiKey } = await chrome.storage.sync.get(['apiKey']);
      if (!apiKey) {
        showView('settings');
        return;
      }

      // Request content extraction from the content script
      chrome.tabs.sendMessage(tab.id, { action: "extractContent" }, (response) => {
        if (chrome.runtime.lastError || !response) {
          showError("Could not read page content. Try refreshing the page.");
          console.error(chrome.runtime.lastError);
          return;
        }

        pageData = response;
        elements.pageTitle.textContent = pageData.title || "Untitled Page";
        elements.pageMeta.textContent = `${pageData.wordCount} words • ${pageData.readingTime} min read`;
        showView('initial');
      });

    } catch (error) {
      showError("Failed to initialize. Please try again.");
      console.error(error);
    }
  }

  async function handleSummarize() {
    if (!pageData) return;

    showView('loading');

    try {
      const response = await chrome.runtime.sendMessage({
        action: "summarize",
        data: {
          textContent: pageData.textContent,
          title: pageData.title
        }
      });

      if (response && response.success) {
        displaySummary(response.summary);
      } else {
        showError(response?.error || "Failed to generate summary.");
      }
    } catch (error) {
      showError("Connection error. Please try again.");
      console.error(error);
    }
  }

  function displaySummary(markdown) {
    elements.summaryContent.innerHTML = renderMarkdown(markdown);
    showView('summary');
  }

  async function saveSettings() {
    const key = elements.apiKeyInput.value.trim();
    if (!key) {
      alert("Please enter a valid API key.");
      return;
    }

    await chrome.storage.sync.set({ apiKey: key });
    alert("Settings saved!");
    initPopup(); // Re-initialize
  }

  function copyToClipboard() {
    const text = elements.summaryContent.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const originalIcon = elements.copyBtn.innerHTML;
      elements.copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      setTimeout(() => {
        elements.copyBtn.innerHTML = originalIcon;
      }, 2000);
    });
  }

  function showView(viewName) {
    Object.keys(views).forEach(v => {
      views[v].classList.add('hidden');
    });
    views[viewName].classList.remove('hidden');
  }

  function showError(message) {
    elements.errorMessage.textContent = message;
    showView('error');
  }

  /**
   * Extremely basic markdown renderer for the UI.
   * Handles headers, bold, and lists.
   */
  function renderMarkdown(text) {
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');

    // Handle lists - simple approach: replace * or - with li, then wrap groups
    html = html.replace(/^\s*[\*\-]\s+(.*)$/gim, '<li>$1</li>');
    
    // Wrap contiguous li elements in ul
    html = html.replace(/(<li>(?:.|\n)*?<\/li>)/g, (match) => {
      return `<ul>${match}</ul>`;
    });

    // Clean up multiple ul wraps if they became fragmented
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Replace double newlines with breaks for remaining text
    html = html.split('\n\n').map(p => {
      if (!p.startsWith('<')) return `<p>${p}</p>`;
      return p;
    }).join('');

    return html;
  }
});
