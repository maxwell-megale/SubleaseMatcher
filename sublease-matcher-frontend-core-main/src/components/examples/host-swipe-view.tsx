// Example: Displaying Seeker Profiles in a Swipe Queue
'use client';

import { useEffect, useState } from 'react';
import { apiClient, SeekerQueueItem } from '@/lib/api-client';

export default function HostSwipeView() {
    const [seekers, setSeekers] = useState<SeekerQueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Replace 'user-10' with actual logged-in user ID
    const currentUserId = 'user-10';

    useEffect(() => {
        async function loadSeekerQueue() {
            try {
                setLoading(true);
                const queue = await apiClient.swipes.getHostQueue(currentUserId);
                setSeekers(queue);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load seekers');
            } finally {
                setLoading(false);
            }
        }

        loadSeekerQueue();
    }, [currentUserId]);

    const handleSwipe = async (seekerId: string, decision: 'like' | 'pass') => {
        try {
            await apiClient.swipes.recordSwipe(currentUserId, seekerId, decision);
            // Remove swiped seeker from queue
            setSeekers(prev => prev.filter(s => s.id !== seekerId));
        } catch (err) {
            console.error('Failed to record swipe:', err);
        }
    };

    if (loading) return <div>Loading seekers...</div>;
    if (error) return <div>Error: {error}</div>;
    if (seekers.length === 0) return <div>No more seekers to review!</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Review Seekers</h1>

            {seekers.map(seeker => (
                <div key={seeker.id} className="bg-white shadow-lg rounded-lg p-6 mb-4">
                    <h2 className="text-xl font-semibold mb-2">{seeker.city || 'Location Unknown'}</h2>
                    <p className="text-gray-700 mb-4">{seeker.bio || 'No bio provided'}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Term:</span> {seeker.term} {seeker.termYear}
                        </div>
                        <div>
                            <span className="font-medium">Budget:</span> ${seeker.budgetMin} - ${seeker.budgetMax}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSwipe(seeker.id, 'pass')}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg font-medium"
                        >
                            Pass
                        </button>
                        <button
                            onClick={() => handleSwipe(seeker.id, 'like')}
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
