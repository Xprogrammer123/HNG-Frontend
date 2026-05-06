import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { 
  Sparkles, 
  Settings, 
  Copy, 
  Check, 
  Globe, 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  Moon, 
  Sun,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

function App() {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [pageInfo, setPageInfo] = useState({ title: '', url: '' })
  const [activeTab, setActiveTab] = useState('summary')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Load state from chrome.storage
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0]
        if (tab) {
          setPageInfo({ title: tab.title, url: tab.url })
          chrome.storage.local.get(['lastSummary', 'lastUrl', 'theme'], (result) => {
            if (tab.url === result.lastUrl) {
              setSummary(result.lastSummary || '')
            }
            if (result.theme === 'dark') {
              setIsDark(true)
            }
          })
        }
      })
    }
  }, [])

  // Update theme in storage
  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ theme: newDark ? 'dark' : 'light' })
    }
  }

  const handleSummarize = async () => {
    setLoading(true)
    setError('')

    try {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        throw new Error('Chrome API not available')
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        throw new Error('AI cannot read browser system pages. Please try on a regular website.')
      }

      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/content.js'],
        })
      } catch (e) {
        console.log('Script injection skipped or failed:', e)
      }

      // Add a tiny delay to ensure listener is ready
      await new Promise(r => setTimeout(r, 100))

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' }).catch(err => {
        if (err.message.includes('Could not establish connection')) {
          throw new Error('Extension updated! Please REFRESH the webpage once to allow AI access.')
        }
        throw err
      })

      if (!response) {
        throw new Error('Could not extract page content. Try refreshing the page.')
      }

      chrome.runtime.sendMessage({ action: 'summarize', data: response }, (res) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message)
          setLoading(false)
          return
        }

        if (res.success) {
          setSummary(res.summary)
          chrome.storage.local.set({ lastSummary: res.summary, lastUrl: tab.url })
        } else {
          setError(res.error || 'Summarization failed')
        }
        setLoading(false)
      })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hostname = (() => {
    try { return new URL(pageInfo.url).hostname } catch { return pageInfo.url }
  })()

  return (
    <div className={cn("w-[400px] h-[500px] flex flex-col font-sans transition-colors duration-200", isDark ? "dark" : "")}>
      <div className="flex-1 bg-background text-foreground flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
              <Sparkles size={14} className="text-background" />
            </div>
            <span className="font-semibold text-[14px] tracking-tight">AI Summarizer</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground">
              <Settings size={16} />
            </button>
          </div>
        </header>

        {/* URL Bar */}
        <div className="px-4 py-2 flex items-center gap-2 border-b border-border bg-muted/30">
          <div className="p-1 bg-background border border-border rounded shadow-sm shrink-0">
            <Globe size={10} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium truncate leading-tight">
              {pageInfo.title || 'Loading page...'}
            </div>
            <div className="text-[10px] text-muted-foreground truncate leading-tight">
              {hostname || 'Detecting URL...'}
            </div>
          </div>
          <a 
            href={pageInfo.url} 
            target="_blank" 
            rel="noreferrer"
            className="p-1 hover:bg-accent rounded text-muted-foreground transition-colors"
          >
            <ExternalLink size={10} />
          </a>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {!summary && !loading && !error && (
            <div className="flex-1 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight mb-2">Summarize this page</h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Get a concise summary and key insights from the current webpage using Groq's high-speed AI.
                </p>
              </div>
              <div className="mt-auto">
                <button 
                  onClick={handleSummarize}
                  className="w-full h-10 bg-foreground text-background font-medium rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles size={14} />
                  Generate Summary
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
              <div className="w-full max-w-[200px] h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-foreground w-1/3 rounded-full animate-loading-bar" />
              </div>
              <p className="text-xs text-muted-foreground animate-pulse tracking-wide">
                ANALYZING CONTENT...
              </p>
              <style>{`
                @keyframes loading-bar {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(300%); }
                }
                .animate-loading-bar {
                  animation: loading-bar 1.5s infinite ease-in-out;
                }
              `}</style>
            </div>
          )}

          {error && !loading && (
            <div className="flex-1 flex flex-col p-6 gap-4">
              <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex gap-3">
                <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-destructive">Something went wrong</h3>
                  <p className="text-xs text-destructive/80 mt-1 leading-relaxed">{error}</p>
                </div>
              </div>
              <button 
                onClick={handleSummarize}
                className="w-full h-10 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {summary && !loading && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
              {/* Tabs */}
              <div className="flex px-4 border-b border-border">
                {['Summary', 'Insights', 'Takeaways'].map((tab) => {
                  const key = tab.toLowerCase()
                  const active = activeTab === key
                  return (
                    <button 
                      key={key} 
                      onClick={() => setActiveTab(key)}
                      className={cn(
                        "px-3 py-2.5 text-xs font-medium border-b-2 transition-colors",
                        active 
                          ? "border-foreground text-foreground" 
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab}
                    </button>
                  )
                })}
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/10 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {activeTab}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={copyToClipboard}
                    className="h-7 px-2 flex items-center gap-1.5 rounded hover:bg-accent text-[11px] font-medium transition-colors border border-border bg-background"
                  >
                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button 
                    onClick={handleSummarize}
                    className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors border border-border bg-background"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'summary' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-p:text-foreground/90">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Clock size={24} className="opacity-20" />
                    <p className="text-xs italic">Feature coming soon...</p>
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    llama-3.3-70b · groq cloud
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App