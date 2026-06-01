import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import PlantCard from './PlantCard';
import { type Plant } from '../types/garden';
import {
    fetchFilterOptions,
    fetchPlants,
    searchPlants,
    type PlantFilterOptions,
    type PlantFilters,
} from '../lib/api';

const EMPTY_FILTERS: PlantFilters = {};
const POPOVER_GAP_PX = 8;
const POPOVER_MAX_WIDTH = 384;

function getPopoverPosition(trigger: HTMLElement) {
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(POPOVER_MAX_WIDTH, window.innerWidth - 48);

    return {
        top: rect.bottom + POPOVER_GAP_PX,
        left: rect.left,
        width,
        maxHeight: Math.min(window.innerHeight * 0.7, 512),
    };
}

const BOOL_FILTER_OPTIONS = [
    { key: 'edible_fruit' as const, label: 'Edible fruit' },
    { key: 'edible_leaf' as const, label: 'Edible leaf' },
    { key: 'flowers' as const, label: 'Flowers' },
];

function filtersEqual(a: PlantFilters, b: PlantFilters) {
    return (
        a.type === b.type &&
        a.watering === b.watering &&
        a.sunlight === b.sunlight &&
        a.care_level === b.care_level &&
        a.growth_rate === b.growth_rate &&
        a.cycle === b.cycle &&
        a.edible_fruit === b.edible_fruit &&
        a.edible_leaf === b.edible_leaf &&
        a.flowers === b.flowers
    );
}

function activeFilters(filters: PlantFilters): PlantFilters | undefined {
    const entries = Object.entries(filters).filter(([, value]) => value !== undefined && value !== '');
    return entries.length ? Object.fromEntries(entries) : undefined;
}

