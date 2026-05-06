import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Sparkles, Settings, Copy, Check, Globe, RefreshCw, Clock, AlertCircle, Sun, Moon, Trash2, FileText, ArrowLeft, Key, ExternalLink } from 'lucide-react'

const THEMES = {
  light: {
    bg:             '#ffffff',
    bgSurface:      '#f5f5f5',
    border:         '#e5e5e5',
    borderSub:      '#f0f0f0',
    text:           '#111111',
    textMuted:      '#444444',
    textDim:        '#999999',
    textFaint:      '#cccccc',
    accent:         '#111111',
    accentText:     '#ffffff',
    tabActive:      '#111111',
    tabBorder:      '#111111',
    btnGhostBorder: '#d4d4d4',
    btnGhostText:   '#111111',
    errorBg:        '#fff5f5',
    errorBorder:    '#fecaca',
    errorTitle:     '#dc2626',
    errorText:      '#ef4444',
    inputBg:        '#ffffff',
    inputText:      '#111111',
  },
  dark: {
    bg:             '#1c1c27',
    bgSurface:      '#252535',
    border:         '#2e2e3e',
    borderSub:      '#252535',
    text:           '#e8e8f0',
    textMuted:      '#c8c8e0',
    textDim:        '#6b6b8a',
    textFaint:      '#444460',
    accent:         '#9b8dff',
    accentText:     '#ffffff',
    tabActive:      '#9b8dff',
    tabBorder:      '#9b8dff',
    btnGhostBorder: '#3a3a50',
    btnGhostText:   '#9b8dff',
    errorBg:        '#2a1c27',
    errorBorder:    '#5c2e3e',
    errorTitle:     '#f87171',
    errorText:      '#fca5a5',
    inputBg:        '#1c1c27',
    inputText:      '#e8e8f0',
  },
}

