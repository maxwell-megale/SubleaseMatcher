'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { fileToBase64 } from '@/lib/utils';
import { MainBody, Heading, CenteredContent, TopBar, BottomNav } from '@/components/ui';
import FieldRow from '@/components/edit-profile/FieldRow';
import PhotoUploader from '@/components/edit-profile/PhotoUploader';
import DropdownBox from '@/components/edit-profile/DropdownBox';
import AddInfoButton from '@/components/edit-profile/AddInfoButton';
// import { TERM_OPTIONS } from '@/types/lister-edit'; // removed

const inputClasses =
  'w-full rounded-2xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] px-4 py-3 text-base font-medium text-[color:var(--color-primary-900)] placeholder:text-[color:var(--muted-foreground)]';

// Local draft type for SEEKER edit
type SeekerProfileDraft = {
  bio: string;
  availableFrom: string | null;
  availableTo: string | null;
  budgetMin: number | null;  // $
  budgetMax: number | null;  // $
  sleepingHabits: 'Early Bird' | 'Normal' | 'Night Owl' | 'In Fluctuation' | null;
  gender: 'Woman' | 'Man' | 'Non-Binary' | 'Prefer not to say' | null;
  pronouns: 'She/Her' | 'He/Him' | 'They/Them' | 'Prefer not to say' | null;
  interests: string[];       // chips
  majorMinor: string;        // Area of Study
  photos: (File | string | null)[]; // 1 headshot + additional (keep 5 like lister UI)
};

const SLEEPING_OPTIONS = ['Early Bird', 'Normal', 'Night Owl', 'In Fluctuation'] as const;
const GENDER_OPTIONS = ['Woman', 'Man', 'Non-Binary', 'Prefer not to say'] as const;
const PRONOUN_OPTIONS = ['She/Her', 'He/Him', 'They/Them', 'Prefer not to say'] as const;

