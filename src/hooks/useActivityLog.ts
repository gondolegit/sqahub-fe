// src/hooks/useActivityLog.ts
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import API from '@/utils/api';
import type { ActivityLog, Page } from '@/types/index';

export interface PageParams {
    page?: number;
    size?: number;
    sort?: string;
}

// GET /activity-log — ADMIN only, [paginated]
export const useActivityLog = ({ page = 0, size = 20, sort = 'createdAt,desc' }: PageParams = {}) => {
    return useQuery<Page<ActivityLog>, AxiosError>({
        queryKey: ['activityLog', { page, size, sort }],
        queryFn: async () => {
            const { data } = await API.get('/activity-log', { params: { page, size, sort } });
            return data;
        },
        placeholderData: (previousData) => previousData,
    });
};
