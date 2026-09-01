// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import API from '@/utils/api';
import type { ProjectDashboard } from '@/types/dashboard';

const DASHBOARD_QUERY_KEY = 'dashboard';

/**
 * Quality Dashboard satu Project — satu panggilan agregat (cakupan test case per fitur,
 * tren pass rate, breakdown status, keputusan deploy terakhir).
 */
export const useProjectDashboard = (projectId: number | undefined) => {
    return useQuery<ProjectDashboard, Error>({
        queryKey: [DASHBOARD_QUERY_KEY, 'project', projectId],
        queryFn: async () => {
            // ENDPOINT: /api/v1/dashboard/project/{projectId}
            const { data } = await API.get(`/dashboard/project/${projectId}`);
            return data;
        },
        enabled: !!projectId && projectId > 0,
    });
};
