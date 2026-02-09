import type { ReactNode } from 'react';
import Image from 'next/image';
import Carousel, { Slide } from '@/components/ui/Carousel';
import type { SeekerProfile } from '@/types/profile';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

type SwipeProfileCardProps = {
  profile: SeekerProfile;
  expanded: boolean;
  collapseHint?: boolean;
  onExpand: (id: string) => void;
  controlsSlot?: ReactNode;
};

export default function SwipeProfileCard({
  profile,
  expanded,
  collapseHint = false,
  onExpand,
  controlsSlot,
}: SwipeProfileCardProps) {
  const slides: Slide[] = profile.photos.map((photo, index) => {
    const normalizedPhoto = (photo.startsWith('data:') || photo.startsWith('http') || photo.startsWith('/')) ? photo : `/${photo}`;
    return {
      id: index + 1,
      alt: `${profile.name} photo ${index + 1}`,
      bg: '#0f172a',
      src: normalizedPhoto,
    };
  });


  const availabilityText = profile.available_from && profile.available_to
    ? `${new Date(profile.available_from).toLocaleDateString()} - ${new Date(profile.available_to).toLocaleDateString()}`
    : profile.available_from
      ? `From ${new Date(profile.available_from).toLocaleDateString()}`
      : profile.available_to
        ? `Until ${new Date(profile.available_to).toLocaleDateString()}`
        : 'Not specified';

  return (
    <article className="overflow-hidden rounded-[24px] bg-white shadow-[0_24px_48px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
      <div className="relative h-[360px]">
        <Carousel slidesData={slides} />
      </div>
      <div className="px-6 py-5">
        <div className="flex w-full items-start gap-2">
          <div className="w-full flex-1">
            <header className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {profile.name}{' '}
                  <span className="text-lg font-normal text-slate-500">({profile.age})</span>
                </h2>
              </div>
            </header>
            {!expanded && controlsSlot ? <div className="mt-4">{controlsSlot}</div> : null}

            <dl className="mt-4 grid gap-3 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-2">
                <dt className="font-semibold text-slate-700">Area of Study</dt>
                <dd className="text-right truncate max-w-[180px]">{profile.major || 'Not specified'}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="font-semibold text-slate-700">Budget</dt>
                <dd>{profile.budgetMin === profile.budgetMax
                  ? `${currencyFormatter.format(profile.budgetMin)}/mo`
                  : `${currencyFormatter.format(profile.budgetMin)} - ${currencyFormatter.format(profile.budgetMax)}/mo`}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="font-semibold text-slate-700">Available</dt>
                <dd>{availabilityText}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => onExpand(profile.id)}
              aria-expanded={expanded}
              className="mt-4 text-left text-xs font-medium uppercase tracking-[0.18em] text-slate-400 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]"
              aria-label={`${expanded ? 'Collapse' : 'Expand'} profile details for ${profile.name}`}
            >
              {expanded ? 'Tap to collapse' : 'Tap to expand'}
            </button>
            {expanded && (
              <div className="mt-6 space-y-5 text-sm text-slate-600">
                <section>
                  <h3 className="text-base font-semibold text-slate-800">About</h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{profile.bio}</p>
                </section>
                {profile.interests.length > 0 && (
                  <section>
                    <h3 className="text-base font-semibold text-slate-800">Interests</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <li
                          key={interest}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-700"
                        >
                          {interest}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>
          {collapseHint && expanded && (
            <button
              type="button"
              onClick={() => onExpand(profile.id)}
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
