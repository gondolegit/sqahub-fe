// src/components/layout/GlobalSearchDialog.tsx
//
// Command-palette sederhana: dibuka lewat ikon Search di Header atau shortcut Ctrl/Cmd+K,
// mencari lintas Project/Feature/Test Case/Test Suite Run (dibatasi backend hanya pada proyek
// yang bisa diakses user), lalu navigasi langsung ke halaman terkait saat sebuah hasil diklik.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, FolderKanban, Layers, ClipboardList, ListChecks, Loader2 } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGlobalSearch, useDebouncedValue } from '@/hooks/useGlobalSearch';
import type { GlobalSearchResultItem, SearchResultType } from '@/types/index';

const ICON_BY_TYPE: Record<SearchResultType, React.ElementType> = {
    PROJECT: FolderKanban,
    FEATURE: Layers,
    TEST_CASE: ClipboardList,
    TEST_SUITE: ListChecks,
};

interface GlobalSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const GlobalSearchDialog: React.FC<GlobalSearchDialogProps> = ({ open, onOpenChange }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebouncedValue(query);

    const { data, isFetching } = useGlobalSearch(debouncedQuery);
    const results = data?.results ?? [];

    // Reset query saat dialog ditutup, supaya pencarian berikutnya mulai dari kosong.
    const handleOpenChange = (next: boolean) => {
        onOpenChange(next);
        if (!next) setQuery('');
    };

    const GROUP_ORDER: SearchResultType[] = ['PROJECT', 'FEATURE', 'TEST_CASE', 'TEST_SUITE'];
    const GROUP_LABELS: Record<SearchResultType, string> = {
        PROJECT: t('search.groups.projects'),
        FEATURE: t('search.groups.features'),
        TEST_CASE: t('search.groups.testCases'),
        TEST_SUITE: t('search.groups.testSuites'),
    };
    const groups = GROUP_ORDER
        .map((type) => ({ type, label: GROUP_LABELS[type], items: results.filter((r) => r.type === type) }))
        .filter((g) => g.items.length > 0);

    const handleSelect = (item: GlobalSearchResultItem) => {
        handleOpenChange(false);
        navigate(item.link);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden gap-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>{t('search.title')}</DialogTitle>
                    <DialogDescription>{t('search.description')}</DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2 border-b px-4 py-3">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('search.placeholder')}
                        className="border-0 shadow-none focus-visible:ring-0 px-0 h-8"
                    />
                    {isFetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
                </div>

                <ScrollArea className="max-h-[420px]">
                    {query.trim().length < 2 ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">{t('search.hint')}</p>
                    ) : results.length === 0 && !isFetching ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">{t('search.noResults', { query: query.trim() })}</p>
                    ) : (
                        <div className="py-2">
                            {groups.map((group) => (
                                <div key={group.type} className="mb-1 last:mb-0">
                                    <p className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                                        {group.label}
                                    </p>
                                    {group.items.map((item) => {
                                        const Icon = ICON_BY_TYPE[item.type];
                                        return (
                                            <button
                                                key={`${item.type}-${item.id}`}
                                                type="button"
                                                onClick={() => handleSelect(item)}
                                                className="w-full flex items-start gap-2.5 px-4 py-2 text-left hover:bg-accent transition-colors"
                                            >
                                                <Icon className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {item.projectName}{item.subtitle ? ` • ${item.subtitle}` : ''}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default GlobalSearchDialog;
