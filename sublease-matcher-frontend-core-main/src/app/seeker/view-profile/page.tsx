'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import { TopBar, Heading, MainBody, CenteredContent, BottomNav, Carousel } from '@/components/ui';

// Define the shape of the profile data for better TypeScript adherence
interface UserProfile {
  name: string;
  // Change to an array of image URLs for the carousel
  imageUrls: string[];
  lookingFor: string;
  estimatedRent: string;
  major: string;
  availableFrom: string;
  availableTo: string;
  bio: string;
  interests: string[];
}


// Map the string array of image URLs to the format the Carousel component expects
// Assuming the Carousel from the previous prompt expects an array of objects
const prepareCarouselSlides = (urls: string[]) =>
  urls.map((url, index) => ({
    id: index + 1,
    alt: `Profile image ${index + 1}`,
    bg: "white",
    src: url
  }));


export default function UserProfileViewPage({ userId }: { userId?: string }) {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Profile Data
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
      const profile = await apiClient.seekers.getMyProfile(token);

      const mappedProfile: UserProfile = {
        name: "Me", // API doesn't return name on profile object yet, sadly. Wait, "User" object has name? 
        // Actually, we can just say "My Profile" or use session user name if available.
        // Let's use session name fallback.
        imageUrls: (profile.photos && profile.photos.length > 0) ? profile.photos : ["/profile-placeholder.jpg"],
        lookingFor: "Room", // Hardcoded or derived?
        estimatedRent: `$${profile.budgetMin || 0} - $${profile.budgetMax || 0}`,
        major: profile.major || "Not set",
        availableFrom: profile.available_from || "Not set",
        availableTo: profile.available_to || "Not set",
        bio: profile.bio || "No bio set yet.",
        interests: profile.interests || []
      };
      setProfileData(mappedProfile);
    } catch (e) {
      console.error(e);
      setError("Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) fetchUserProfile();
  }, [fetchUserProfile, session]);


  // ------------------------------------------------------------------
  // --- A: Loading and Error States ---
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

  return (
    <MainBody>
      <TopBar />

      <CenteredContent>
        <Heading text="View Profile" />
        <div className="max-w-[520px] w-full mx-auto bg-white rounded-2xl shadow-md border border-gray-200">

          {/* 1. CAROUSEL IMAGE CONTAINER */}
          <div className="relative w-full h-[250px] overflow-hidden rounded-t-2xl pt-4">
            {/* The new Carousel component replaces the static Image component */}
            <Carousel
              slidesData={slidesData}
            // Assuming the Carousel component handles image display internally
            />
          </div>

          {/* 2. PROFILE DETAILS */}
          <div className="p-6 relative">
            <h2 className="text-3xl font-extrabold text-black mb-2">{profileData.name}</h2>

            <div className="text-[color:rgba(0,0,0,.6)] text-base mb-4 space-y-1">
              <p><span className="font-semibold text-black">Looking for:</span> {profileData.lookingFor}</p>
              <p><span className="font-semibold text-black">Area of Study:</span> {profileData.major}</p>
              <p><span className="font-semibold text-black">Estimated Rent:</span> {profileData.estimatedRent}</p>
              <p><span className="font-semibold text-black">Available:</span> {profileData.availableFrom} - {profileData.availableTo}</p>
            </div>

            <div className="my-4 h-[2px] bg-[#dbe8ff]" />

            {/* Biography */}
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2 text-black">About Me</h3>
              <p className="text-[color:rgba(0,0,0,.6)] leading-relaxed">{profileData.bio}</p>
            </div>

            <div className="my-4 h-[2px] bg-[#dbe8ff]" />

            {/* Interests */}
            <div className="mb-6">
              <p className="font-semibold text-black mb-2">Interests:</p>
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest, index) => (
                  <span key={index} className="bg-gray-100 text-black text-sm font-medium px-3 py-1 rounded-full border border-gray-300">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Action button at the bottom */}
            <div className="pt-2">
              <Link href="/seeker/edit-profile" className="block w-full text-center rounded-2xl bg-[color:var(--primary)] py-3 text-base font-semibold text-[color:var(--primary-foreground)]">
                EDIT PROFILE
              </Link>
            </div>

          </div>
        </div>
      </CenteredContent>
      <BottomNav />
    </MainBody>
  );
}
