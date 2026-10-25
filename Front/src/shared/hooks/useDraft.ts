import { useState, useEffect } from 'react';

interface UseDraftOptions<T> {
    key: string;
    userId: string;
    initialData?: T;
    debounceMs?: number;
}

export const useDraft = <T>({
    key,
    userId,
    initialData,
    debounceMs = 1000
}: UseDraftOptions<T>) => {
    const storageKey = `draft_${key}_${userId}`;
    const [data, setData] = useState<T>(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return initialData;
            }
        }
        return initialData;
    });

    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data) {
                localStorage.setItem(storageKey, JSON.stringify(data));
                setLastSaved(new Date());
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [data, storageKey, debounceMs]);

    const clearDraft = () => {
        localStorage.removeItem(storageKey);
        setData(undefined);
        setLastSaved(null);
    };

    const hasDraft = Boolean(data);

    return {
        data,
        setData,
        clearDraft,
        hasDraft,
        lastSaved
    };
};