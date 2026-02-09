"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { TopBar, SelectionButton, Heading, CenteredContent, MainBody } from '@/components/ui';

export default function Page() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Helper to check profile and redirect
  const checkAndRedirect = async (role: string, token: string) => {
    setIsLoading(true);
    try {
      if (role === "SEEKER") {
        try {
          await apiClient.seekers.getMyProfile(token);
          // If successful, they have a profile -> go to swipe
          router.replace("/seeker/swipe-matcher");
        } catch (e: any) {
          // If 404 or other error, assume onboarding needed
          router.replace("/onboarding/seeker");
        }
      } else if (role === "HOST") {
        try {
          await apiClient.listings.getMyListing(token);
          // If successful (and listing acts as profile) -> go to swipe
          router.replace("/lister/swipe-matcher");
        } catch (e: any) {
          router.replace("/onboarding/lister");
        }
      }
    } finally {
      setIsLoading(false); // Clean up loading state if we didn't navigate (edge case) or just to be safe
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user && !isLoading) {
      const role = (session.user as any).role;
      const token = (session as any).accessToken;
      if (role && token) {
        // We have a role, check where to go
        // Avoid auto-redirecting if we are just "loading"
        void checkAndRedirect(role, token);
      }
    }
  }, [session, status, router]);

  const handleRoleSelect = async (role: 'seeker' | 'host') => {
    setIsLoading(true);
    const token = (session as any)?.accessToken;

    // Optimistically update session role
    await update({ role: role.toUpperCase() });

    // Then check redirect logic manually (don't wait for useEffect to avoid race/flicker)
    if (token) {
      await checkAndRedirect(role.toUpperCase(), token);
    }
  };

  const homeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );

  const personIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );

  if (status === "loading") {
    return (
      <MainBody>
        <TopBar />
        <CenteredContent>
          <div className="text-slate-500">Loading...</div>
        </CenteredContent>
      </MainBody>
    );
  }

  return (
    <MainBody>
      <TopBar />

      <CenteredContent>
        <Heading text="Which best describes you?" />

        <SelectionButton onClick={() => handleRoleSelect('seeker')} icon={personIcon} text="I'm looking for a room"></SelectionButton>

        <SelectionButton onClick={() => handleRoleSelect('host')} icon={homeIcon} text="I have a room to sublease"></SelectionButton>
      </CenteredContent>

    </MainBody>
  );
}
