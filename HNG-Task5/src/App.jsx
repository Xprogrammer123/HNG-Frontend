import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Sparkles, Settings, Copy, Check, Globe, RefreshCw, Clock, AlertCircle, Sun, Moon, Trash2, FileText, ArrowLeft, Key, ExternalLink } from 'lucide-react'

const THEMES = {
  light: {
    bg:             '#ffffff',
    bgSurface:      '#fafafa',
    border:         '#eaeaea',
    borderSub:      '#f0f0f0',
    text:           '#000000',
    textMuted:      '#444444',
    textDim:        '#888888',
    textFaint:      '#cccccc',
    accent:         '#000000',
    accentText:     '#ffffff',
    tabActive:      '#000000',
    tabBorder:      '#000000',
    btnGhostBorder: '#d4d4d4',
    btnGhostText:   '#000000',
    errorBg:        '#fff5f5',
    errorBorder:    '#fecaca',
    errorTitle:     '#dc2626',
    errorText:      '#ef4444',
    inputBg:        '#ffffff',
    inputText:      '#000000',
  },
  dark: {
    bg:             '#000000',
    bgSurface:      '#111111',
    border:         '#333333',
    borderSub:      '#222222',
    text:           '#ffffff',
    textMuted:      '#a1a1a1',
    textDim:        '#666666',
    textFaint:      '#333333',
    accent:         '#ffffff',
    accentText:     '#000000',
    tabActive:      '#ffffff',
    tabBorder:      '#ffffff',
    btnGhostBorder: '#444444',
    btnGhostText:   '#ffffff',
    errorBg:        '#1a0505',
    errorBorder:    '#441111',
    errorTitle:     '#f87171',
    errorText:      '#fca5a5',
    inputBg:        '#000000',
    inputText:      '#ffffff',
  },
}

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [summary, setSummary] = useState('')
  const [insights, setInsights] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [pageInfo, setPageInfo] = useState({ title: '', url: '', wordCount: 0, readingTime: 0 })
  const [activeTab, setActiveTab] = useState('summary')
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [saveStatus, setSaveStatus] = useState('')

  const t = THEMES[theme]

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['theme', 'lastSummary', 'lastInsights', 'lastUrl', 'lastStats', 'apiKey'], (result) => {
        if (result.theme) setTheme(result.theme)
        if (result.apiKey) setApiKey(result.apiKey)
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0]
          if (tab && tab.url === result.lastUrl) {
            setSummary(result.lastSummary || '')
            setInsights(result.lastInsights || '')
            if (result.lastStats) {
              setPageInfo(prev => ({ ...prev, title: tab.title, url: tab.url, ...result.lastStats }))
            } else {
              setPageInfo(prev => ({ ...prev, title: tab.title, url: tab.url }))
            }
          } else if (tab) {
            setPageInfo(prev => ({ ...prev, title: tab.title, url: tab.url }))
          }
        })
      })
    }
  }, [])

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ theme })
    }
  }, [theme])

  const handleSummarize = async () => {
    setLoading(true)
    setError('')
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
        throw new Error('Cannot summarize system pages.')
      }

      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content/content.js'] }).catch(() => {})
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' }).catch(() => {
        throw new Error('Extension updated! Please refresh the page.')
      })

      if (!response) throw new Error('Could not read page content.')
      
      const stats = { wordCount: response.wordCount, readingTime: response.readingTime }
      setPageInfo(prev => ({ ...prev, ...stats }))

      chrome.runtime.sendMessage({ action: 'summarize', data: response }, (res) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message)
          setLoading(false)
          return
        }
        if (res.success) {
          setSummary(res.summary)
          setInsights(res.insights)
          chrome.storage.local.set({ 
            lastSummary: res.summary, lastInsights: res.insights,
            lastUrl: tab.url, lastStats: stats
          })
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

  const handleClear = () => {
    setSummary(''); setInsights(''); setError('');
    chrome.storage.local.remove(['lastSummary', 'lastInsights', 'lastStats'])
  }

  const saveApiKey = () => {
    chrome.storage.local.set({ apiKey }, () => {
      setSaveStatus('Saved!'); setTimeout(() => setSaveStatus(''), 2000)
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeTab === 'summary' ? summary : insights)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // --- RENDERING ---

  const Layout = ({ children }) => (
    <div style={{
      width: '400px',
      minHeight: '450px',
      background: t.bg,
      color: t.text,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, -apple-system, sans-serif',
      fontSize: '13px',
      boxSizing: 'border-box',
    }}>
      {children}
    </div>
  )

  if (showSettings) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: `1px solid ${t.border}`, gap: '12px' }}>
          <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: t.textDim, cursor: 'pointer' }}>
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontWeight: 600 }}>Settings</span>
        </div>
        
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Key size={14} color={t.textDim} />
              <span style={{ fontWeight: 500 }}>Groq API Key</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '8px', border: `1px solid ${t.border}`,
                  background: t.inputBg, color: t.inputText, outline: 'none'
                }}
              />
              <button onClick={saveApiKey} style={{
                padding: '0 16px', background: t.accent, color: t.accentText, border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
              }}>
                {saveStatus || 'Save'}
              </button>
            </div>
            <div style={{ marginTop: '12px', fontSize: '11px', color: t.textDim }}>
              Stored locally. Get one at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: t.accent }}>Groq Console</a>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: '24px' }}>
            <div style={{ fontWeight: 500, marginBottom: '12px' }}>Theme</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <ThemeOption active={theme === 'light'} label="Light" onClick={() => setTheme('light')} t={t} icon={<Sun size={14} />} />
              <ThemeOption active={theme === 'dark'} label="Dark" onClick={() => setTheme('dark')} t={t} icon={<Moon size={14} />} />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '24px', height: '24px', background: t.accent, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={14} color={t.accentText} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>AI Summarizer</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <IconBtn t={t} title="Clear" onClick={handleClear}><Trash2 size={16} /></IconBtn>
          <IconBtn t={t} title="Settings" onClick={() => setShowSettings(true)}><Settings size={16} /></IconBtn>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ padding: '12px 16px', background: t.bgSurface, borderBottom: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={12} color={t.textDim} />
          <span style={{ fontSize: '11px', color: t.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {pageInfo.title || 'Page not detected'}
          </span>
        </div>
        {pageInfo.wordCount > 0 && (
          <div style={{ display: 'flex', gap: '16px', marginLeft: '20px' }}>
            <span style={{ fontSize: '10px', color: t.textDim, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={10} /> {pageInfo.wordCount} words
            </span>
            <span style={{ fontSize: '10px', color: t.textDim, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={10} /> {pageInfo.readingTime}m read
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!summary && !loading && !error && (
          <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>Summarize this page</div>
              <p style={{ color: t.textDim, lineHeight: 1.5 }}>Get key points and insights using Llama 3.3 AI.</p>
            </div>
            <PrimaryBtn t={t} onClick={handleSummarize}>
              <Sparkles size={14} /> Generate Summary
            </PrimaryBtn>
          </div>
        )}

        {loading && (
          <div style={{ padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '100%', height: '2px', background: t.border, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '40%', background: t.accent, borderRadius: '4px', animation: 'progress 1.5s infinite linear' }} />
            </div>
            <span style={{ fontSize: '11px', color: t.textDim, letterSpacing: '0.1em' }}>ANALYZING CONTENT</span>
            <style>{`@keyframes progress{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', padding: '12px', background: t.errorBg, border: `1px solid ${t.errorBorder}`, borderRadius: '8px' }}>
              <AlertCircle size={16} color={t.errorTitle} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '12px', color: t.errorText, lineHeight: 1.5 }}>{error}</div>
            </div>
            <PrimaryBtn t={t} onClick={handleSummarize}>Try Again</PrimaryBtn>
            {error.includes('Key') && <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: t.accent, cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>Open Settings</button>}
          </div>
        )}

        {summary && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', padding: '0 16px', borderBottom: `1px solid ${t.border}` }}>
              {['Summary', 'Insights'].map((tab) => {
                const active = activeTab === tab.toLowerCase()
                return (
                  <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} style={{
                    padding: '12px 0', marginRight: '24px', fontSize: '12px', fontWeight: active ? 600 : 400,
                    color: active ? t.tabActive : t.textDim, background: 'none', border: 'none',
                    borderBottom: active ? `2px solid ${t.tabBorder}` : '2px solid transparent', cursor: 'pointer'
                  }}>{tab}</button>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: t.bgSurface, borderBottom: `1px solid ${t.borderSub}` }}>
              <span style={{ fontSize: '10px', color: t.textDim, fontWeight: 700, textTransform: 'uppercase' }}>{activeTab}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <IconBtn t={t} title="Copy" onClick={copyToClipboard}>{copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}</IconBtn>
                <IconBtn t={t} title="Refresh" onClick={handleSummarize}><RefreshCw size={14} /></IconBtn>
              </div>
            </div>

            <div style={{ padding: '16px', overflowY: 'auto', maxHeight: '250px' }}>
              <ReactMarkdown components={{
                p: ({children}) => <p style={{ margin: '0 0 12px 0', lineHeight: 1.6, color: t.textMuted }}>{children}</p>,
                li: ({children}) => <li style={{ marginBottom: '8px', lineHeight: 1.5, color: t.textMuted }}>{children}</li>,
                ul: ({children}) => <ul style={{ paddingLeft: '18px', margin: '0 0 12px 0' }}>{children}</ul>,
              }}>{activeTab === 'summary' ? summary : insights}</ReactMarkdown>
            </div>

            <div style={{ padding: '12px 16px', borderTop: `1px solid ${t.border}`, background: t.bgSurface, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: t.textDim }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                Llama 3.3
              </div>
              <div style={{ fontSize: '10px', color: t.textDim }}>v2.3 stable</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

function IconBtn({ children, onClick, title, t }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} title={title} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '6px', border: 'none', background: hover ? t.borderSub : 'none', color: t.textDim, cursor: 'pointer', transition: 'all 0.2s'
    }}>{children}</button>
  )
}

function PrimaryBtn({ children, onClick, t }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      width: '100%', padding: '12px', background: t.accent, color: t.accentText, border: 'none', borderRadius: '8px',
      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
      opacity: hover ? 0.9 : 1, transition: 'all 0.2s'
    }}>{children}</button>
  )
}

function ThemeOption({ active, label, onClick, t, icon }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px',
      borderRadius: '8px', border: `1px solid ${active ? t.accent : t.border}`, background: active ? t.bgSurface : 'none',
      color: active ? t.text : t.textDim, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s'
    }}>{icon} {label}</button>
  )
}