export default function Page(): React.ReactElement {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [draft, setDraft] = useState<SeekerProfileDraft>({
    bio: '',
    availableFrom: null,
    availableTo: null,
    budgetMin: null,
    budgetMax: null,
    sleepingHabits: 'In Fluctuation',
    gender: 'Prefer not to say',
    pronouns: 'Prefer not to say',
    interests: [],
    majorMinor: '',
    photos: Array<File | string | null>(5).fill(null),
  });

  const [interestInput, setInterestInput] = useState('');

  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  // setters
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

  const addInterest = () => {
    const v = interestInput.trim();
    if (!v) return;
    setDraft((p) => ({ ...p, interests: [...p.interests, v] }));
    setInterestInput('');
  };

  const removeInterest = (idx: number) =>
    setDraft((p) => ({ ...p, interests: p.interests.filter((_, i) => i !== idx) }));

  // Fetch Existing Profile
  useEffect(() => {
    const fetchProfile = async () => {
      // Cast session to any to access custom properties
      const token = (session as any)?.accessToken;
      if (!token) return;

      try {
        const profile = await apiClient.seekers.getMyProfile(token);

        // Parse available_from date to Term? 
        // For now, we'll simpler logic or just keep existing DTO values if we had stored them.
        // Actually the backend stores available_from/to. We need to map that BACK to term/year if possible, 
        // or just accept that "Term" UI might be slightly desynced if we don't store it explicitly.
        // The previous user logic simplified mapping TO dates. Mapping FROM dates is harder. 
        // Let's rely on bio/budget/photos largely for now.

        setDraft(prev => ({
          ...prev,
          bio: profile.bio || '',
          budgetMin: profile.budgetMin ? Number(profile.budgetMin) : null,
          budgetMax: profile.budgetMax ? Number(profile.budgetMax) : null,
          interests: profile.interests || [],
          // Since DTO doesn't give us photos properly yet in getMyProfile? 
          // Wait, I think I updated SeekerProfile to have photos?
          // Let's check api-client. Yes, SeekerProfile interface has photos?: string[]
          photos: (profile.photos && profile.photos.length > 0)
            ? [...profile.photos, ...Array(5 - profile.photos.length).fill(null)].slice(0, 5)
            : Array(5).fill(null),

          availableFrom: profile.available_from || null,
          availableTo: profile.available_to || null,
          majorMinor: profile.major || '',
        }));
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session, currentYear]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = (session as any)?.accessToken;
    if (!token) {
      alert("You must be logged in to save.");
      return;
    }

    try {
      // 1. Process photos
      const processedPhotos = await Promise.all(
        draft.photos.map(async (p) => {
          if (p === null) return null;
          if (typeof p === 'string') return p; // already URL/base64
          // import fileToBase64 from utils!
          // Wait, need to import it.
          return await fileToBase64(p);
        })
      );
      const finalPhotos = processedPhotos.filter((p): p is string => typeof p === 'string');

      await apiClient.seekers.updateMyProfile(token, {
        bio: draft.bio,
        budgetMin: draft.budgetMin?.toString(),
        budgetMax: draft.budgetMax?.toString(),
        interests: draft.interests,
        photos: finalPhotos,
        available_from: draft.availableFrom,
        available_to: draft.availableTo,
        major: draft.majorMinor
      });
      alert("Profile saved successfully!");
      router.push('/seeker/view-profile');
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Failed to save profile.");
    }
  };

  return (
    <MainBody>
      <TopBar />
      <CenteredContent>
        <Heading text="Sublease Matcher" />
        <form onSubmit={handleSubmit} className="flex w-full max-w-[480px] flex-col gap-4">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold text-[color:var(--color-primary-900)]">Edit Profile</h1>
            <p className="text-sm text-[color:var(--color-primary-700)]">
              Update your seeker details so hosts can find a great match.
            </p>
          </header>

          {/* Photos */}
          <PhotoUploader photos={draft.photos} onChange={setPhotos} className="space-y-3" />

          {/* Bio */}
          <FieldRow label="Bio" htmlFor="bio">
            <textarea
              id="bio"
              placeholder="Biography..."
              value={draft.bio}
              onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
              className={`${inputClasses} min-h-32 resize-none`}
            />
          </FieldRow>

          {/* Desired Period of Stay */}
          <section aria-labelledby="stay-period-title" className="space-y-3">
            <h2 id="stay-period-title" className="text-base font-semibold text-[color:var(--color-primary-900)]">
              Desired Period of Stay
            </h2>
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

          {/* Personal prefs */}
          <section aria-labelledby="prefs-title" className="space-y-3">
            <h2 id="prefs-title" className="text-base font-semibold text-[color:var(--color-primary-900)]">
              Preferences
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DropdownBox
                id="sleeping"
                label="Sleeping Habits"
                value={draft.sleepingHabits}
                onChange={(v) => setDraft((p) => ({ ...p, sleepingHabits: (v as SeekerProfileDraft['sleepingHabits']) ?? null }))}
                options={SLEEPING_OPTIONS.map((s) => ({ value: s, label: s }))}
                placeholder="Select..."
              />
              <DropdownBox
                id="gender"
                label="Gender"
                value={draft.gender}
                onChange={(v) => setDraft((p) => ({ ...p, gender: (v as SeekerProfileDraft['gender']) ?? null }))}
                options={GENDER_OPTIONS.map((g) => ({ value: g, label: g }))}
                placeholder="Select..."
              />
            </div>

            <DropdownBox
              id="pronouns"
              label="Pronouns"
              value={draft.pronouns}
              onChange={(v) => setDraft((p) => ({ ...p, pronouns: (v as SeekerProfileDraft['pronouns']) ?? null }))}
              options={PRONOUN_OPTIONS.map((p) => ({ value: p, label: p }))}
              placeholder="Select..."
            />

            {/* Interests chips + add */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[color:var(--color-primary-900)]">Interests</label>
              <div className="flex flex-wrap gap-2">
                {draft.interests.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => removeInterest(idx)}
                    className="rounded-xl border-2 border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] px-3 py-1 text-sm font-medium hover:opacity-80"
                    title="Remove"
                  >
                    {tag} ✕
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <input
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  placeholder="Add another interest"
                  className={inputClasses}
                />
                <AddInfoButton label="Add" onClick={addInterest} />
              </div>
            </div>
          </section>

          {/* Area of Study */}
          <FieldRow label="Area of Study" htmlFor="major-minor">
            <input
              id="major-minor"
              placeholder="Major and/or Minor..."
              value={draft.majorMinor}
              onChange={(e) => setDraft((p) => ({ ...p, majorMinor: e.target.value }))}
              className={inputClasses}
            />
          </FieldRow>

          <button
            type="submit"
            className="mt-2 w-full rounded-2xl bg-[color:var(--primary)] py-3 text-base font-semibold text-[color:var(--primary-foreground)]"
          >
            Save profile
          </button>
        </form>
      </CenteredContent>
      <BottomNav />
    </MainBody>
  );
}
