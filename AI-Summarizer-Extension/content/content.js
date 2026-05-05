/**
 * Content script to extract meaningful text from the webpage.
 */

// Listener for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractContent") {
    const content = extractMeaningfulText();
    sendResponse(content);
  }
  return true; // Keep the message channel open for async response
});

/**
 * Heuristically extracts the main content of the page.
 */
function extractMeaningfulText() {
  const title = document.title || "";
  
  // Try to find the main article container
  const mainSelectors = [
    'article',
    'main',
    '[role="main"]',
    '.main-content',
    '#main-content',
    '.post-content',
    '.article-body'
  ];

  let mainElement = null;
  for (const selector of mainSelectors) {
    mainElement = document.querySelector(selector);
    if (mainElement) break;
  }

  // Fallback: If no clear main element, use body but filter it
  const rootElement = mainElement || document.body;
  
  // Clone the element so we don't modify the live DOM
  const clone = rootElement.cloneNode(true);

  // Remove unwanted elements from the clone
  const junkSelectors = [
    'nav', 'footer', 'header', 'aside', 'script', 'style', 'iframe', 
    'noscript', 'button', 'input', 'select', 'textarea', 
    '.ads', '.sidebar', '.menu', '.social-share', '.comments'
  ];
  
  junkSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Extract text from paragraphs
  const paragraphs = Array.from(clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li'));
  const textContent = paragraphs
    .map(p => p.innerText.trim())
    .filter(text => text.length > 20) // Filter out tiny fragments
    .join('\n\n');

  // Basic word count calculation
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average 200 wpm

  return {
    title,
    textContent: textContent.substring(0, 10000), // Limit to 10k chars for API
    wordCount,
    readingTime,
    url: window.location.href
  };
}
