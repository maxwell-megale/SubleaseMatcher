'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainBody, Heading, CenteredContent, TopBar } from '@/components/ui';
import FieldRow from '@/components/edit-profile/FieldRow';
import PhotoUploader from '@/components/edit-profile/PhotoUploader';
import { apiClient } from '@/lib/api-client';
import { useSession } from 'next-auth/react';

// Helper to convert File to Base64 with resizing
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // JPEG at 70% quality
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

const inputClasses =
    'w-full rounded-2xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] px-4 py-3 text-base font-medium text-[color:var(--color-primary-900)] placeholder:text-[color:var(--muted-foreground)]';

// Local draft type
type OnboardingDraft = {
    title: string;
    pricePerMonth: string | null;
    city: string;
    state: string;
    availableFrom: string | null;
    availableTo: string | null;
    bio: string; // Listing/Host bio
    photos: (File | string | null)[];
};

export default function ListerOnboardingPage() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [draft, setDraft] = useState<OnboardingDraft>({
        title: '',
        pricePerMonth: null,
        city: '',
        state: '',
        availableFrom: null,
        availableTo: null,
        bio: '',
        photos: Array(5).fill(null),
    });

    const setPhotos = (photos: (File | string | null)[]) =>
        setDraft((prev) => ({ ...prev, photos }));

    const setAvailableFrom = (value: string) =>
        setDraft((prev) => ({ ...prev, availableFrom: value }));

    const setAvailableTo = (value: string) =>
        setDraft((prev) => ({ ...prev, availableTo: value }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Cast session to any to access the custom accessToken property
        const token = (session as any)?.accessToken;
        if (isSubmitting || !token) return;
        setIsSubmitting(true);

        try {
            // Process photos
            const photoPromises = draft.photos
                .filter((p): p is File | string => p !== null)
                .map(async (p) => {
                    if (typeof p === 'string') return p;
                    return await fileToBase64(p);
                });

            const processedPhotos = await Promise.all(photoPromises);

            // Call API
            // We use updateMyListing which handles upsert (PUT /hosts/me/listing)
            await apiClient.listings.updateMyListing(token, {
                title: draft.title,
                pricePerMonth: draft.pricePerMonth || '0',
                city: draft.city,
                state: draft.state,
                availableFrom: draft.availableFrom,
                availableTo: draft.availableTo,
                bio: draft.bio,
                // STATUS CHANGE: We set to DRAFT because we don't collect dates yet.
                // Domain logic likely requires dates for PUBLISHED listings, causing 422.
                status: 'PUBLISHED',
                photos: processedPhotos,
            });

            // Redirect to swipe matcher
            router.push('/lister/swipe-matcher');
        } catch (error) {
            console.error('Onboarding failed', error);
            alert('Failed to create listing. Please try again. ' + (error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MainBody>
            <TopBar />
            <CenteredContent>
                <Heading text="Create Your Listing" />
                <form onSubmit={handleSubmit} className="flex w-full max-w-[480px] flex-col gap-4">
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-[color:var(--color-primary-900)]">Listing Details</h1>
                        <p className="text-sm text-[color:var(--color-primary-700)]">
                            Show off your place to attract great roommates.
                        </p>
                    </header>

                    {/* Photos */}
                    <section className="space-y-2">
                        <label className="text-base font-semibold text-[color:var(--color-primary-900)]">Photos</label>
                        <p className="text-xs text-[color:var(--color-primary-700)]">Upload at least one photo of the place.</p>
                        <PhotoUploader photos={draft.photos} onChange={setPhotos} className="space-y-3" />
                    </section>

                    {/* Location */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <FieldRow label="City" htmlFor="city">
                            <input
                                id="city"
                                placeholder="e.g. Eau Claire"
                                value={draft.city}
                                onChange={(e) => setDraft((p) => ({ ...p, city: e.target.value }))}
                                className={inputClasses}
                            />
                        </FieldRow>
                        <FieldRow label="State" htmlFor="state">
                            <input
                                id="state"
                                placeholder="e.g. WI"
                                maxLength={2}
                                value={draft.state}
                                onChange={(e) => setDraft((p) => ({ ...p, state: e.target.value.toUpperCase() }))}
                                className={inputClasses}
                            />
                        </FieldRow>
                    </div>

                    {/* Title */}
                    <FieldRow label="Listing Title" htmlFor="title">
                        <input
                            id="title"
                            placeholder="e.g. Spacious Room in Downtown..."
                            value={draft.title}
                            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                            className={inputClasses}
                        />
                    </FieldRow>

                    {/* Rent */}
                    <FieldRow label="Monthly Rent ($)" htmlFor="rent">
                        <input
                            id="rent"
                            type="number"
                            min={0}
                            placeholder="e.g. 800"
                            value={draft.pricePerMonth ?? ''}
                            onChange={(e) => setDraft((p) => ({ ...p, pricePerMonth: e.target.value }))}
                            className={inputClasses}
                        />
                    </FieldRow>

                    {/* Availability */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <FieldRow label="Available From" htmlFor="available-from">
                            <input
                                id="available-from"
                                type="date"
                                value={draft.availableFrom || ''}
                                onChange={(e) => setAvailableFrom(e.target.value)}
                                className={inputClasses}
                            />
                        </FieldRow>
                        <FieldRow label="Available To" htmlFor="available-to">
                            <input
                                id="available-to"
                                type="date"
                                value={draft.availableTo || ''}
                                onChange={(e) => setAvailableTo(e.target.value)}
                                className={inputClasses}
                            />
                        </FieldRow>
                    </div>

                    {/* Bio */}
                    <FieldRow label="Host Bio (About You)" htmlFor="bio">
                        <textarea
                            id="bio"
                            placeholder="Tell seekers about yourself and what you're like as a roommate..."
                            value={draft.bio}
                            onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                            className={`${inputClasses} min-h-32 resize-none`}
                        />
                    </FieldRow>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-6 w-full rounded-2xl bg-[color:var(--primary)] py-3 text-base font-semibold text-[color:var(--primary-foreground)] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating Listing...' : 'Start Swiping'}
                    </button>
                </form>
            </CenteredContent>
        </MainBody>
    );
}
