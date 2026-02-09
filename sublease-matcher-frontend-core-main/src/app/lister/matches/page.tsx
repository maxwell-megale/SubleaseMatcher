"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { TopBar, MainBody, CenteredContent, Heading, BottomNav, Carousel } from "@/components/ui";
import MatchCard from "@/components/matches/MatchCard";
import { apiClient, Match, SeekerQueueItem } from "@/lib/api-client";

// Helper to prepare slides for Carousel
const prepareCarouselSlides = (photos: string[]) =>
  photos.map((url, index) => ({
    id: index + 1,
    alt: `Profile image ${index + 1}`,
    bg: "white",
    src: url
  }));

export default function MatchesPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      if (!session?.accessToken) return;
      try {
        const data = await apiClient.matches.getMyMatches(session.accessToken);
        console.log("Matches loaded:", data);
        setMatches(data);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, [session]);

  const selectedSeeker = selectedMatch?.target_profile as SeekerQueueItem;

  return (
    <MainBody>
      <TopBar />

      <CenteredContent>
        <Heading text="Matches" />

        <article className="overflow-hidden rounded-[24px] bg-white shadow-[0_24px_48px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
          <div className="grid grid-cols-2 gap-4 m-4 h-[65vh] overflow-y-auto">
            {loading ? (
              <div className="col-span-2 text-center py-10 text-slate-500">Loading matches...</div>
            ) : matches.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-slate-500">No matches yet. Keep swiping!</div>
            ) : (
              matches.map((m) => {
                const profile = m.target_profile as SeekerQueueItem;
                const displayName = profile?.name || "Seeker";

                return (
                  <MatchCard
                    key={m.id}
                    name={displayName}
                    age={0} // MatchCard expects number, we repurpose or hide
                    photoSrc={profile?.photos?.[0] || "/placeholder-avatar.jpg"}
                    onOpen={() => {
                      setSelectedMatch(m);
                      const modal = document.getElementById("profile-modal");
                      if (modal) modal.classList.remove("hidden");
                    }}
                    onGetContact={() => alert(`Contact info for ${profile?.name || "Seeker"} coming soon`)}
                  />
                );
              })
            )}
          </div>
        </article>
      </CenteredContent>


      <div
        id="profile-modal"
        className="hidden fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const modal = document.getElementById("profile-modal");
            if (modal) modal.classList.add("hidden");
            setSelectedMatch(null);
          }
        }}
      >
        <div className="bg-white w-full max-w-[520px] max-h-[90vh] rounded-2xl shadow-md border border-gray-200 relative flex flex-col overflow-hidden">
          {/* Close Button */}
          <button
            onClick={() => {
              const modal = document.getElementById("profile-modal");
              if (modal) modal.classList.add("hidden");
              setSelectedMatch(null);
            }}
            className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all"
          >
            <Image src="/x.svg" alt="Close" width={24} height={24} className="w-5 h-5 text-slate-600" />
          </button>

          {/* Modal Content */}
          {selectedSeeker ? (
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
              {/* Image Header with Carousel */}
              <div className="relative w-full h-[250px] overflow-hidden bg-gray-100">
                <Carousel
                  slidesData={
                    selectedSeeker.photos && selectedSeeker.photos.length > 0
                      ? prepareCarouselSlides(selectedSeeker.photos)
                      : prepareCarouselSlides(["/placeholder-avatar.jpg"])
                  }
                />
              </div>

              <div className="p-6 relative">
                <h2 className="text-3xl font-extrabold text-black mb-2">{selectedSeeker.name || "Seeker"}</h2>

                <div className="text-[color:rgba(0,0,0,.6)] text-base mb-4 space-y-1">
                  <p><span className="font-semibold text-black">Looking for:</span> Room</p>
                  <p><span className="font-semibold text-black">Area of Study:</span> {selectedSeeker.major || "Not set"}</p>
                  <p><span className="font-semibold text-black">Estimated Rent:</span> ${selectedSeeker.budgetMin || 0} - ${selectedSeeker.budgetMax || 0}</p>
                  <p><span className="font-semibold text-black">Available:</span> {selectedSeeker.available_from || "?"} - {selectedSeeker.available_to || "?"}</p>
                </div>

                <div className="my-4 h-[2px] bg-[#dbe8ff]" />

                {/* Bio */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-2 text-black">About Me</h3>
                  <p className="text-[color:rgba(0,0,0,.6)] leading-relaxed">{selectedSeeker.bio || "No bio available."}</p>
                </div>

                {/* Interests */}
                {selectedSeeker.interests && selectedSeeker.interests.length > 0 && (
                  <>
                    <div className="my-4 h-[2px] bg-[#dbe8ff]" />
                    <div className="mb-4">
                      <h3 className="font-bold text-lg mb-2 text-black">Interests</h3>
                      <ul className="flex flex-wrap gap-2">
                        {selectedSeeker.interests.map((interest, idx) => (
                          <li
                            key={idx}
                            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                          >
                            {interest}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                <div className="my-4 h-[2px] bg-[#dbe8ff]" />

              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-10">
              <div className="animate-pulse text-slate-400">Loading details...</div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </MainBody>
  );
}
