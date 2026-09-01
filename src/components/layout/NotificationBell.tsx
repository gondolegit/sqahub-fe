import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, UserPlus, CheckCircle2, AlertTriangle, Inbox, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate } from '@/lib/utils';
import {
    useNotifications,
    useUnreadNotificationCount,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
} from '@/hooks/useNotifications';
import type { Notification, NotificationType } from '@/types/index';

const ICONS_BY_TYPE: Record<NotificationType, React.ElementType> = {
    PROJECT_MEMBER_ADDED: UserPlus,
    TEST_RUN_FINALIZED: CheckCircle2,
    DEPLOY_NOT_READY: AlertTriangle,
    BUG_ASSIGNED: Bug,
};

const ICON_COLOR_BY_TYPE: Record<NotificationType, string> = {
    PROJECT_MEMBER_ADDED: 'text-blue-500',
    TEST_RUN_FINALIZED: 'text-emerald-500',
    DEPLOY_NOT_READY: 'text-destructive',
    BUG_ASSIGNED: 'text-orange-500',
};

const NotificationBell: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const { data: unreadCount = 0 } = useUnreadNotificationCount();
    const { data: page, isLoading, isError } = useNotifications(0, 20);
    const markAsRead = useMarkNotificationAsRead();
    const markAllAsRead = useMarkAllNotificationsAsRead();

    const notifications = page?.content ?? [];

    const handleClickNotification = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead.mutate(notification.id);
        }
        setOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={t('notifications.openLabel')}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] leading-none rounded-full"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <span className="text-sm font-semibold">{t('notifications.title')}</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => markAllAsRead.mutate()}
                            disabled={markAllAsRead.isPending}
                        >
                            <CheckCheck className="mr-1 h-3.5 w-3.5" />
                            {t('notifications.markAllAsRead')}
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-96">
                    {isLoading ? (
                        <div className="p-3 space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-3 w-3/4" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <p className="p-4 text-sm text-center text-destructive">{t('notifications.loadError')}</p>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                            <Inbox className="h-8 w-8" />
                            <p className="text-sm">{t('notifications.empty')}</p>
                        </div>
                    ) : (
                        <ul>
                            {notifications.map((notification) => {
                                const Icon = ICONS_BY_TYPE[notification.type] ?? Bell;
                                return (
                                    <li key={notification.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleClickNotification(notification)}
                                            className={cn(
                                                'w-full flex gap-2.5 px-3 py-2.5 text-left border-b last:border-b-0 hover:bg-accent transition-colors',
                                                !notification.isRead && 'bg-primary/5',
                                            )}
                                        >
                                            <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', ICON_COLOR_BY_TYPE[notification.type] ?? 'text-muted-foreground')} />
                                            <div className="min-w-0 flex-1">
                                                <p className={cn('text-sm truncate', !notification.isRead && 'font-semibold')}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {formatDate(notification.createdAt, true)}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <span className="h-2 w-2 mt-1.5 rounded-full bg-primary shrink-0" />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
