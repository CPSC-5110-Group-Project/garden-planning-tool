import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  vi.resetModules()
})

async function loadApi() {
  vi.stubEnv('VITE_API_URL', 'https://api.example.test')
  return import('./api')
}

function mockFetch(response: unknown, ok = true) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    json: () => Promise.resolve(response),
  } as Response)
}

describe('plant API client', () => {
  it('fetches plants with pagination and active filters', async () => {
    const fetchMock = mockFetch({ data: [] })
    const { fetchPlants } = await loadApi()

    await fetchPlants(2, 10, { type: 'Herb', edible_fruit: false, flowers: true })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/plants/?page=2&limit=10&type=Herb&edible_fruit=false&flowers=true',
    )
  })

  it('searches plants with an encoded query', async () => {
    const fetchMock = mockFetch({ data: [] })
    const { searchPlants } = await loadApi()

    await searchPlants('rose mary', 1, 20)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/plants/search?q=rose+mary&page=1&limit=20',
    )
  })

  it('throws when the plant request fails', async () => {
    mockFetch({ detail: 'broken' }, false)
    const { fetchPlants } = await loadApi()

    await expect(fetchPlants(1, 20)).rejects.toThrow('Failed to fetch plants')
  })
})
