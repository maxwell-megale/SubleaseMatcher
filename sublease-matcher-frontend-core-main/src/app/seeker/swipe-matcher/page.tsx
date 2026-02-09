'use client';

import { useEffect, useState } from 'react';
import { MainBody, TopBar, CenteredContent, BottomNav } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import SwipeListingCard from '@/components/swipe-matcher/SwipeListingCard';
import SwipeControls from '@/components/swipe-matcher/SwipeControls';
import useSwipeDeck from '@/hooks/useSwipeDeck';
import { apiClient, ListingQueueItem } from '@/lib/api-client';
import type { HostListing } from '@/types/profile';

// Map API response to frontend type
const mapListingToHostListing = (item: ListingQueueItem): HostListing => ({
  id: item.id,
  name: item.title || 'Untitled Listing',
  available_from: item.availableFrom,
  available_to: item.availableTo,
  budgetMin: item.pricePerMonth ? parseFloat(item.pricePerMonth) : 0,
  budgetMax: item.pricePerMonth ? parseFloat(item.pricePerMonth) : 0,
  bio: item.bio || '',
  interests: item.interests || [],
  photos: item.photos && item.photos.length > 0 ? item.photos : ['/placeholder-house.jpg'],
  roommates: item.roommates?.map((r) => ({
    name: r.name || 'Roommate',
    photo: r.photo_url,
    sleepingHabits: r.sleepingHabits || '',
    interests: r.interests || [],
    majorMinor: r.major || '',
    gender: r.gender || '',
    pronouns: r.pronouns || '',
  })) || [],
});

const emptyState = (
  <div className="grid h-full place-items-center rounded-[26px] border-2 border-dashed border-slate-300 bg-white/80 text-center text-sm font-medium text-slate-400">
    You have reached the end of your queue.
  </div>
);

const loadingState = (
  <div className="grid h-full place-items-center rounded-[26px] border-2 border-dashed border-slate-300 bg-white/80 text-center text-sm font-medium text-slate-400">
    Loading listings...
  </div>
);

const errorState = (message: string) => (
  <div className="grid h-full place-items-center rounded-[26px] border-2 border-dashed border-red-300 bg-red-50 text-center text-sm font-medium text-red-600">
    Error: {message}
  </div>
);

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SwipeMatcherSeekerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<HostListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch listings from API
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
    if (token && role !== 'SEEKER') {
      update({ role: 'SEEKER' });
    }

    if (!token) {
      setError('No access token found');
      setLoading(false);
      return;
    }

    async function fetchListings() {
      try {
        setLoading(true);
        // Using session token instead of user ID
        const data = await apiClient.swipes.getSeekerQueue(token);
        // Map API response to frontend type
        const mappedListings = data.map(mapListingToHostListing);
        setListings(mappedListings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [session, status, router]);

  const {
    currentProfile: currentListing,
    nextProfile: nextListing,
    expandedIds,
    history,
    handleLike,
    handlePass,
    handleUndo,
    toggleExpand,
  } = useSwipeDeck(listings);

  // Record swipe to backend
  const recordSwipe = async (decision: 'like' | 'pass') => {
    if (!currentListing) return;
    const token = (session as any)?.accessToken;
    if (!token) return;

    try {
      await apiClient.swipes.recordSwipe(token, currentListing.id, decision);
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
      if (event.repeat) return;
      if (event.key === 'a' || event.key === 'A') handlePassWithApi();
      else if (event.key === 'd' || event.key === 'D') handleLikeWithApi();
      else if (event.key === 'z' || event.key === 'Z') handleUndo();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLikeWithApi, handlePassWithApi, handleUndo]);

  const isControlsDisabled = !currentListing && history.length === 0;
  const currentExpanded = currentListing ? expandedIds.has(currentListing.id) : false;

  return (
    <MainBody>
      <TopBar />
      <CenteredContent>
        <div className="flex min-h-[calc(100dvh-120px)] flex-col gap-2">
          <div>
            <Heading text="Match with hosts" />
            <p className="text-center text-sm text-slate-500">
              Review each listing to find the right place for you.
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
                    {nextListing && (
                      <div className="pointer-events-none absolute inset-0 translate-y-3 scale-[0.96] opacity-60 z-0 [&>*]:shadow-none [&>*]:ring-0">
                        <SwipeListingCard
                          listing={nextListing}
                          expanded={expandedIds.has(nextListing.id)}
                          collapseHint={expandedIds.has(nextListing.id)}
                          onExpand={toggleExpand}
                        />
                      </div>
                    )}

                    {currentListing ? (
                      <div className="relative z-10">
                        <SwipeListingCard
                          listing={currentListing}
                          expanded={currentExpanded}
                          collapseHint={currentExpanded}
                          controlsSlot={
                            !currentExpanded ? (
                              <SwipeControls
                                onPass={handlePassWithApi}
                                onUndo={handleUndo}
                                onLike={handleLikeWithApi}
                                disabled={isControlsDisabled}
                                layout="inline"
                                className="flex w-full justify-center gap-6"
                              />
                            ) : null
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
