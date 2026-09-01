// src/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import API from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification, Page } from '@/types/index';

const NOTIFICATIONS_KEY = 'notifications';
const UNREAD_COUNT_KEY = 'notificationsUnreadCount';

type ApiError = AxiosError<{ message?: string }>;

// GET /notifications — daftar notifikasi milik user yang sedang login, terbaru dulu
export const useNotifications = (page = 0, size = 20) => {
    const { isAuthenticated } = useAuth();
    return useQuery<Page<Notification>, ApiError>({
        queryKey: [NOTIFICATIONS_KEY, { page, size }],
        queryFn: async () => {
            const { data } = await API.get('/notifications', { params: { page, size, sort: 'createdAt,desc' } });
            return data;
        },
        enabled: isAuthenticated,
        placeholderData: (previousData) => previousData,
    });
};

// GET /notifications/unread-count — di-poll berkala agar lonceng notifikasi tetap ter-update
// tanpa perlu WebSocket.
export const useUnreadNotificationCount = () => {
    const { isAuthenticated } = useAuth();
    return useQuery<number, ApiError>({
        queryKey: [UNREAD_COUNT_KEY],
        queryFn: async () => {
            const { data } = await API.get<{ count: number }>('/notifications/unread-count');
            return data.count;
        },
        enabled: isAuthenticated,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
    });
};

// PUT /notifications/{id}/read
export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, number>({
        mutationFn: async (id) => {
            await API.put(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
            queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
        },
    });
};

// PUT /notifications/read-all
export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, void>({
        mutationFn: async () => {
            await API.put('/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
            queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
        },
    });
};
