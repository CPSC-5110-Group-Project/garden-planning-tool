import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loadChatSessions, loadSessionMessages, deleteSession } from '../lib/api'

interface Message { role: 'user' | 'assistant'; content: string; image?: string }
interface Location { lat: number; lon: number }
interface Session { id: string; title: string; updated_at: string }

const API = import.meta.env.VITE_API_URL
const VISUALIZE_KW = /visuali[sz]|show me|generate.*image|what.*look.*like|how.*look/i

export default function AIChatbot() {
  const { user, isGuest, token } = useAuth()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [visualizing, setVisualizing] = useState(false)
  const [location, setLocation] = useState<Location | null>(() => {
    try {
      const cached = localStorage.getItem('garden_location')
      return cached ? (JSON.parse(cached) as Location) : null
    } catch { return null }
  })
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const [pendingGardenImage, setPendingGardenImage] = useState<string | null>(null)
  const [imageMode, setImageMode] = useState<'plant' | 'garden'>('plant')
  const [showImageOptions, setShowImageOptions] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [greeted, setGreeted] = useState(isGuest)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const gardenFileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Geolocation — try browser first, fall back to IP
  useEffect(() => {
    const saveAndSet = (loc: Location) => {
      setLocation(loc)
      localStorage.setItem('garden_location', JSON.stringify(loc))
    }

    const ipFallback = () =>
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(d => { if (d.latitude && d.longitude) saveAndSet({ lat: d.latitude, lon: d.longitude }) })
        .catch(() => {})

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => saveAndSet({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        ipFallback,
        { timeout: 5000 }
      )
    } else {
      ipFallback()
    }
  }, [])

  // Refresh session list whenever the user comes back to this tab
  useEffect(() => {
    const onFocus = () => {
      if (!isGuest) loadChatSessions().then(setSessions).catch(() => {})
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [isGuest])

  const showGreeting = () => {
    if (!user || greeted) return
    const firstName = user.name.split(' ')[0]
    const opts = [
      `Hey ${firstName}! 🌱 What can I help you with in your garden today?`,
      `Welcome back, ${firstName}! 🪴 What are we growing today?`,
      `Hi ${firstName}! 👋 Ready to plan your garden?`,
    ]
    setMessages([{ role: 'assistant', content: opts[Math.floor(Math.random() * opts.length)] }])
    setGreeted(true)
  }

  // Load sessions on mount — auto-open the most recent one
  useEffect(() => {
    if (isGuest) return
    if (!token) { if (user) setTimeout(showGreeting, 0); return }

    loadChatSessions()
      .then(async data => {
        setSessions(data)
        if (data.length > 0) {
          const latest = data[0]
          setSessionId(latest.id)
          try {
            const msgs = await loadSessionMessages(latest.id)
            if (msgs.length > 0) {
              setMessages(msgs)
              setGreeted(true)
              return
            }
          } catch { /* ignore */ }
        }
        if (user && !greeted) showGreeting()
      })
      .catch((err) => {
        console.error('Session load error:', err)
        if (user && !greeted) showGreeting()
      })
  }, [isGuest, user, token])

  const openSession = async (s: Session) => {
    setShowHistory(false)
    setSessionId(s.id)
    try {
      const data = await loadSessionMessages(s.id)
      setMessages(data)
    } catch { /* ignore */ }
  }

  const newChat = () => {
    setSessionId(null)
    setMessages([])
    setGreeted(false)
    setShowHistory(false)
    if (user && !isGuest) {
      const firstName = user.name.split(' ')[0]
      setMessages([{ role: 'assistant', content: `Hey ${firstName}! 🌱 New chat started. What are we growing?` }])
      setGreeted(true)
    }
  }

  const removeSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteSession(id).catch(() => {})
    setSessions(prev => prev.filter(s => s.id !== id))
    if (sessionId === id) newChat()
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  // ── Image handling ──────────────────────────────────────
  const handleImageFile = (file: File, mode: 'plant' | 'garden' = 'plant') => {
    const reader = new FileReader()
    reader.onload = e => {
      const b64 = (e.target?.result as string).split(',')[1]
      if (mode === 'garden') { setPendingGardenImage(b64) } else { setPendingImage(b64) }
    }
    reader.readAsDataURL(file)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (isGuest) return
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith('image/')) {
        const f = item.getAsFile()
        if (f) handleImageFile(f, 'plant')
      }
    }
  }

  const openCamera = async () => {
    setShowImageOptions(false); setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch { alert('Could not access camera.'); setShowCamera(false) }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const cv = canvasRef.current
    cv.width = videoRef.current.videoWidth; cv.height = videoRef.current.videoHeight
    cv.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    setPendingImage(cv.toDataURL('image/jpeg').split(',')[1])
    closeCamera()
  }

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null; setShowCamera(false)
  }

  // ── Find last garden image in history ──────────────────
  const findLastGardenImage = (): string | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user' && messages[i].image) return messages[i].image!
    }
    return null
  }

  // ── Visualize garden ───────────────────────────────────
  const visualizeGarden = async (imgB64: string) => {
    setVisualizing(true)
    const thinking: Message = { role: 'assistant', content: '🌿 Generating your garden visualization... (~20s)' }
    setMessages(prev => [...prev, thinking])
    try {
      // Pass recent chat so backend can extract already-suggested plants
      const recentChat = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch(`${API}/api/visualize-garden`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garden_image: imgB64,
          user_name: user?.name ?? null,
          conversation: recentChat,
        }),
      })
      const data = await res.json()
      setMessages(prev => {
        const clean = prev.filter(m => m !== thinking)
        const next: Message[] = [...clean, { role: 'assistant', content: data.analysis }]
        if (data.visualization) {
          next.push({ role: 'assistant', content: '🌿 Here is your garden after planting:', image: data.visualization })
        } else {
          next.push({ role: 'assistant', content: '⚠️ Image generation failed. Try again in a few seconds.' })
        }
        return next
      })
    } catch {
      setMessages(prev => [...prev.filter(m => m !== thinking), { role: 'assistant', content: 'Error generating visualization.' }])
    } finally { setVisualizing(false) }
  }

  // ── Send message ───────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() && !pendingImage && !pendingGardenImage) return

    // Text-triggered visualization
    if (input.trim() && VISUALIZE_KW.test(input) && !pendingGardenImage) {
      const lastImg = findLastGardenImage()
      if (lastImg) {
        setMessages(prev => [...prev, { role: 'user', content: input }])
        setInput('')
        visualizeGarden(lastImg)
        return
      }
    }

    const userMsg: Message = {
      role: 'user',
      content: input || (pendingGardenImage ? 'Analyze my garden.' : 'What plant is this?'),
      image: pendingImage ?? undefined,
    }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    const img = pendingImage; const gardenImg = pendingGardenImage
    setPendingImage(null); setPendingGardenImage(null)
    setLoading(true)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${API}/api/chat`, {
        method: 'POST', headers,
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          session_id: sessionId,
          lat: location?.lat ?? null, lon: location?.lon ?? null,
          image: img ?? null, garden_image: gardenImg ?? null,
          user_name: user?.name ?? null, is_guest: isGuest,
        }),
      })
      const data = await res.json()
      // Always sync session_id from backend response
      if (data.session_id) {
        if (!sessionId) {
          setSessionId(data.session_id)
          loadChatSessions().then(setSessions).catch(() => {})
        } else if (data.session_id !== sessionId) {
          setSessionId(data.session_id)
        }
      }
      setMessages([...updated, { role: 'assistant', content: data.response }])
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Error: could not get a response.' }])
    } finally { setLoading(false) }
  }

  const activePending = pendingImage || pendingGardenImage

  return (
    <div className="flex flex-col h-full">

      {/* ── Session toolbar ── */}
      {!isGuest && (
        <div className="flex items-center gap-2 px-3 pt-2 pb-1 border-b border-border-main flex-shrink-0">
          <button type="button" onClick={() => setShowHistory(v => !v)}
            className="flex items-center gap-1 text-xs text-text-main/50 hover:text-text-main transition-colors flex-1 min-w-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
            <span className="truncate">Chat History {sessions.length > 0 && `(${sessions.length})`}</span>
          </button>
          <button type="button" onClick={newChat}
            className="flex items-center gap-1 text-xs bg-accent/10 hover:bg-accent/20 text-accent px-2 py-1 rounded-lg transition-colors flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            New
          </button>
        </div>
      )}

      {/* ── Session list drawer ── */}
      {showHistory && !isGuest && (
        <div className="border-b border-border-main flex-shrink-0 max-h-48 overflow-y-auto bg-gray-800/40">
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No past chats yet.</p>
          ) : (
            sessions.map(s => (
              <div key={s.id}
                onClick={() => openSession(s)}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-700/50 group ${sessionId === s.id ? 'bg-accent/10' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/>
                </svg>
                <span className="text-xs text-gray-300 truncate flex-1">{s.title}</span>
                <button type="button" onClick={e => removeSession(e, s.id)}
                  className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1">✕</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Camera ── */}
      {showCamera && (
        <div className="flex flex-col gap-2 p-3 flex-shrink-0">
          <video ref={videoRef} autoPlay className="rounded w-full"/>
          <canvas ref={canvasRef} className="hidden"/>
          <div className="flex gap-2">
            <button type="button" onClick={capturePhoto} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-1 rounded">Take Photo</button>
            <button type="button" onClick={closeCamera} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-sm py-1 rounded">Cancel</button>
          </div>
        </div>
      )}

      {!showCamera && (
        <>
          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-3 pr-1">
            {messages.length === 0 && isGuest && (
              <div className="text-center mt-6 px-3">
                <p className="text-gray-400 text-sm mb-3">Ask me anything about plants or gardening!</p>
                <div className="bg-gray-800/60 border border-border-main rounded-xl p-3 text-xs text-gray-400">
                  <span className="text-accent font-medium">Guest mode</span> — text only.{' '}
                  <button type="button" onClick={() => navigate('/register')} className="text-accent hover:underline">Sign up free</button>
                  {' '}for image upload and full features.
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`text-sm p-3 rounded-xl max-w-[92%] leading-relaxed whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-accent/20 border border-accent/20 self-end' : 'bg-gray-700/60 self-start'
              }`}>
                {m.image && (
                  <img src={`data:image/jpeg;base64,${m.image}`} alt="garden"
                    className="rounded-lg mb-2 w-full max-h-64 object-cover"/>
                )}
                {m.content}
              </div>
            ))}

            {(loading || visualizing) && (
              <div className="text-gray-400 text-sm self-start flex items-center gap-2 px-3 py-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0ms]"/>
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:150ms]"/>
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:300ms]"/>
                </span>
                {visualizing ? 'Generating visualization...' : 'Thinking...'}
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* ── Pending image preview ── */}
          {activePending && (
            <div className="flex items-center gap-3 px-3 flex-shrink-0">
              <div className="relative w-14 h-14">
                <img src={`data:image/jpeg;base64,${activePending}`} alt="preview"
                  className="w-14 h-14 object-cover rounded-lg border border-border-main"/>
                {pendingGardenImage && <span className="absolute -top-2 left-0 text-[9px] bg-accent text-white px-1 rounded">Garden</span>}
                <button type="button" onClick={() => { setPendingImage(null); setPendingGardenImage(null) }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</button>
              </div>
              {pendingGardenImage && !isGuest && (
                <button type="button" disabled={visualizing}
                  onClick={() => { const img = pendingGardenImage; setPendingGardenImage(null); visualizeGarden(img) }}
                  className="text-xs font-semibold px-3 py-2 rounded-xl bg-accent hover:bg-accent/80 disabled:opacity-50 text-white transition-colors">
                  🌿 {visualizing ? 'Generating...' : 'Visualize My Garden'}
                </button>
              )}
            </div>
          )}

          {/* ── Image options ── */}
          {showImageOptions && !isGuest && (
            <div className="flex flex-col gap-1 mx-3 bg-gray-800 border border-border-main p-2 rounded-xl flex-shrink-0">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest px-1 mb-0.5">Upload for...</p>
              <button type="button" onClick={() => { setImageMode('plant'); fileInputRef.current?.click(); setShowImageOptions(false) }}
                className="flex items-center gap-2 text-sm text-white bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-lg">
                🌿 Identify a plant
              </button>
              <button type="button" onClick={() => { setImageMode('garden'); gardenFileInputRef.current?.click(); setShowImageOptions(false) }}
                className="flex items-center gap-2 text-sm text-white bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-lg">
                🏡 Analyze &amp; visualize my garden
              </button>
              <button type="button" onClick={openCamera}
                className="flex items-center gap-2 text-sm text-white bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-lg">
                📷 Use camera
              </button>
            </div>
          )}

          {/* ── Input bar ── */}
          <div className="flex gap-2 items-center p-3 flex-shrink-0">
            {!isGuest ? (
              <button type="button" onClick={() => setShowImageOptions(v => !v)}
                className={`text-gray-400 hover:text-white px-1 transition-colors ${showImageOptions ? 'text-accent' : ''}`} title="Upload image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
            ) : (
              <button type="button" onClick={() => navigate('/register')} title="Sign up to upload"
                className="text-gray-600 hover:text-accent px-1 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </button>
            )}
            <input
              className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none placeholder-gray-500 focus:ring-1 focus:ring-accent/40"
              placeholder={isGuest ? 'Ask about plants...' : 'Ask or paste an image...'}
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              onPaste={handlePaste} onFocus={() => setShowImageOptions(false)}/>
            <button type="button" onClick={sendMessage} disabled={loading || visualizing}
              className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white text-sm px-3 py-2.5 rounded-lg transition-colors">
              Send
            </button>
          </div>
        </>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" title="Upload plant image" aria-label="Upload plant image"
        className="hidden" onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], imageMode)}/>
      <input ref={gardenFileInputRef} type="file" accept="image/*" title="Upload garden image" aria-label="Upload garden image"
        className="hidden" onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'garden')}/>
    </div>
  )
}
