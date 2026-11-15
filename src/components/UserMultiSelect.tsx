import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getEmployeesPaginated } from '../api/services';
import type { User } from '../types';
import { Search, X, Check, UserCheck, Loader2 } from 'lucide-react';

interface UserMultiSelectProps {
    selectedUserIds: string[];
    onChange: (ids: string[]) => void;
    error?: string;
}

export const UserMultiSelect: React.FC<UserMultiSelectProps> = ({
    selectedUserIds,
    onChange,
    error,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedUsersCache, setSelectedUsersCache] = useState<Map<string, User>>(new Map());

    const selectedSet = useMemo(() => new Set(selectedUserIds), [selectedUserIds]);
    const abortRef = useRef<AbortController | null>(null);

    // Fetch users with debounce
    const fetchUsers = useCallback(
        async (pageToFetch: number, query: string, isNewSearch: boolean) => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
            abortRef.current = new AbortController();

            setLoading(true);
            try {
                const res = await getEmployeesPaginated(
                    { page: pageToFetch, limit: 10, search: query || undefined },
                    abortRef.current.signal
                );

                if (res.data?.data) {
                    const { items, meta } = res.data.data;
                    setUsers((prev) => (isNewSearch ? items : [...prev, ...items]));
                    setHasMore(meta.hasNext);

                    // Cache user details for rendering selected chips
                    setSelectedUsersCache((prev) => {
                        const updated = new Map(prev);
                        items.forEach((u) => updated.set(u.id, u));
                        return updated;
                    });
                }
            } catch (err: any) {
                if (err.name !== 'CanceledError') {
                    console.error('Failed to fetch employees for select', err);
                }
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchUsers(1, searchTerm, true);
        }, 350);

        return () => clearTimeout(timer);
    }, [searchTerm, fetchUsers]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchUsers(nextPage, searchTerm, false);
    };

    const toggleUser = (id: string) => {
        const next = new Set(selectedSet);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        onChange(Array.from(next));
    };

    const removeUser = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(selectedSet);
        next.delete(id);
        onChange(Array.from(next));
    };

    const handleSelectAllOnPage = () => {
        const currentPageIds = users.map((u) => u.id);
        const allSelected = currentPageIds.every((id) => selectedSet.has(id));
        const next = new Set(selectedSet);

        if (allSelected) {
            currentPageIds.forEach((id) => next.delete(id));
        } else {
            currentPageIds.forEach((id) => next.add(id));
        }
        onChange(Array.from(next));
    };

    const areAllOnPageSelected = users.length > 0 && users.every((u) => selectedSet.has(u.id));

    return (
        <div className="space-y-3">
            {/* Selected Chips Strip */}
            {selectedUserIds.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-surface-50 border border-surface-200 rounded-lg">
                    <div className="w-full flex items-center justify-between text-xs font-medium text-surface-600 mb-1">
                        <span>
                            Selected Team Members ({selectedUserIds.length})
                        </span>
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                            Clear all
                        </button>
                    </div>
                    {selectedUserIds.map((id) => {
                        const user = selectedUsersCache.get(id);
                        const label = user ? user.fullName : `User (${id.slice(0, 6)}...)`;
                        return (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-medium bg-white text-surface-800 border border-surface-200 shadow-sm"
                            >
                                <span className="w-2 h-2 rounded-full bg-orbit-500"></span>
                                {label}
                                <button
                                    type="button"
                                    onClick={(e) => removeUser(id, e)}
                                    aria-label={`Remove ${label}`}
                                    className="p-0.5 hover:bg-surface-100 rounded text-surface-400 hover:text-surface-700"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Search Input & Controls */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search employees by name or email..."
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-surface-200 rounded-lg text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 transition-colors"
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-surface-400 hover:text-surface-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* List Header: Select all on page */}
            {users.length > 0 && (
                <div className="flex items-center justify-between text-xs text-surface-500 px-1">
                    <button
                        type="button"
                        onClick={handleSelectAllOnPage}
                        className="inline-flex items-center gap-1.5 font-medium hover:text-orbit-600 transition-colors"
                    >
                        <span
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                areAllOnPageSelected
                                    ? 'bg-orbit-500 border-orbit-500 text-white'
                                    : 'border-surface-300 bg-white'
                            }`}
                        >
                            {areAllOnPageSelected && <Check className="w-2.5 h-2.5" />}
                        </span>
                        {areAllOnPageSelected ? 'Deselect visible' : 'Select all visible'}
                    </button>
                    <span>Showing {users.length} user(s)</span>
                </div>
            )}

            {/* User Options Box */}
            <div className="border border-surface-200 rounded-lg bg-white max-h-60 overflow-y-auto divide-y divide-surface-100 shadow-sm">
                {users.length === 0 && !loading ? (
                    <div className="p-6 text-center text-xs text-surface-500">
                        No employees found matching &quot;{searchTerm}&quot;.
                    </div>
                ) : (
                    users.map((user) => {
                        const isSelected = selectedSet.has(user.id);
                        return (
                            <div
                                key={user.id}
                                onClick={() => toggleUser(user.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleUser(user.id);
                                    }
                                }}
                                role="checkbox"
                                tabIndex={0}
                                aria-checked={isSelected}
                                className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                                    isSelected ? 'bg-orbit-50/60' : 'hover:bg-surface-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                            isSelected
                                                ? 'bg-orbit-600 border-orbit-600 text-white'
                                                : 'border-surface-300 bg-white'
                                        }`}
                                    >
                                        {isSelected && <Check className="w-3 h-3" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-surface-900">{user.fullName}</p>
                                        <p className="text-xs text-surface-500">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {user.phone ? (
                                        <span className="text-xs font-mono text-surface-500 bg-surface-100 px-2 py-0.5 rounded">
                                            {user.phone}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                            No phone
                                        </span>
                                    )}
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-100 text-surface-700">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}

                {loading && (
                    <div className="p-4 flex items-center justify-center gap-2 text-xs text-surface-500">
                        <Loader2 className="w-4 h-4 animate-spin text-orbit-500" />
                        Loading employees...
                    </div>
                )}
            </div>

            {/* Load More Button */}
            {hasMore && !loading && (
                <button
                    type="button"
                    onClick={handleLoadMore}
                    className="w-full py-2 border border-surface-200 rounded-lg text-xs font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                >
                    Load More Employees
                </button>
            )}

            {error && (
                <p className="text-xs text-red-600 font-medium animate-fade-in flex items-center gap-1">
                    <span>•</span> {error}
                </p>
            )}
        </div>
    );
};
