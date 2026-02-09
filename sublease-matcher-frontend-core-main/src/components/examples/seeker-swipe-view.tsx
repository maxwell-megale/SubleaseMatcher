// Example: Displaying Listing Profiles in a Swipe Queue
'use client';

import { useEffect, useState } from 'react';
import { apiClient, ListingQueueItem } from '@/lib/api-client';

export default function SeekerSwipeView() {
    const [listings, setListings] = useState<ListingQueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Replace 'user-1' with actual logged-in user ID
    const currentUserId = 'user-1';

    useEffect(() => {
        async function loadListingQueue() {
            try {
                setLoading(true);
                const queue = await apiClient.swipes.getSeekerQueue(currentUserId);
                setListings(queue);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load listings');
            } finally {
                setLoading(false);
            }
        }

        loadListingQueue();
    }, [currentUserId]);

    const handleSwipe = async (listingId: string, decision: 'like' | 'pass') => {
        try {
            await apiClient.swipes.recordSwipe(currentUserId, listingId, decision);
            // Remove swiped listing from queue
            setListings(prev => prev.filter(l => l.id !== listingId));
        } catch (err) {
            console.error('Failed to record swipe:', err);
        }
    };

    if (loading) return <div>Loading listings...</div>;
    if (error) return <div>Error: {error}</div>;
    if (listings.length === 0) return <div>No more listings to review!</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Find Your Sublease</h1>

            {listings.map(listing => (
                <div key={listing.id} className="bg-white shadow-lg rounded-lg p-6 mb-4">
                    <h2 className="text-xl font-semibold mb-2">{listing.title || 'Untitled Listing'}</h2>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Location:</span> {listing.city}, {listing.state}
                        </div>
                        <div>
                            <span className="font-medium">Price:</span> ${listing.pricePerMonth}/month
                        </div>
                        <div>
                            <span className="font-medium">Status:</span> {listing.status}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSwipe(listing.id, 'pass')}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg font-medium"
                        >
                            Pass
                        </button>
                        <button
                            onClick={() => handleSwipe(listing.id, 'like')}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Like
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