function FilterFields({
    filters,
    filterOptions,
    selectClassName,
    onUpdateFilter,
    onToggleBoolFilter,
}: {
    filters: PlantFilters;
    filterOptions: PlantFilterOptions;
    selectClassName: string;
    onUpdateFilter: <K extends keyof PlantFilters>(key: K, value: PlantFilters[K]) => void;
    onToggleBoolFilter: (key: 'edible_fruit' | 'edible_leaf' | 'flowers') => void;
}) {
    return (
        <>
            <div className="grid grid-cols-1 @[300px]:grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-main/60 font-mono">Type</span>
                    <select
                        value={filters.type ?? ''}
                        onChange={(e) => onUpdateFilter('type', e.target.value || undefined)}
                        className={selectClassName}
                    >
                        <option value="">Any</option>
                        {filterOptions.type.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-main/60 font-mono">Watering</span>
                    <select
                        value={filters.watering ?? ''}
                        onChange={(e) => onUpdateFilter('watering', e.target.value || undefined)}
                        className={selectClassName}
                    >
                        <option value="">Any</option>
                        {filterOptions.watering.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-main/60 font-mono">Sunlight</span>
                    <select
                        value={filters.sunlight ?? ''}
                        onChange={(e) => onUpdateFilter('sunlight', e.target.value || undefined)}
                        className={selectClassName}
                    >
                        <option value="">Any</option>
                        {filterOptions.sunlight.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-main/60 font-mono">Care level</span>
                    <select
                        value={filters.care_level ?? ''}
                        onChange={(e) => onUpdateFilter('care_level', e.target.value || undefined)}
                        className={selectClassName}
                    >
                        <option value="">Any</option>
                        {filterOptions.care_level.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-main/60 font-mono">Growth rate</span>
                    <select
                        value={filters.growth_rate ?? ''}
                        onChange={(e) => onUpdateFilter('growth_rate', e.target.value || undefined)}
                        className={selectClassName}
                    >
                        <option value="">Any</option>
                        {filterOptions.growth_rate.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-main/60 font-mono">Cycle</span>
                    <select
                        value={filters.cycle ?? ''}
                        onChange={(e) => onUpdateFilter('cycle', e.target.value || undefined)}
                        className={selectClassName}
                    >
                        <option value="">Any</option>
                        {filterOptions.cycle.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="flex flex-wrap gap-2">
                {BOOL_FILTER_OPTIONS.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onToggleBoolFilter(key)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                            filters[key]
                                ? 'border-leaf-green text-leaf-green bg-code-bg'
                                : 'border-border-main/40 text-text-main/70 hover:border-leaf-green/60'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </>
    );
}

export default function PlantLibrary() {
    const [search, setSearch] = useState('');
    const [submittedSearch, setSubmittedSearch] = useState('');
    const [filters, setFilters] = useState<PlantFilters>(EMPTY_FILTERS);
    const [submittedFilters, setSubmittedFilters] = useState<PlantFilters>(EMPTY_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [pageInput, setPageInput] = useState('1');
    const [popoverPosition, setPopoverPosition] = useState<{
        top: number;
        left: number;
        width: number;
        maxHeight: number;
    } | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const appliedFilters = activeFilters(submittedFilters);

    const { data: filterOptions } = useQuery({
        queryKey: ['plants', 'filter-options'],
        queryFn: fetchFilterOptions,
        staleTime: 1000 * 60 * 10,
    });

    const { data, isLoading, isError } = useQuery({
<<<<<<< HEAD
        queryKey: submittedSearch ? ['plants', 'search', submittedSearch, page] : ['plants', 'list', page],
        queryFn: () => (submittedSearch ? searchPlants(submittedSearch, page, 20) : fetchPlants(page, 20)),
=======
        queryKey: submittedSearch
            ? ['plants', 'search', submittedSearch, appliedFilters, page]
            : ['plants', 'list', appliedFilters, page],
        queryFn: () =>
            submittedSearch
                ? searchPlants(submittedSearch, page, 20, appliedFilters)
                : fetchPlants(page, 20, appliedFilters),
>>>>>>> f6f4a947966de92ee7d6d708b5891d5905c2b01f
    });

    const goToPage = (newPage: number) => {
        setPage(newPage);
        setPageInput(String(newPage));
    };

    const closeFilters = () => {
        setShowFilters(false);
        setFilters(submittedFilters);
    };

    const toggleFilters = () => {
        if (showFilters) {
            closeFilters();
            return;
        }

        setFilters(submittedFilters);
        if (triggerRef.current) {
            setPopoverPosition(getPopoverPosition(triggerRef.current));
        }
        setShowFilters(true);
    };

    const applyFilters = () => {
        setSubmittedFilters(filters);
        goToPage(1);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters(EMPTY_FILTERS);
        setSubmittedFilters(EMPTY_FILTERS);
        goToPage(1);
    };

    const hasActiveFilters = Boolean(appliedFilters);
    const hasPendingFilters = !filtersEqual(filters, submittedFilters);
    const canApplyFilters = hasPendingFilters || hasActiveFilters;

    const handleFilterSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (canApplyFilters) {
            applyFilters();
        }
    };

    useEffect(() => {
        if (!showFilters) return;

        const dismissFilters = () => {
            setShowFilters(false);
            setFilters(submittedFilters);
        };

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) {
                return;
            }
            dismissFilters();
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                dismissFilters();
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showFilters, submittedFilters]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSubmittedSearch(search);
            goToPage(1);
        }
    };

    const updateFilter = <K extends keyof PlantFilters>(key: K, value: PlantFilters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const toggleBoolFilter = (key: 'edible_fruit' | 'edible_leaf' | 'flowers') => {
        setFilters((prev) => ({
            ...prev,
            [key]: prev[key] === true ? undefined : true,
        }));
    };

    const selectClassName =
        'w-full bg-code-bg border border-border-main rounded-lg px-2 py-1.5 text-xs text-text-header focus:outline-none focus:border-leaf-green transition-colors';

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

            <div className="flex items-center justify-between gap-2">
                <button
                    ref={triggerRef}
                    type="button"
                    aria-expanded={showFilters}
                    aria-haspopup="dialog"
                    onClick={toggleFilters}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        showFilters || hasActiveFilters
                            ? 'border-leaf-green text-leaf-green bg-code-bg/60'
                            : 'border-border-main text-text-main/70 hover:text-text-header hover:border-leaf-green/60'
                    }`}
                >
                    Filters{hasActiveFilters ? ' •' : ''}
                </button>

                {showFilters &&
                    filterOptions &&
                    createPortal(
                        <div
                            ref={popoverRef}
                            role="dialog"
                            aria-label="Filter plants"
                            style={{
                                position: 'fixed',
                                top: popoverPosition?.top ?? 0,
                                left: popoverPosition?.left ?? 0,
                                width: popoverPosition?.width ?? POPOVER_MAX_WIDTH,
                                visibility: popoverPosition ? 'visible' : 'hidden',
                                zIndex: 100,
                            }}
                            className="@container font-sans"
                        >
                            <form
                                onSubmit={handleFilterSubmit}
                                onKeyDown={(event) => {
                                    if (event.key !== 'Enter' || !canApplyFilters) return;
                                    const target = event.target as HTMLElement;
                                    if (
                                        target.tagName === 'BUTTON' &&
                                        (target as HTMLButtonElement).type === 'button'
                                    ) {
                                        return;
                                    }
                                    event.preventDefault();
                                    applyFilters();
                                }}
                                style={{ maxHeight: popoverPosition?.maxHeight ?? 512 }}
                                className="bg-bg-main border border-border-main rounded-xl shadow-lg shadow-black/20 p-3 flex flex-col gap-3 overflow-y-auto"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-text-header">Filter plants</span>
                                    <button
                                        type="button"
                                        onClick={closeFilters}
                                        className="text-text-main/60 hover:text-text-header transition-colors cursor-pointer text-sm leading-none"
                                        aria-label="Close filters"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <FilterFields
                                    filters={filters}
                                    filterOptions={filterOptions}
                                    selectClassName={selectClassName}
                                    onUpdateFilter={updateFilter}
                                    onToggleBoolFilter={toggleBoolFilter}
                                />

                                <div className="flex items-center gap-2 pt-1 border-t border-border-main/40">
                                    <button
                                        type="submit"
                                        disabled={!canApplyFilters}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-leaf-green/20 text-leaf-green border border-leaf-green/40 hover:bg-leaf-green/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Apply filters
                                    </button>
                                    {(hasActiveFilters || activeFilters(filters)) && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="text-xs text-text-main/60 hover:text-accent transition-colors cursor-pointer"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>,
                        document.body,
                    )}

                {hasActiveFilters && !showFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs text-text-main/60 hover:text-accent transition-colors cursor-pointer"
                    >
                        Clear filters
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
<<<<<<< HEAD
=======
                    </div>
                )}
                {!isLoading && !isError && data?.data.length === 0 && (
                    <div className="text-text-main/60 text-sm col-span-full italic pl-1">
                        No plants match your search and filters.
>>>>>>> f6f4a947966de92ee7d6d708b5891d5905c2b01f
                    </div>
                )}
                {data?.data.map((plant: Plant) => (
                    <PlantCard key={plant.perenual_id} plant={plant} />
                ))}
            </div>

<<<<<<< HEAD
            {data && (
=======
            {data && data.meta.total_pages > 0 && (
>>>>>>> f6f4a947966de92ee7d6d708b5891d5905c2b01f
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
