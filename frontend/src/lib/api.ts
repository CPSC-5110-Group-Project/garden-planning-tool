const API = import.meta.env.VITE_API_URL
const BASE_URL = `${API}/plants`

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('garden_auth')
    if (!raw) return null
    return JSON.parse(raw)?.token ?? null
  } catch { return null }
}

export function authHeaders(): HeadersInit {
  const token = getToken()
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

// ── Gardens ──────────────────────────────────────────
export async function loadGardensFromDB() {
  const res = await fetch(`${API}/api/gardens/`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to load gardens')
  return res.json()
}

export async function saveGardensToDB(gardens: object) {
  const res = await fetch(`${API}/api/gardens/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ gardens: Object.values(gardens) }),
  })
  if (!res.ok) throw new Error('Failed to save gardens')
  return res.json()
}

// ── Chat sessions ─────────────────────────────────────
export async function loadChatSessions() {
  const res = await fetch(`${API}/api/chat/sessions`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to load sessions')
  return res.json()
}

export async function loadSessionMessages(sessionId: string) {
  const res = await fetch(`${API}/api/chat/sessions/${sessionId}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to load session')
  return res.json()
}

export async function deleteSession(sessionId: string) {
  const res = await fetch(`${API}/api/chat/sessions/${sessionId}`, { method: 'DELETE', headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to delete session')
  return res.json()
}

export interface PlantFilters {
  type?: string
  watering?: string
  sunlight?: string
  care_level?: string
  growth_rate?: string
  cycle?: string
  edible_fruit?: boolean
  edible_leaf?: boolean
  flowers?: boolean
}

export interface PlantFilterOptions {
  type: string[]
  watering: string[]
  sunlight: string[]
  care_level: string[]
  growth_rate: string[]
  cycle: string[]
}

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  }
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export async function fetchFilterOptions() {
  const res = await fetch(`${BASE_URL}/filter-options`)
  if (!res.ok) throw new Error('Failed to fetch filter options')
  return res.json() as Promise<PlantFilterOptions>
}

export async function fetchPlants(page: number, limit: number, filters?: PlantFilters) {
  const res = await fetch(`${BASE_URL}/${buildQuery({ page, limit, ...filters })}`)
  if (!res.ok) throw new Error('Failed to fetch plants')
  return res.json()
}

export async function searchPlants(q: string, page: number, limit: number, filters?: PlantFilters) {
  const res = await fetch(`${BASE_URL}/search${buildQuery({ q, page, limit, ...filters })}`)
  if (!res.ok) throw new Error('Failed to search plants')
  return res.json()
}
