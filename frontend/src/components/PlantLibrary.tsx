import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PlantCard from './PlantCard';
import { type Plant } from '../types/garden';
import { fetchPlants, searchPlants } from '../lib/api';

export default function PlantLibrary() {
    const [search, setSearch] = useState('');
    const [submittedSearch, setSubmittedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageInput, setPageInput] = useState('1');

    const { data, isLoading, isError } = useQuery({
        queryKey: submittedSearch
            ? ['plants', 'search', submittedSearch, page]
            : ['plants', 'list', page],
        queryFn: () =>
            submittedSearch
                ? searchPlants(submittedSearch, page, 20)
                : fetchPlants(page, 20),
    });

    const goToPage = (newPage: number) => {
        setPage(newPage);
        setPageInput(String(newPage));
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSubmittedSearch(search);
            goToPage(1);
        }
    };

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
                            setSearch('');
                            setSubmittedSearch('');
                            goToPage(1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 @[300px]:grid-cols-2 gap-3">
                {isLoading && (
                    <div className="text-gray-400 text-sm col-span-full">
                        Loading...
                    </div>
                )}
                {isError && (
                    <div className="text-red-400 text-sm col-span-full">
                        Failed to load plants.
                    </div>
                )}
                {data?.data.map((plant: Plant) => (
                    <PlantCard key={plant.perenual_id} plant={plant} />
                ))}
            </div>

            {data && (
                <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                    <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className="disabled:opacity-30"
                    >
                        Previous
                    </button>
                    <span className="flex items-center gap-1">
                        Page
                        <input
                            type="number"
                            value={pageInput}
                            min={1}
                            max={data.meta.total_pages}
                            onChange={(e) => setPageInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = Math.min(
                                        Math.max(1, Number(pageInput) || 1),
                                        data.meta.total_pages
                                    );
                                    goToPage(val);
                                }
                            }}
                            onBlur={() => {
                                const val = Math.min(
                                    Math.max(1, Number(pageInput) || 1),
                                    data.meta.total_pages
                                );
                                goToPage(val);
                            }}
                            className="w-10 text-center bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-white focus:outline-none focus:border-green-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        of {data.meta.total_pages}
                    </span>
                    <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === data.meta.total_pages}
                        className="disabled:opacity-30"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
