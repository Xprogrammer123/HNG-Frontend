/**
 * Background service worker for handling AI requests via Groq.
 */

// We'll try to get this from storage, but keep a placeholder if needed
let GROQ_API_KEY = "";

// Handle messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    handleSummarization(request.data)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open
  }
});

/**
 * Calls the Groq API to summarize content.
 */
async function handleSummarization(data) {
  const { textContent, title } = data;
  
  // Retrieve the API key from storage before every request
  const storage = await chrome.storage.local.get(['apiKey']);
  const API_KEY = storage.apiKey || "REDACTED"; // Default fallback (optional)

  if (!API_KEY || API_KEY.trim() === "") {
    throw new Error("API Key is missing. Please add your Groq API Key in Settings.");
  }

  const API_URL = "https://api.groq.com/openai/v1/chat/completions";

  const prompt = `
    Summarize the following webpage content titled "${title}".
    
    Output your response in two parts separated by a marker "===INSIGHTS===".
    
    Part 1 (The Summary):
    - A concise, high-level overview (1-2 sentences).
    - A bulleted list of 3-5 key takeaways.
    
    Part 2 (Key Insights):
    - 2-3 unique or surprising insights derived from the content.
    - 2-3 important quotes or "pro tips".
    
    Format both parts in clear markdown.
    
    Content:
    ${textContent.substring(0, 15000)}
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a professional research assistant. Always respond with Part 1, the marker '===INSIGHTS===', then Part 2."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1024,
      })
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.error?.message || "Groq API request failed";
      if (response.status === 401) {
        throw new Error("Invalid API Key. Please check your settings.");
      }
      throw new Error(errorMsg);
    }

    const fullText = result.choices[0].message.content;
    const parts = fullText.split('===INSIGHTS===');
    
    return {
      summary: parts[0]?.trim() || "No summary generated.",
      insights: parts[1]?.trim() || "No insights generated."
    };

  } catch (error) {
    console.error("Summarization error:", error);
    throw error;
  }
}
