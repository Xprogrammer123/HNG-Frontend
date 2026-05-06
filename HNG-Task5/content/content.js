/**
 * Content script for extracting page data.
 */

function extractPageContent() {
  // Get the title
  const title = document.title;
  
  // Get the main content
  // We prioritize structured content but fallback to body text
  let textContent = "";
  
  const main = document.querySelector('main') || document.querySelector('article') || document.body;
  
  // Remove scripts, styles, and other non-content elements
  const clone = main.cloneNode(true);
  const toRemove = clone.querySelectorAll('script, style, nav, footer, header, noscript, iframe');
  toRemove.forEach(el => el.remove());
  
  textContent = clone.innerText.trim().replace(/\s+/g, ' ');
  
  return { title, textContent };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    sendResponse(extractPageContent());
  }
});