export default function App() {
  const [theme, setTheme] = useState('light')
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
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        throw new Error('Chrome API not available.')
      }
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        throw new Error('AI cannot read browser system pages.')
      }

      try {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content/content.js'] })
      } catch (e) { console.log('Script injection skipped:', e) }

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' }).catch(() => {
        throw new Error('Extension updated! Please REFRESH the webpage once.')
      })

      if (!response) throw new Error('Could not extract page content.')
      
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
            lastSummary: res.summary, 
            lastInsights: res.insights,
            lastUrl: tab.url,
            lastStats: stats
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
    setSummary('')
    setInsights('')
    setError('')
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(['lastSummary', 'lastInsights', 'lastStats'])
    }
  }

  const saveApiKey = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ apiKey }, () => {
        setSaveStatus('Saved!')
        setTimeout(() => setSaveStatus(''), 2000)
      })
    }
  }

  const copyToClipboard = () => {
    const textToCopy = activeTab === 'summary' ? summary : insights
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (showSettings) {
    return (
      <div style={{
        width: '380px', minHeight: '420px', background: t.bg, border: `0.5px solid ${t.border}`,
        borderRadius: '14px', display: 'flex', flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '13px', color: t.text, overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: `0.5px solid ${t.border}`, gap: '12px' }}>
          <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: t.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontWeight: 600 }}>Settings</span>
        </div>
        
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Key size={14} color={t.textDim} />
              <span style={{ fontWeight: 500, fontSize: '12px' }}>Groq API Key</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: '6px', border: `1px solid ${t.border}`,
                  background: t.inputBg, color: t.inputText, fontSize: '12px', outline: 'none'
                }}
              />
              <button onClick={saveApiKey} style={{
                padding: '0 12px', background: t.accent, color: t.accentText, border: 'none', borderRadius: '6px',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}>
                {saveStatus || 'Save'}
              </button>
            </div>
            <div style={{ marginTop: '10px', fontSize: '11px', color: t.textDim, lineHeight: 1.5 }}>
              Your key is stored locally in your browser. Get a free key at{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: t.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                Groq Console <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div style={{ borderTop: `0.5px solid ${t.border}`, paddingTop: '20px' }}>
            <div style={{ fontWeight: 500, marginBottom: '10px' }}>Appearance</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <ThemeOption active={theme === 'light'} label="Light" onClick={() => setTheme('light')} t={t} icon={<Sun size={14} />} />
              <ThemeOption active={theme === 'dark'} label="Dark" onClick={() => setTheme('dark')} t={t} icon={<Moon size={14} />} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '380px', minHeight: '420px', background: t.bg, border: `0.5px solid ${t.border}`,
      borderRadius: '14px', display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: '13px', color: t.text, overflow: 'hidden', transition: 'background 0.2s, color 0.2s',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderBottom: `0.5px solid ${t.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '22px', height: '22px', background: t.accent, borderRadius: '5px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={12} color={t.accentText} />
          </div>
          <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>AI Summarizer</span>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          <IconBtn t={t} title="Clear summary" onClick={handleClear}><Trash2 size={15} /></IconBtn>
          <IconBtn t={t} title="Settings" onClick={() => setShowSettings(true)}><Settings size={15} /></IconBtn>
        </div>
      </div>

      {/* Page info & Stats */}
      <div style={{ padding: '10px 14px', borderBottom: `0.5px solid ${t.border}`, background: t.bgSurface }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '16px', height: '16px', background: t.bg, border: `0.5px solid ${t.border}`,
            borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Globe size={9} color={t.textDim} />
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{
              fontWeight: 500, fontSize: '11px', color: t.textMuted,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4,
            }}>
              {pageInfo.title || 'Detecting page...'}
            </div>
          </div>
        </div>
        {pageInfo.wordCount > 0 && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', marginLeft: '26px' }}>
            <span style={{ fontSize: '10px', color: t.textDim, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={10} /> {pageInfo.wordCount} words
            </span>
            <span style={{ fontSize: '10px', color: t.textDim, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={10} /> {pageInfo.readingTime} min read
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!summary && !loading && !error && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 16px 20px', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '-0.02em' }}>Ready to summarize</div>
              <div style={{ fontSize: '12px', color: t.textDim, lineHeight: 1.6, marginTop: '4px' }}>
                Extract key points, insights, and reading stats from this article instantly.
              </div>
            </div>
            <PrimaryBtn t={t} onClick={handleSummarize}>
              <Sparkles size={13} /> Summarize Now
            </PrimaryBtn>
          </div>
        )}

        {loading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: '14px' }}>
            <div style={{ width: '100%', height: '2px', background: t.border, borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '40%', background: t.accent, borderRadius: '99px', animation: 'slide 1.4s ease-in-out infinite' }} />
            </div>
            <span style={{ fontSize: '11px', color: t.textDim, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Analyzing...</span>
            <style>{`@keyframes slide{0%{transform:translateX(-100%);width:40%}50%{width:60%}100%{transform:translateX(350%);width:40%}}`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px', background: t.errorBg, border: `0.5px solid ${t.errorBorder}`, borderRadius: '8px' }}>
              <AlertCircle size={15} color={t.errorTitle} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '12px', color: t.errorTitle, marginBottom: '2px' }}>Error</div>
                <div style={{ fontSize: '12px', color: t.errorText, lineHeight: 1.5 }}>{error}</div>
              </div>
            </div>
            <PrimaryBtn t={t} onClick={handleSummarize}>Try again</PrimaryBtn>
            {error.includes('API Key') && (
              <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: t.accent, fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
                Go to Settings
              </button>
            )}
          </div>
        )}

        {summary && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', padding: '0 14px', borderBottom: `0.5px solid ${t.border}` }}>
              {['Summary', 'Insights'].map((tab) => {
                const key = tab.toLowerCase();
                const active = activeTab === key;
                return (
                  <button key={key} onClick={() => setActiveTab(key)} style={{
                    padding: '10px 0', marginRight: '20px', fontSize: '12px', fontWeight: active ? 600 : 400,
                    color: active ? t.tabActive : t.textDim, background: 'none', border: 'none',
                    borderBottom: active ? `2px solid ${t.tabBorder}` : '2px solid transparent', cursor: 'pointer',
                  }}>
                    {tab}
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: `0.5px solid ${t.borderSub}`, background: t.bgSurface }}>
              <span style={{ fontSize: '10px', color: t.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{activeTab}</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <IconBtn t={t} title={copied ? 'Copied' : 'Copy'} onClick={copyToClipboard}>
                  {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                </IconBtn>
                <IconBtn t={t} title="Refresh" onClick={handleSummarize}><RefreshCw size={14} /></IconBtn>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', maxHeight: '220px' }}>
              <ReactMarkdown
                components={{
                  p:      ({ children }) => <p style={{ margin: '8px 0', color: t.textMuted, lineHeight: 1.6, fontSize: '12.5px' }}>{children}</p>,
                  ul:     ({ children }) => <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>{children}</ul>,
                  li:     ({ children }) => <li style={{ margin: '6px 0', lineHeight: 1.55, color: t.textMuted, fontSize: '12.5px' }}>{children}</li>,
                }}
              >
                {activeTab === 'summary' ? summary : insights}
              </ReactMarkdown>
            </div>

            <div style={{ padding: '10px 14px', borderTop: `0.5px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: t.bgSurface }}>
              <span style={{ fontSize: '10px', color: t.textDim, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                Groq AI
              </span>
              <div style={{ fontSize: '10px', color: t.textDim }}>v2.2</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function IconBtn({ children, onClick, title, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick} title={title}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hovered ? t.bg : 'none', border: hovered ? `0.5px solid ${t.border}` : 'none', 
        borderRadius: '6px', cursor: 'pointer', color: t.textDim, transition: 'all 0.1s',
      }}
    >
      {children}
    </button>
  )
}

function ThemeOption({ active, label, onClick, t, icon }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      padding: '8px', borderRadius: '8px', border: `1.5px solid ${active ? t.accent : t.border}`,
      background: active ? t.bgSurface : 'none', color: active ? t.text : t.textDim,
      cursor: 'pointer', fontSize: '12px', fontWeight: active ? 600 : 400, transition: 'all 0.2s',
    }}>
      {icon} {label}
    </button>
  )
}

function PrimaryBtn({ children, onClick, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: '10px 14px', background: t.accent, color: t.accentText,
        border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        opacity: hovered ? 0.9 : 1, transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  )
}