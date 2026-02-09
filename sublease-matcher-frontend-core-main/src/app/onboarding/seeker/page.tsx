'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainBody, Heading, CenteredContent, TopBar } from '@/components/ui';
import FieldRow from '@/components/edit-profile/FieldRow';
import PhotoUploader from '@/components/edit-profile/PhotoUploader';
// import DropdownBox from '@/components/edit-profile/DropdownBox'; // Removed
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
    bio: string;
    availableFrom: string | null;
    availableTo: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    photos: (File | string | null)[];
};

// const TERM_OPTIONS = ['Fall', 'Spring', 'Summer', 'Academic Year']; // Removed

export default function SeekerOnboardingPage() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [draft, setDraft] = useState<OnboardingDraft>({
        bio: '',
        availableFrom: null,
        availableTo: null,
        budgetMin: null,
        budgetMax: null,
        photos: Array(5).fill(null),
    });

    const setPhotos = (photos: (File | string | null)[]) =>
        setDraft((prev) => ({ ...prev, photos }));

    const setAvailableFrom = (value: string) =>
        setDraft((prev) => ({ ...prev, availableFrom: value }));

    const setAvailableTo = (value: string) =>
        setDraft((prev) => ({ ...prev, availableTo: value }));

    const setBudgetMin = (value: string) => {
        if (!value) return setDraft((p) => ({ ...p, budgetMin: null }));
        const n = Number(value);
        if (!Number.isNaN(n)) setDraft((p) => ({ ...p, budgetMin: Math.max(0, n) }));
    };

    const setBudgetMax = (value: string) => {
        if (!value) return setDraft((p) => ({ ...p, budgetMax: null }));
        const n = Number(value);
        if (!Number.isNaN(n)) setDraft((p) => ({ ...p, budgetMax: Math.max(0, n) }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Cast session to any to access the custom accessToken property
        const token = (session as any)?.accessToken;
        if (isSubmitting || !token) return;
        setIsSubmitting(true);

        try {
            // Process photos: convert Files to Base64 strings
            const photoPromises = draft.photos
                .filter((p): p is File | string => p !== null)
                .map(async (p) => {
                    if (typeof p === 'string') return p;
                    return await fileToBase64(p);
                });

            const processedPhotos = await Promise.all(photoPromises);

            // Call API
            await apiClient.seekers.updateMyProfile(token, {
                bio: draft.bio,
                budgetMin: draft.budgetMin?.toString(),
                budgetMax: draft.budgetMax?.toString(),
                available_from: draft.availableFrom,
                available_to: draft.availableTo,
                photos: processedPhotos,
            });

            // Redirect to swipe matcher
            router.push('/seeker/swipe-matcher');
        } catch (error) {
            console.error('Onboarding failed', error);
            alert('Failed to create profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MainBody>
            <TopBar />
            <CenteredContent>
                <Heading text="Create Your Seeker Profile" />
                <form onSubmit={handleSubmit} className="flex w-full max-w-[480px] flex-col gap-4">
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-[color:var(--color-primary-900)]">Welcome!</h1>
                        <p className="text-sm text-[color:var(--color-primary-700)]">
                            Tell us a bit about yourself to get started.
                        </p>
                    </header>

                    {/* Photos */}
                    <section className="space-y-2">
                        <label className="text-base font-semibold text-[color:var(--color-primary-900)]">Photos</label>
                        <p className="text-xs text-[color:var(--color-primary-700)]">Upload at least one photo.</p>
                        <PhotoUploader photos={draft.photos} onChange={setPhotos} className="space-y-3" />
                    </section>

                    {/* Bio */}
                    <FieldRow label="Bio" htmlFor="bio">
                        <textarea
                            id="bio"
                            placeholder="Tell hosts about yourself (study habits, hobbies, etc.)..."
                            value={draft.bio}
                            onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                            className={`${inputClasses} min-h-32 resize-none`}
                        />
                    </FieldRow>

                    {/* Dates */}
                    <section aria-labelledby="stay-title" className="space-y-3">
                        <h2 id="stay-title" className="text-base font-semibold text-[color:var(--color-primary-900)]">When do you need a place?</h2>
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
                    </section>

                    {/* Budget */}
                    <section aria-labelledby="budget-title" className="space-y-3">
                        <h2 id="budget-title" className="text-base font-semibold text-[color:var(--color-primary-900)]">
                            Budget (per month)
                        </h2>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <FieldRow label="Min" htmlFor="budget-min">
                                <input
                                    id="budget-min"
                                    type="number"
                                    min={0}
                                    value={draft.budgetMin ?? ''}
                                    onChange={(e) => setBudgetMin(e.target.value)}
                                    placeholder="e.g., 600"
                                    className={inputClasses}
                                />
                            </FieldRow>
                            <FieldRow label="Max" htmlFor="budget-max">
                                <input
                                    id="budget-max"
                                    type="number"
                                    min={0}
                                    value={draft.budgetMax ?? ''}
                                    onChange={(e) => setBudgetMax(e.target.value)}
                                    placeholder="e.g., 900"
                                    className={inputClasses}
                                />
                            </FieldRow>
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-6 w-full rounded-2xl bg-[color:var(--primary)] py-3 text-base font-semibold text-[color:var(--primary-foreground)] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating Profile...' : 'Start Matching'}
                    </button>
                </form>
            </CenteredContent>
        </MainBody>
    );
}
