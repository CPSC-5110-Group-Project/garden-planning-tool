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
        queryKey: submittedSearch ? ['plants', 'search', submittedSearch, page] : ['plants', 'list', page],
        queryFn: () => (submittedSearch ? searchPlants(submittedSearch, page, 20) : fetchPlants(page, 20)),
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
        <div className="bg-bg-main pt-3 pr-6 pb-3 flex flex-col gap-3 w-full @container font-sans">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search plants... (press Enter)"
                    value={search}
                    onChange={handleSearch}
                    onKeyDown={handleSubmit}
                    className="w-full bg-code-bg border border-border-main rounded-xl px-3 py-2 text-sm text-text-header placeholder-text-main/40 focus:outline-none focus:border-leaf-green transition-colors"
                />
                {search && (
                    <button
                        onClick={() => {
                            setSearch('');
                            setSubmittedSearch('');
                            goToPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-main/60 hover:text-text-header transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 @[300px]:grid-cols-2 gap-3">
                {isLoading && (
                    <div className="text-text-main/60 text-sm col-span-full italic pl-1 animate-pulse">
                        Gathering seeds...
                    </div>
                )}
                {isError && (
                    <div className="text-accent text-sm col-span-full font-mono pl-1">
                        Failed to load plants from the database.
                    </div>
                )}
                {data?.data.map((plant: Plant) => (
                    <PlantCard key={plant.perenual_id} plant={plant} />
                ))}
            </div>

            {data && (
                <div className="flex justify-between items-center text-xs text-text-main/80 font-medium mt-3 border-t border-border-main/40 pt-3">
                    <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className="disabled:opacity-30 hover:text-leaf-green transition-colors cursor-pointer disabled:cursor-not-allowed font-semibold"
                    >
                        ← Previous
                    </button>
                    <span className="flex items-center gap-1.5 text-text-main/70">
                        Page
                        <input
                            type="number"
                            value={pageInput}
                            min={1}
                            max={data.meta.total_pages}
                            onChange={(e) => setPageInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = Math.min(Math.max(1, Number(pageInput) || 1), data.meta.total_pages);
                                    goToPage(val);
                                }
                            }}
                            onBlur={() => {
                                const val = Math.min(Math.max(1, Number(pageInput) || 1), data.meta.total_pages);
                                goToPage(val);
                            }}
                            className="w-12 text-center bg-code-bg border border-border-main rounded-md px-1 py-0.5 text-text-header focus:outline-none focus:border-leaf-green font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-xs"
                        />
                        of {data.meta.total_pages}
                    </span>
                    <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === data.meta.total_pages}
                        className="disabled:opacity-30 hover:text-leaf-green transition-colors cursor-pointer disabled:cursor-not-allowed font-semibold"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
