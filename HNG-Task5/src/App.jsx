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
        <Card className="shrink-0 border-muted">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-md text-muted-foreground">
                <Globe size={16} />
              </div>
              <div className="flex-1 overflow-hidden">
                <h2 className="font-semibold text-xs truncate leading-relaxed">
                  {pageInfo.title || 'Unknown Webpage'}
                </h2>
                <p className="text-[10px] text-muted-foreground truncate tracking-wide">{pageInfo.url || 'No URL detected'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button / Summary State */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!summary && !loading && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <Card className="relative w-20 h-20 flex items-center justify-center text-primary shadow-xl border-muted">
                  <FileText size={36} />
                </Card>
              </div>
              <div className="px-4">
                <h3 className="font-bold">Ready to summarize</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Get key insights and takeaways from this page in seconds with Groq's high-speed AI.
                </p>
              </div>
              <Button
                onClick={handleSummarize}
                className="w-full h-14 rounded-2xl shadow-xl shadow-primary/30 text-base font-bold group"
              >
                <Sparkles size={18} className="mr-2 group-hover:animate-pulse" />
                Summarize Now
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-muted rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg tracking-tight">AI is Reading...</p>
                <p className="text-muted-foreground text-sm mt-1 animate-pulse">Llama 3.3 @ Groq Speed</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-center space-y-4">
              <div className="p-3 bg-destructive/20 rounded-full text-destructive">
                <AlertCircle size={32} />
              </div>
              <div>
                <h4 className="font-bold text-destructive">Extraction Error</h4>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
              <Button
                variant="destructive"
                onClick={handleSummarize}
                className="px-6 rounded-xl font-bold"
              >
                Try Again
              </Button>
            </div>
          )}

          {summary && !loading && (
            <div className="flex-1 flex flex-col space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
              <div className="flex items-center justify-between shrink-0">
                <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 border-primary/20 text-primary">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse mr-2"></span>
                  Insights Found
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-7 text-[10px] font-bold px-2 border-muted"
                >
                  {copied ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              
              <div className="flex-1 bg-card border border-muted rounded-2xl p-4 shadow-inner overflow-y-auto custom-scrollbar prose dark:prose-invert prose-slate prose-sm max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
              
              <Button
                variant="secondary"
                onClick={handleSummarize}
                className="shrink-0 w-full rounded-xl text-xs font-bold tracking-wide"
              >
                Regenerate Summary
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-6 pt-4 border-t border-muted text-center shrink-0">
        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em]">
          Groq Powered Intelligence
        </p>
      </footer>
    </div>
  )
}

export default App
