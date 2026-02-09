import type { ReactNode } from 'react';
import Image from 'next/image';
import Carousel, { Slide } from '@/components/ui/Carousel';
import type { HostListing } from '@/types/profile';
import RoommateMiniCard from './RoommateMiniCard';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

type SwipeListingCardProps = {
  listing: HostListing;
  expanded: boolean;
  collapseHint?: boolean;
  controlsSlot?: ReactNode;
  onExpand: (id: string) => void;
};

export default function SwipeListingCard({
  listing,
  expanded,
  collapseHint = false,
  controlsSlot,
  onExpand,
}: SwipeListingCardProps) {
  const slides: Slide[] = listing.photos.map((photo, index) => {
    // Check if it's already an absolute URL or data URI, or starts with /
    const isAbsolute = photo.startsWith('http') || photo.startsWith('data:') || photo.startsWith('/');
    const normalizedPhoto = isAbsolute ? photo : `/${photo}`;
    return {
      id: index + 1,
      alt: `${listing.name} photo ${index + 1}`,
      bg: '#0f172a',
      src: normalizedPhoto,
    };
  });

  const rentRange = listing.budgetMin === listing.budgetMax
    ? currencyFormatter.format(listing.budgetMin)
    : `${currencyFormatter.format(listing.budgetMin)} - ${currencyFormatter.format(listing.budgetMax)}`;

  // Calculate Area of Study from Roommates
  const uniqueMajors = Array.from(new Set(listing.roommates?.map((r) => r.majorMinor).filter(Boolean))) as string[];
  const areaOfStudy = uniqueMajors.length > 0 ? uniqueMajors.join(", ") : "Not specified";

  return (
    <article className="overflow-hidden rounded-[24px] bg-white shadow-[0_24px_48px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
      <div className="relative h-[360px] pt-4">
        <Carousel slidesData={slides} />
      </div>
      <div className="px-6 py-5">
        <div className="flex w-full items-start gap-2">
          <div className="w-full flex-1">
            <header className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-slate-900">{listing.name}</h2>
              </div>
            </header>
            {!expanded && controlsSlot ? <div className="mt-4">{controlsSlot}</div> : null}

            <dl className="mt-4 grid gap-3 text-sm text-slate-600">
              {(listing.available_from || listing.available_to) && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="font-semibold text-slate-700">Available</dt>
                  <dd>
                    {listing.available_from && listing.available_to
                      ? `${new Date(listing.available_from).toLocaleDateString()} - ${new Date(listing.available_to).toLocaleDateString()}`
                      : listing.available_from
                        ? `From ${new Date(listing.available_from).toLocaleDateString()}`
                        : `Until ${new Date(listing.available_to!).toLocaleDateString()}`}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <dt className="font-semibold text-slate-700">Area of Study</dt>
                <dd className="text-right truncate max-w-[180px]">{areaOfStudy}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="font-semibold text-slate-700">Estimated Rent</dt>
                <dd>{rentRange}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => onExpand(listing.id)}
              aria-expanded={expanded}
              className="mt-4 text-left text-xs font-medium uppercase tracking-[0.18em] text-slate-400 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]"
              aria-label={`${expanded ? 'Collapse' : 'Expand'} listing details for ${listing.name}`}
            >
              {expanded ? 'Tap to collapse' : 'Tap to expand'}
            </button>
            {expanded && (
              <div className="mt-6 space-y-5 text-sm text-slate-600">
                <section>
                  <h3 className="text-base font-semibold text-slate-800">About</h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{listing.bio}</p>
                </section>
                {listing.roommates.length > 0 ? (
                  <section className="space-y-3">
                    <h3 className="text-base font-semibold text-slate-800">Roommates</h3>
                    <div className="space-y-3">
                      {listing.roommates.map((roommate) => (
                        <RoommateMiniCard key={roommate.name} roommate={roommate} />
                      ))}
                    </div>
                  </section>
                ) : null}
                {listing.interests.length > 0 ? (
                  <section>
                    <h3 className="text-base font-semibold text-slate-800">Interests</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {listing.interests.map((interest) => (
                        <li
                          key={interest}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-700"
                        >
                          {interest}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            )}
          </div>
          {collapseHint && expanded && (
            <button
              type="button"
              onClick={() => onExpand(listing.id)}
              aria-label="Collapse details"
              className="ml-auto grid size-8 place-items-center rounded-full focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]"
            >
              <Image src="/down-arrow.svg" alt="" width={60} height={60} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
