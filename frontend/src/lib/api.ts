const BASE_URL = `${import.meta.env.VITE_API_URL}/plants`

export async function fetchPlants(page: number, limit: number) {
  const res = await fetch(`${BASE_URL}/?page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch plants')
  return res.json()
}

export async function searchPlants(q: string, page: number, limit: number) {
  const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to search plants')
  return res.json()
}
