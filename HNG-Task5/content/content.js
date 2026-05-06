/**
 * Content script for extracting page data.
 */

function extractPageContent() {
  // Get the title
  const title = document.title;
  
  // Get the main content
  // We prioritize structured content but fallback to body text
  const selectors = [
    'article',
    'main',
    '.main-content',
    '#content',
    '.post-content',
    'body'
  ];
  
  let main = null;
  for (const selector of selectors) {
    main = document.querySelector(selector);
    if (main) break;
  }
  
  if (!main) main = document.body;
  
  // Remove scripts, styles, and other non-content elements
  const clone = main.cloneNode(true);
  const toRemove = clone.querySelectorAll('script, style, nav, footer, header, noscript, iframe, .ad, .sidebar, .comments');
  toRemove.forEach(el => el.remove());
  
  const textContent = clone.innerText.trim().replace(/\s+/g, ' ');
  
  // Statistics
  const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed is 200 wpm
  
  return { title, textContent, wordCount, readingTime };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    sendResponse(extractPageContent());
  }
});
