'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { fileToBase64 } from "@/lib/utils";
import { TopBar, MainBody, CenteredContent, BottomNav } from "@/components/ui/";
import FieldRow from "@/components/edit-profile/FieldRow";
import PhotoUploader from "@/components/edit-profile/PhotoUploader";
import RoommateCard from "@/components/edit-profile/RoommateCard";
import AddInfoButton from "@/components/edit-profile/AddInfoButton";
import { type ListerProfileDraft, type RoommateDraft } from "@/types/lister-edit";

const inputClasses =
  "w-full rounded-2xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] px-4 py-3 text-base font-medium text-[color:var(--color-primary-900)] placeholder:text-[color:var(--muted-foreground)]";

const defaultRoommate: RoommateDraft = {
  name: "",
  sleepingHabits: "In Fluctuation",
  gender: "Prefer not to say",
  pronouns: "Prefer not to say",
  interests: [],
  majorMinor: "",
};

export default function Page(): React.ReactElement {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [draft, setDraft] = useState<ListerProfileDraft>({
    bio: "",
    availableFrom: null,
    availableTo: null,
    rentPlusUtilities: null,
    roommatesCount: 1,
    bathrooms: null,
    roommates: [{ ...defaultRoommate }],
    photos: Array<File | string | null>(5).fill(null),
    city: null,
    state: null,
  });

  const setPhotos = (photos: (File | string | null)[]) => setDraft((prev) => ({ ...prev, photos }));
  const setAvailableFrom = (value: string) => setDraft((prev) => ({ ...prev, availableFrom: value }));
  const setAvailableTo = (value: string) => setDraft((prev) => ({ ...prev, availableTo: value }));
  const setRent = (value: string) => {
    if (!value) { setDraft((prev) => ({ ...prev, rentPlusUtilities: null })); return; }
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) setDraft((prev) => ({ ...prev, rentPlusUtilities: parsed }));
  };
  const setRoommatesCount = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    const nextCount = Math.max(1, parsed);
    setDraft((prev) => {
      const roommates = [...prev.roommates];
      if (nextCount > roommates.length) roommates.push(...Array.from({ length: nextCount - roommates.length }, () => ({ ...defaultRoommate })));
      else if (nextCount < roommates.length) roommates.splice(nextCount);
      return { ...prev, roommatesCount: nextCount, roommates };
    });
  };
  const setBathrooms = (value: string) => {
    if (!value) { setDraft((prev) => ({ ...prev, bathrooms: null })); return; }
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) setDraft((prev) => ({ ...prev, bathrooms: Math.max(0, parsed) }));
  };
  const updateRoommate = (index: number, next: RoommateDraft) =>
    setDraft((prev) => {
      const roommates = [...prev.roommates];
      roommates[index] = next;
      return { ...prev, roommates };
    });
  const addRoommate = () =>
    setDraft((prev) => ({
      ...prev,
      roommates: [...prev.roommates, { ...defaultRoommate }],
      roommatesCount: prev.roommatesCount + 1,
    }));
  const removeRoommate = (index: number) =>
    setDraft((prev) => {
      if (prev.roommates.length <= 1) return prev;
      const roommates = prev.roommates.filter((_, i) => i !== index);
      return { ...prev, roommates, roommatesCount: roommates.length };
    });
  // Fetch Listing
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      const token = (session as any)?.accessToken;
      if (!token) return;
      try {
        const listing = await apiClient.listings.getMyListing(token);
        setDraft(prev => ({
          ...prev,
          bio: listing.bio || '',
          rentPlusUtilities: listing.pricePerMonth ? Number(listing.pricePerMonth) : null,
          availableFrom: listing.availableFrom || null,
          availableTo: listing.availableTo || null,
          // map roommates
          roommates: (listing.roommates && listing.roommates.length > 0)
            ? listing.roommates.map(r => ({
              name: r.name || '',
              sleepingHabits: r.sleepingHabits as any || 'In Fluctuation',
              gender: r.gender as any || 'Prefer not to say',
              pronouns: r.pronouns as any || 'Prefer not to say',
              interests: r.interests || [],
              majorMinor: r.major || '',
              photo: r.photo_url || null,
            }))
            : [{ ...defaultRoommate }],
          roommatesCount: (listing.roommates?.length) || 1,

          photos: (listing.photos && listing.photos.length > 0)
            ? [...listing.photos, ...Array(5 - listing.photos.length).fill(null)].slice(0, 5)
            : Array(5).fill(null),

          city: listing.city || null,
          state: listing.state || null,

          // City/State? The Edit form actually doesn't include them in the UI I saw earlier?
          // Wait, I see "Rent + Utilities", "Roommates", "Bio". 
          // I should probably add City/State to the edit form too if they are missing!
          // But I'll stick to what's visually there for now to not break layout assumptions too much.
        }));
      } catch (err) {
        console.error("Failed to load listing", err);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchListing();
  }, [session]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = (session as any)?.accessToken;
    if (!token) {
      alert("You must be logged in.");
      return;
    }

    try {
      const processedPhotos = await Promise.all(
        draft.photos.map(async (p) => {
          if (!p) return null;
          if (typeof p === 'string') return p;
          return await fileToBase64(p);
        })
      );
      const finalPhotos = processedPhotos.filter((p): p is string => typeof p === 'string');

      // Process roommate photos
      const processedRoommates = await Promise.all(
        draft.roommates.map(async (r) => {
          let photoUrl = null;
          if (typeof r.photo === 'string') {
            photoUrl = r.photo;
          } else if (r.photo instanceof File) {
            photoUrl = await fileToBase64(r.photo);
          }
          return { ...r, photoUrl };
        })
      );

      await apiClient.listings.updateMyListing(token, {
        bio: draft.bio,
        status: 'PUBLISHED',
        pricePerMonth: draft.rentPlusUtilities?.toString(),
        availableFrom: draft.availableFrom || null,
        availableTo: draft.availableTo || null,
        city: draft.city,
        state: draft.state,
        photos: finalPhotos,
        roommates: processedRoommates.map(r => ({
          name: r.name,
          // ID? We might lose ID if we don't store it in draft. 
          // That's tricky. If we send without ID, backend might recreate them. 
          // For now, let's accept recreation or add ID to draft.
          // Draft doesn't have ID. Backend will re-create. Ideally we preserve ID.
          sleepingHabits: r.sleepingHabits,
          gender: r.gender,
          pronouns: r.pronouns,
          interests: r.interests,
          major: r.majorMinor,
          photo_url: r.photoUrl
        }))
      });
      alert("Listing saved!");
      router.push('/lister/view-profile');
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save.");
    }
  };

  return (
    <MainBody>
      <TopBar title="Sublease Matcher" />
      <CenteredContent>
        <form onSubmit={handleSubmit} className="flex w-full max-w-[480px] flex-col gap-4">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold text-[color:var(--color-primary-900)]">Edit Profile</h1>
            <p className="text-sm text-[color:var(--color-primary-700)]">Update your listing details before publishing to students.</p>
          </header>
          <PhotoUploader photos={draft.photos} onChange={setPhotos} className="space-y-3" />
          <FieldRow label="Bio" htmlFor="bio">
            <textarea
              id="bio"
              placeholder="Share a short description about yourself."
              value={draft.bio}
              onChange={(event) => setDraft((prev) => ({ ...prev, bio: event.target.value }))}
              className={`${inputClasses} min-h-32 resize-none`}
            />
          </FieldRow>

          <section aria-labelledby="stay-period-title" className="space-y-3">
            <h2 id="stay-period-title" className="text-base font-semibold text-[color:var(--color-primary-900)]">Desired Period of Stay</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldRow label="Available From" htmlFor="available-from">
                <input
                  id="available-from"
                  type="date"
                  value={draft.availableFrom || ""}
                  onChange={(event) => setAvailableFrom(event.target.value)}
                  className={inputClasses}
                />
              </FieldRow>
              <FieldRow label="Available To" htmlFor="available-to">
                <input
                  id="available-to"
                  type="date"
                  value={draft.availableTo || ""}
                  onChange={(event) => setAvailableTo(event.target.value)}
                  className={inputClasses}
                />
              </FieldRow>
            </div>
          </section>

          <section aria-labelledby="one-off-fields-title" className="space-y-4">
            <h2 id="one-off-fields-title" className="text-base font-semibold text-[color:var(--color-primary-900)]">Listing Details</h2>
            <FieldRow label="Rent + utilities" htmlFor="rent">
              <input
                id="rent"
                type="number"
                value={draft.rentPlusUtilities ?? ""}
                onChange={(event) => setRent(event.target.value)}
                placeholder="Enter amount"
                className={inputClasses}
                aria-label="Rent plus utilities"
              />
            </FieldRow>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldRow label="Roommates" htmlFor="roommate-count">
                <input
                  id="roommate-count"
                  type="number"
                  min={1}
                  value={draft.roommatesCount}
                  onChange={(event) => setRoommatesCount(event.target.value)}
                  className={inputClasses}
                  aria-label="Roommate count"
                />
              </FieldRow>
              <FieldRow label="Bathrooms" htmlFor="bathroom-count">
                <input
                  id="bathroom-count"
                  type="number"
                  min={0}
                  value={draft.bathrooms ?? ""}
                  onChange={(event) => setBathrooms(event.target.value)}
                  placeholder="0"
                  className={inputClasses}
                  aria-label="Bathroom count"
                />
              </FieldRow>
            </div>
          </section>

          <section aria-labelledby="roommates-section-title" className="space-y-4">
            <div className="space-y-2">
              <h2 id="roommates-section-title" className="text-base font-semibold text-[color:var(--color-primary-900)]">Roommates</h2>
              <p className="text-sm text-[color:var(--color-primary-700)]">Configure details for each roommate in your listing.</p>
            </div>
            {draft.roommates.map((roommate, index) => (
              <RoommateCard
                key={index}
                index={index}
                value={roommate}
                onChange={(next) => updateRoommate(index, next)}
                onRemove={() => removeRoommate(index)}
                disableRemove={draft.roommates.length === 1}
              />
            ))}
            <AddInfoButton label="Add roommate" onClick={addRoommate} />
          </section>


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
