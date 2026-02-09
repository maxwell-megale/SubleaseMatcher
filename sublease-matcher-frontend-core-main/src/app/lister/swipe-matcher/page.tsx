'use client';

import { useEffect, useState } from 'react';
import { MainBody, TopBar, BottomNav } from '@/components/ui';
import CenteredContent from '@/components/ui/CenteredContent';
import Heading from '@/components/ui/Heading';
import SwipeProfileCard from '@/components/swipe-matcher/SwipeProfileCard';
import SwipeControls from '@/components/swipe-matcher/SwipeControls';
import useSwipeDeck from '@/hooks/useSwipeDeck';
import { apiClient, SeekerQueueItem } from '@/lib/api-client';
import type { SeekerProfile } from '@/types/profile';

// Map API response to frontend type
const mapSeekerQueueToProfile = (item: SeekerQueueItem): SeekerProfile => ({
  id: item.id,
  name: item.name || 'Anonymous User',
  age: 20, // Default age (not yet in API)
  school: item.city || 'Unknown',
  budgetMin: item.budgetMin ? parseFloat(item.budgetMin) : 0,
  budgetMax: item.budgetMax ? parseFloat(item.budgetMax) : 0,
  available_from: item.available_from,
  available_to: item.available_to,
  interests: item.interests || [],
  bio: item.bio || 'No bio provided',
  major: item.major || undefined,
  photos: item.photos && item.photos.length > 0 ? item.photos : ['/placeholder-avatar.jpg'],
});

const emptyState = (
  <div className="grid h-full place-items-center rounded-[26px] border-2 border-dashed border-slate-300 bg-white/80 text-center text-sm font-medium text-slate-400">
    You have reached the end of your queue.
  </div>
);

const loadingState = (
  <div className="grid h-full place-items-center rounded-[26px] border-2 border-dashed border-slate-300 bg-white/80 text-center text-sm font-medium text-slate-400">
    Loading seeker profiles...
  </div>
);

const errorState = (message: string) => (
  <div className="grid h-full place-items-center rounded-[26px] border-2 border-dashed border-red-300 bg-red-50 text-center text-sm font-medium text-red-600">
    Error: {message}
  </div>
);

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SwipeMatcherPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<SeekerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch seekers from API
  const { update } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
      return;
    }

    // Access token from session (extended type)
    const token = (session as any)?.accessToken;
    const role = (session?.user as any)?.role;

    // Force update session role if missing or wrong
    if (token && role !== 'HOST') {
      update({ role: 'HOST' });
    }

    if (!token) {
      setError('No access token found');
      setLoading(false);
      return;
    }

    async function fetchSeekers() {
      try {
        setLoading(true);
        // Using session token instead of user ID
        const data = await apiClient.swipes.getHostQueue(token);
        // Map API response to frontend type
        const mappedProfiles = data.map(mapSeekerQueueToProfile);
        setProfiles(mappedProfiles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load seekers');
      } finally {
        setLoading(false);
      }
    }
    fetchSeekers();
  }, [session, status, router]);

  const {
    currentProfile,
    nextProfile,
    expandedIds,
    history,
    handleLike,
    handlePass,
    handleUndo,
    toggleExpand,
  } = useSwipeDeck(profiles);

  // Record swipe to backend
  const recordSwipe = async (decision: 'like' | 'pass') => {
    if (!currentProfile) return;
    const token = (session as any)?.accessToken;
    if (!token) return;

    try {
      await apiClient.swipes.recordSwipe(token, currentProfile.id, decision);
    } catch (err) {
      console.error('Failed to record swipe:', err);
    }
  };

  const handleLikeWithApi = () => {
    recordSwipe('like');
    handleLike();
  };

  const handlePassWithApi = () => {
    recordSwipe('pass');
    handlePass();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.key === 'a' || event.key === 'A') {
        handlePassWithApi();
      } else if (event.key === 'd' || event.key === 'D') {
        handleLikeWithApi();
      } else if (event.key === 'z' || event.key === 'Z') {
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleLikeWithApi, handlePassWithApi, handleUndo]);

  const isControlsDisabled = !currentProfile && history.length === 0;
  const currentExpanded = currentProfile ? expandedIds.has(currentProfile.id) : false;

  return (
    <MainBody>
      <TopBar />
      <CenteredContent>
        <div className="flex min-h-[calc(100dvh-120px)] flex-col gap-6 pt-2">
          <div>
            <Heading text="Match with seekers" />
            <p className="text-center text-sm text-slate-500">
              Review each profile to find the right match for your listing.
            </p>
          </div>
          <section className="flex-1">
            <div className="relative mx-auto w-full max-w-[480px]">
              <div className="relative h-full min-h-[360px] pb-24">
                {loading ? (
                  loadingState
                ) : error ? (
                  errorState(error)
                ) : (
                  <>
                    {nextProfile && (
                      <div className="pointer-events-none absolute inset-0 translate-y-3 scale-[0.96] opacity-60 z-0 [&>*]:shadow-none [&>*]:ring-0">
                        <SwipeProfileCard
                          profile={nextProfile}
                          expanded={expandedIds.has(nextProfile.id)}
                          collapseHint={expandedIds.has(nextProfile.id)}
                          onExpand={toggleExpand}
                        />
                      </div>
                    )}
                    {currentProfile ? (
                      <div className="relative z-10">
                        <SwipeProfileCard
                          profile={currentProfile}
                          expanded={currentExpanded}
                          collapseHint={currentExpanded}
                          controlsSlot={
                            <SwipeControls
                              onPass={handlePassWithApi}
                              onUndo={handleUndo}
                              onLike={handleLikeWithApi}
                              disabled={isControlsDisabled}
                              layout="inline"
                              className="flex w-full justify-center gap-6"
                            />
                          }
                          onExpand={toggleExpand}
                        />
                      </div>
                    ) : (
                      emptyState
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        </div>

      </CenteredContent>
      <BottomNav />
    </MainBody>
  );
} 
