import Image from 'next/image';
import type { RoommatePublic } from '@/types/profile';

type RoommateMiniCardProps = {
  roommate: RoommatePublic;
};

export default function RoommateMiniCard({ roommate }: RoommateMiniCardProps) {
  const { name, photo, sleepingHabits, gender, pronouns, interests, majorMinor } = roommate;

  return (
    <article className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="relative h-[72px] w-[72px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {photo ? (
          <Image
            src={photo}
            alt={`${name} profile photo`}
            fill
            sizes="72px"
            className="object-cover"
            unoptimized={photo.startsWith('data:')}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-xs font-medium uppercase text-slate-400">
            No photo
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 text-sm text-slate-600">
        <div>
          <p className="text-base font-semibold text-slate-800">{name}</p>
          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            {sleepingHabits && <span>Sleep: {sleepingHabits}</span>}
            {gender ? <span>{gender}</span> : null}
            {pronouns ? <span>Pronouns: {pronouns}</span> : null}
            {majorMinor ? <span>Area of Study: {majorMinor}</span> : null}
          </div>
        </div>
        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-700"
              >
                {interest}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
