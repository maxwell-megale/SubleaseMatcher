'use client';

import { useCallback, useMemo, useState } from 'react';

export type SwipeDecision = 'like' | 'pass';

type HistoryEntry = {
  id: string;
  decision: SwipeDecision;
};

const getProfile = <T extends { id: string }>(profiles: T[], index: number) =>
  profiles[index] ?? null;

export default function useSwipeDeck<T extends { id: string }>(profiles: T[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const currentProfile = useMemo(
    () => getProfile(profiles, currentIndex),
    [profiles, currentIndex],
  );

  const nextProfile = useMemo(
    () => getProfile(profiles, currentIndex + 1),
    [profiles, currentIndex],
  );

  const resetExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      if (!prev.has(id)) {
        return prev;
      }
      const updated = new Set(prev);
      updated.delete(id);
      return updated;
    });
  }, []);

  const advance = useCallback(
    (decision: SwipeDecision) => {
      const profile = getProfile(profiles, currentIndex);
      if (!profile) {
        return;
      }

      setHistory((prev) => [...prev, { id: profile.id, decision }]);
      resetExpanded(profile.id);
      setCurrentIndex((index) => index + 1);
    },
    [currentIndex, profiles, resetExpanded],
  );

  const handleLike = useCallback(() => {
    advance('like');
  }, [advance]);

  const handlePass = useCallback(() => {
    advance('pass');
  }, [advance]);

  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      if (!prev.length) {
        return prev;
      }

      const nextHistory = prev.slice(0, -1);
      setCurrentIndex((index) => Math.max(index - 1, 0));
      return nextHistory;
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  }, []);

  return {
    currentIndex,
    currentProfile,
    nextProfile,
    expandedIds,
    history,
    handleLike,
    handlePass,
    handleUndo,
    toggleExpand,
  };
}
