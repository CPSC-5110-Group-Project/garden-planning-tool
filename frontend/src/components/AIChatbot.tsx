import { useState, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setLocation(null)
      )
    }
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          lat: location?.lat ?? null,
          lon: location?.lon ?? null,
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
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-4">Ask me anything about your garden!</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`text-sm p-2 rounded-lg max-w-[90%] ${m.role === 'user' ? 'bg-green-800 self-end' : 'bg-gray-700 self-start'}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="text-gray-400 text-sm self-start">Thinking...</div>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-gray-800 text-white text-sm rounded px-3 py-2 outline-none"
          placeholder="Ask about plants, soil, layout..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-green-600 hover:bg-green-500 text-white text-sm px-3 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  )
}
