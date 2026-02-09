'use client';


import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import { TopBar, Heading, MainBody, CenteredContent, BottomNav } from '@/components/ui';
import Carousel from '@/components/ui/Carousel';


// --- NEW DATA STRUCTURE ---
// Define the shape of the profile data for better TypeScript adherence
import RoommateMiniCard from '@/components/swipe-matcher/RoommateMiniCard';
import { RoommatePublic } from '@/types/profile';

interface UserProfile {
  name: string;
  imageUrls: string[];
  bio: string;

  // ✅ NEW FIELDS based on the image
  monthlyRentUtilities: string;
  roommateCount: string;
  bathroomCount: string;
  availableFrom: string | null;
  availableTo: string | null;

  roommates: RoommatePublic[];
  interests: string[];
}


// Map the string array of image URLs to the format the Carousel component expects
const prepareCarouselSlides = (urls: string[]) =>
  urls.map((url, index) => ({
    id: index + 1,
    alt: `Profile image ${index + 1}`,
    src: url,
    bg: '#ffffff'
  }));


export default function UserProfileViewPage({ userId }: { userId?: string }) {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Listing Data
  const { data: session } = useSession();
  const fetchUserProfile = useCallback(async () => {
    const token = (session as any)?.accessToken;
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const listing = await apiClient.listings.getMyListing(token);

      const mappedProfile: UserProfile = {
        name: listing.title || "My Listing",
        imageUrls: (listing.photos && listing.photos.length > 0) ? listing.photos : ["/House1.jpg"],
        bio: listing.bio || "No bio.",
        monthlyRentUtilities: `$${listing.pricePerMonth || 0}`,
        roommateCount: `${listing.roommates?.length || 1}`,
        bathroomCount: "1", // Hardcoded fallback or parse description? DTO doesn't have bathrooms field yet!
        availableFrom: listing.availableFrom || null,
        availableTo: listing.availableTo || null,
        interests: listing.interests || [],
        roommates: listing.roommates?.map(r => ({
          name: r.name || "Roommate",
          photo: (r as any).photo_url || null,
          sleepingHabits: r.sleepingHabits || '',
          gender: r.gender || '',
          pronouns: r.pronouns || '',
          interests: r.interests || [],
          majorMinor: r.major || ''
        })) || []
      };
      setProfileData(mappedProfile);
    } catch (e) {
      console.error(e);
      setError("Failed to load listing.");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) fetchUserProfile();
  }, [fetchUserProfile, session]);


  // ------------------------------------------------------------------
  // --- A: Loading and Error States (Unchanged) ---
  // ------------------------------------------------------------------

  if (isLoading) {
    // Page theme: bg-white text-black. Primary color used for loading text.
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <div className="text-xl font-semibold text-[#2C3F6B]">Loading Profile...</div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-red-50">
        <div className="p-4 text-red-700 border border-red-300 rounded-lg">
          Error: {error || "Profile data is empty."}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // --- B: Main UI Structure (Success State) ---
  // ------------------------------------------------------------------

  const slidesData = prepareCarouselSlides(profileData.imageUrls);

  // Calculate Area of Study from Roommates
  const uniqueMajors = Array.from(new Set(profileData.roommates.map((r) => r.majorMinor).filter(Boolean))) as string[];
  const areaOfStudy = uniqueMajors.length > 0 ? uniqueMajors.join(", ") : "Not specified";

  return (
    <MainBody>
      <TopBar />

      <CenteredContent>
        <Heading text="View Profile" />
        <div className="max-w-[520px] w-full mx-auto bg-white rounded-2xl shadow-md border border-gray-200">

          {/* 1. CAROUSEL IMAGE CONTAINER (Unchanged) */}
          <div className="relative w-full h-[250px] overflow-hidden rounded-t-2xl pt-4">
            <Carousel
              slidesData={slidesData}
            />
          </div>

          {/* 2. PROFILE DETAILS */}
          <div className="p-6 relative">
            <h2 className="text-3xl font-extrabold text-black mb-2">{profileData.name}</h2>

            {/* ✅ UPDATED FIELDS HERE */}
            <div className="text-[color:rgba(0,0,0,.6)] text-base mb-4 space-y-2">
              <p><span className="font-semibold text-black">Monthly Rent + Utilities:</span> {profileData.monthlyRentUtilities}</p>
              <p><span className="font-semibold text-black">Roommates:</span> {profileData.roommateCount}</p>
              <p><span className="font-semibold text-black">Bathrooms:</span> {profileData.bathroomCount}</p>
              <p><span className="font-semibold text-black">Area of Study:</span> {areaOfStudy}</p>
              <div className="flex gap-4">
                <p><span className="font-semibold text-black">Available From:</span> {profileData.availableFrom || "-"}</p>
                <p><span className="font-semibold text-black">To:</span> {profileData.availableTo || "-"}</p>
              </div>
            </div>

            <div className="my-4 h-[2px] bg-[#dbe8ff]" />
            {/* Biography */}
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2 text-black">About Me</h3>
              <p className="text-[color:rgba(0,0,0,.6)] leading-relaxed">{profileData.bio}</p>
            </div>

            <div className="my-4 h-[2px] bg-[#dbe8ff]" />

            {/* Roommates Section */}
            {profileData.roommates.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3 text-black">Roommates</h3>
                <div className="space-y-3">
                  {profileData.roommates.map((roommate, idx) => (
                    <RoommateMiniCard key={idx} roommate={roommate} />
                  ))}
                </div>
              </div>
            )}

            {/* Interests of listing */}
            {profileData.interests.length > 0 && (
              <div className="mb-2">
                <p className="font-semibold text-black mb-2">Listing Interests:</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest, index) => (
                    <span key={index} className="bg-white text-black text-sm font-medium px-3 py-1 rounded-full border border-gray-300 shadow-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action button at the bottom */}
            <div className="pt-2">
              <Link href="/lister/edit-profile" className="block w-full text-center rounded-2xl bg-[color:var(--primary)] py-3 text-base font-semibold text-[color:var(--primary-foreground)]">
                EDIT LISTING
              </Link>
            </div>

          </div>
        </div>

      </CenteredContent>

      <BottomNav />
    </MainBody>
  );
}
