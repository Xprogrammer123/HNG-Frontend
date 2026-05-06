import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Sparkles, Settings, Copy, Check, Globe, FileText, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function App() {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [pageInfo, setPageInfo] = useState({ title: '', url: '' })

  useEffect(() => {
    // Get current tab info
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab) {
          setPageInfo({ title: tab.title, url: tab.url });
          
          // Check for cached summary in storage
          chrome.storage.local.get(['lastSummary', 'lastUrl'], (result) => {
            if (tab.url === result.lastUrl) {
              setSummary(result.lastSummary || '');
            }
          });
        }
      });
    }
  }, []);

  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        throw new Error("Chrome API not available. Are you running this as an extension?");
      }

      // 1. Get content from content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Inject content script if not already there (fail-safe)
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/content.js']
        });
      } catch (e) {
        console.log("Content script might already be injected:", e);
      }
      
      const response = await chrome.tabs.sendMessage(tab.id, { action: "getPageContent" });
      
      if (!response) {
        throw new Error("Could not extract page content. Try refreshing the page.");
      }

      // 2. Send to background script for summarization
      chrome.runtime.sendMessage(
        { action: "summarize", data: response },
        (res) => {
          if (chrome.runtime.lastError) {
            setError(chrome.runtime.lastError.message);
            setLoading(false);
            return;
          }
          
          if (res.success) {
            setSummary(res.summary);
            // Cache result
            chrome.storage.local.set({ lastSummary: res.summary, lastUrl: tab.url });
          } else {
            setError(res.error || "Summarization failed");
          }
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-[400px] min-h-[500px] bg-background p-4 font-sans text-foreground shadow-2xl overflow-hidden flex flex-col">
      <header className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg text-primary-foreground shadow-lg shadow-primary/30">
            <Sparkles size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:to-purple-400">
            AI Summarizer
          </h1>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings size={20} className="text-muted-foreground" />
        </Button>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col space-y-4">
        {/* Page Info Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
              <Globe size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
              <h2 className="font-semibold text-xs truncate leading-relaxed text-slate-700 dark:text-slate-200">
                {pageInfo.title || 'Unknown Webpage'}
              </h2>
              <p className="text-[10px] text-slate-400 truncate tracking-wide">{pageInfo.url || 'No URL detected'}</p>
            </div>
          </div>
        </div>

        {/* Action Button / Summary State */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!summary && !loading && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
                <div className="relative w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xl">
                  <FileText size={36} />
                </div>
              </div>
              <div className="px-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Ready to summarize</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Get key insights and takeaways from this page in seconds with Groq's high-speed AI.
                </p>
              </div>
              <button
                onClick={handleSummarize}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all group"
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={18} className="group-hover:animate-pulse" />
                  Summarize Now
                </span>
              </button>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-slate-900 dark:text-slate-100 font-bold text-lg tracking-tight">AI is Reading...</p>
                <p className="text-slate-500 text-sm mt-1 animate-pulse">Llama 3.3 @ Groq Speed</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl text-center space-y-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600">
                <AlertCircle size={32} />
              </div>
              <div>
                <h4 className="font-bold text-red-700 dark:text-red-400">Extraction Error</h4>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">{error}</p>
              </div>
              <button
                onClick={handleSummarize}
                className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30"
              >
                Try Again
              </button>
            </div>
          )}

          {summary && !loading && (
            <div className="flex-1 flex flex-col space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  Insights Found
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 py-1 rounded-md transition-colors border border-indigo-100 dark:border-indigo-900/30"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-inner overflow-y-auto custom-scrollbar prose dark:prose-invert prose-slate prose-sm max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
              
              <button
                onClick={handleSummarize}
                className="shrink-0 w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-xs transition-all tracking-wide"
              >
                Regenerate Summary
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 text-center shrink-0">
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">
          Groq Powered Intelligence
        </p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
        .prose h1, .prose h2, .prose h3 {
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: inherit;
        }
        .prose ul {
          padding-left: 1.2em;
        }
        .prose li {
          margin-bottom: 0.2em;
        }
      `}} />
    </div>
  )
}

export default App
