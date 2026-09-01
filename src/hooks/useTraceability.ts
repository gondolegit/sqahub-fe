// src/hooks/useTraceability.ts
import { useQuery } from '@tanstack/react-query';
import API from '@/utils/api';
import type { TraceabilityMatrixResponse } from '@/types/traceability';

// GET /traceability/project/{projectId} — matriks Feature (requirement) -> Test Case -> status
// eksekusi terakhir, dibatasi hanya proyek yang bisa diakses user (ditegakkan backend).
export const useTraceabilityMatrix = (projectId: number | undefined) => {
    return useQuery<TraceabilityMatrixResponse, Error>({
        queryKey: ['traceability', projectId],
        queryFn: async () => {
            const { data } = await API.get(`/traceability/project/${projectId}`);
            return data;
        },
        enabled: !!projectId && projectId > 0,
    });
};
