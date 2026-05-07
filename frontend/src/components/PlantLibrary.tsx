import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PlantCard, { type Plant } from './PlantCard'
import { fetchPlants, searchPlants } from '../lib/api'

export default function PlantLibrary() {
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: submittedSearch ? ['plants', 'search', submittedSearch, page] : ['plants', 'list', page],
    queryFn: () => submittedSearch
      ? searchPlants(submittedSearch, page, 20)
      : fetchPlants(page, 20),
  })

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSubmittedSearch(search)
      setPage(1)
    }
  }

  return (
    <div className="pt-3 pr-6 pb-3 flex flex-col gap-3 w-full @container">
      <div className="relative">
        <input
          type="text"
          placeholder="Search plants... (press Enter)"
          value={search}
          onChange={handleSearch}
          onKeyDown={handleSubmit}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('')
              setSubmittedSearch('')
              setPage(1)
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 @[300px]:grid-cols-2 gap-3">
        {isLoading && <div className="text-gray-400 text-sm col-span-full">Loading...</div>}
        {isError && <div className="text-red-400 text-sm col-span-full">Failed to load plants.</div>}
        {data?.data.map((plant: Plant) => (
          <PlantCard key={plant.perenual_id} plant={plant} />
        ))}
      </div>

      {data && (
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            className="disabled:opacity-30"
          >
            Previous
          </button>
          <span>Page {data.meta.page} of {data.meta.total_pages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === data.meta.total_pages}
            className="disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
