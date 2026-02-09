'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

export default function ApiTestPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runTest = async (testFn: () => Promise<any>, testName: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await testFn();
            setResult({ test: testName, data });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">API Integration Test</h1>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                    onClick={() => runTest(() => apiClient.health.check(), 'Health Check')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium"
                >
                    Test Health Check
                </button>

                <button
                    onClick={() => runTest(() => apiClient.seekers.getMyProfile('user-1'), 'Get Seeker Profile')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium"
                >
                    Get Seeker Profile (user-1)
                </button>

                <button
                    onClick={() => runTest(() => apiClient.listings.getMyListing('user-10'), 'Get Host Listing')}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium"
                >
                    Get Host Listing (user-10)
                </button>

                <button
                    onClick={() => runTest(() => apiClient.swipes.getSeekerQueue('user-1'), 'Get Seeker Queue')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-medium"
                >
                    Get Listings Queue
                </button>

                <button
                    onClick={() => runTest(() => apiClient.swipes.getHostQueue('user-10'), 'Get Host Queue')}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-3 rounded-lg font-medium"
                >
                    Get Seekers Queue
                </button>

                <button
                    onClick={() => runTest(() => apiClient.matches.getMyMatches('user-1'), 'Get Matches')}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium"
                >
                    Get Matches (user-1)
                </button>
            </div>

            {loading && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                    <p className="text-yellow-800 font-medium">Loading...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                    <p className="text-red-800 font-medium">Error: {error}</p>
                </div>
            )}

            {result && !loading && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Test: {result.test}</h2>
                    <pre className="bg-white p-4 rounded border overflow-auto max-h-96 text-sm">
                        {JSON.stringify(result.data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
