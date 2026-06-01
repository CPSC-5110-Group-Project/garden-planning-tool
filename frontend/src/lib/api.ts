const BASE_URL = `${import.meta.env.VITE_API_URL}/plants`

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
