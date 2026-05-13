import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  image?: string
}

interface Location {
  lat: number
  lon: number
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const [showImageOptions, setShowImageOptions] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setLocation(null)
      )
    }
  }, [])

  const handleImageFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1]
      setPendingImage(base64)
    }
    reader.readAsDataURL(file)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) handleImageFile(file)
      }
    }
  }

  const openCamera = async () => {
    setShowImageOptions(false)
    setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      alert('Could not access camera.')
      setShowCamera(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1]
    setPendingImage(base64)
    closeCamera()
  }

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setShowCamera(false)
  }

  const sendMessage = async () => {
    if (!input.trim() && !pendingImage) return

    const userMessage: Message = {
      role: 'user',
      content: input || 'What plant is this?',
      image: pendingImage ?? undefined
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setPendingImage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          lat: location?.lat ?? null,
          lon: location?.lon ?? null,
          image: userMessage.image ?? null,
        }),
      })
      const data = await res.json()
      setMessages([...updatedMessages, { role: 'assistant', content: data.response }])
    } catch {
      setMessages([...updatedMessages, { role: 'assistant', content: 'Error: could not get response.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      {showCamera && (
        <div className="flex flex-col gap-2">
          <video ref={videoRef} autoPlay className="rounded w-full" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <button onClick={capturePhoto} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-1 rounded">Take Photo</button>
            <button onClick={closeCamera} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-sm py-1 rounded">Cancel</button>
          </div>
        </div>
      )}

      {!showCamera && (
        <>
          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm text-center mt-4">Ask me anything about your garden!</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`text-sm p-2 rounded-lg max-w-[90%] ${m.role === 'user' ? 'bg-green-800 self-end' : 'bg-gray-700 self-start'}`}>
                {m.image && <img src={`data:image/jpeg;base64,${m.image}`} alt="plant" className="rounded mb-1 max-w-full max-h-32 object-cover" />}
                {m.content}
              </div>
            ))}
            {loading && <div className="text-gray-400 text-sm self-start">Thinking...</div>}
          </div>

          {pendingImage && (
            <div className="relative w-16 h-16">
              <img src={`data:image/jpeg;base64,${pendingImage}`} alt="preview" className="w-16 h-16 object-cover rounded" />
              <button onClick={() => setPendingImage(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</button>
            </div>
          )}

          {showImageOptions && (
            <div className="flex gap-2 bg-gray-800 p-2 rounded">
              <button onClick={() => { fileInputRef.current?.click(); setShowImageOptions(false) }} className="flex-1 text-sm text-white bg-gray-700 hover:bg-gray-600 py-1 rounded flex items-center justify-center gap-1">
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
  Upload
</button>
<button onClick={openCamera} className="flex-1 text-sm text-white bg-gray-700 hover:bg-gray-600 py-1 rounded flex items-center justify-center gap-1">
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
  Capture
</button>

            </div>
          )}

          <div className="flex gap-2 items-center">
            <button onClick={() => setShowImageOptions(!showImageOptions)} className="text-gray-400 hover:text-white px-1">
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
</button>

            <input

              className="flex-1 bg-gray-800 text-white text-sm rounded px-3 py-2 outline-none"
              placeholder="Ask or paste an image..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              onPaste={handlePaste}
              onFocus={() => setShowImageOptions(false)}

            />
            <button onClick={sendMessage} className="bg-green-600 hover:bg-green-500 text-white text-sm px-3 py-2 rounded">Send</button>
          </div>
        </>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
    </div>
  )
}
