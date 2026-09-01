// src/hooks/useGlobalSearch.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import API from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import type { GlobalSearchResponse } from '@/types/index';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

// Debounce input mentah ke DB — hindari satu request per keystroke.
export const useDebouncedValue = <T,>(value: T, delayMs: number = DEBOUNCE_MS): T => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);
    return debounced;
};

// GET /search?q=... — dibatasi hanya proyek yang bisa diakses user (backend yang menegakkan).
export const useGlobalSearch = (query: string) => {
    const { isAuthenticated } = useAuth();
    const trimmed = query.trim();

    return useQuery<GlobalSearchResponse, AxiosError>({
        queryKey: ['globalSearch', trimmed],
        queryFn: async () => {
            const { data } = await API.get('/search', { params: { q: trimmed } });
            return data;
        },
        enabled: isAuthenticated && trimmed.length >= MIN_QUERY_LENGTH,
        placeholderData: (previousData) => previousData,
    });
};
