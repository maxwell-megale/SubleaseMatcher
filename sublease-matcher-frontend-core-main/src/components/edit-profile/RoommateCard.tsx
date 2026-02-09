import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import FieldRow from "@/components/edit-profile/FieldRow";
import DropdownBox from "@/components/edit-profile/DropdownBox";
import { cn } from "@/lib/utils";
import { INTEREST_OPTIONS, type RoommateDraft } from "@/types/lister-edit";
type RoommateCardProps = {
  index: number;
  value: RoommateDraft;
  onChange: (next: RoommateDraft) => void;
  onRemove?: () => void;
  disableRemove?: boolean;
  className?: string;
};

const createOptions = (values: string[]) => values.map((item) => ({ value: item, label: item }));
const sleepingHabitOptions = createOptions(["Night Owl", "Early Bird", "In Fluctuation"]);
const genderOptions = createOptions(["Male", "Female", "Non-Binary", "Prefer not to say"]);
const pronounOptions = createOptions(["They/Them", "He/Him", "She/Her", "He/They", "She/They", "Prefer not to say"]);
type DropdownKey = "sleepingHabits" | "gender" | "pronouns";
const DROPDOWN_CONFIG: Array<{ key: DropdownKey; label: string; placeholder: string; options: { value: string; label: string }[] }> = [
  { key: "sleepingHabits", label: "Sleeping Habits", placeholder: "Select sleeping habit", options: sleepingHabitOptions },
  { key: "gender", label: "Gender", placeholder: "Select gender", options: genderOptions },
  { key: "pronouns", label: "Pronouns", placeholder: "Select pronouns", options: pronounOptions },
];

export default function RoommateCard({
  index,
  value,
  onChange,
  onRemove,
  disableRemove,
  className,
}: RoommateCardProps): React.ReactElement {
  const photo = value.photo ?? null;
  const [filePreview, setFilePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (photo instanceof File) {
      const url = URL.createObjectURL(photo);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setFilePreview("");
    return undefined;
  }, [photo]);

  const updateDraft = <K extends keyof RoommateDraft>(key: K, nextValue: RoommateDraft[K]) => onChange({ ...value, [key]: nextValue });
  const updateDropdown = <K extends DropdownKey>(key: K, next: string) => updateDraft(key, next as RoommateDraft[K]);
  const updatePhoto = (nextPhoto: File | string | null) => updateDraft("photo", nextPhoto);
  const handleTileClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updatePhoto(file);
    }
  };
  const handleRemovePhoto = () => updatePhoto(null);
  const toggleInterest = (interest: string) => {
    const current = value.interests ?? [];
    const next = current.includes(interest)
      ? current.filter((item) => item !== interest)
      : [...current, interest];
    updateDraft("interests", next);
  };
  const handleRemove = () => {
    if (!disableRemove && onRemove) onRemove();
  };
  const previewUrl = typeof photo === "string" ? photo : photo instanceof File ? filePreview : "";
  const photoButtonLabel = `${photo ? "Change" : "Add"} roommate photo ${index + 1}`;

  return (
    <section
      className={cn(
        "space-y-4 rounded-3xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={handleTileClick}
              className="relative flex size-20 items-center justify-center overflow-hidden rounded-2xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]"
              aria-label={photoButtonLabel}
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={`Selected roommate photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-[5px] border-dashed border-[color:var(--color-primary-400)] bg-[color:var(--color-primary-100)] p-2 text-xs font-medium text-[color:var(--color-primary-800)]">
                  <Image src="/upload.svg" alt="" width={24} height={24} aria-hidden="true" className="h-6 w-6" />
                  <span>Photo</span>
                </div>
              )}
            </button>
            {photo ? (
              <button
                type="button"
                onClick={handleRemovePhoto}
                aria-label={`Remove roommate photo ${index + 1}`}
                className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full bg-[color:var(--background)] text-[color:var(--color-primary-900)] shadow-sm focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]"
              >
                <Image src="/x.svg" alt="" width={18} height={18} aria-hidden="true" />
              </button>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[color:var(--color-primary-900)]">Roommate {index + 1}</h3>
            <p className="text-sm text-[color:var(--color-primary-700)]">Tell us about this roommate.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remove roommate ${index + 1}`}
          className={cn("p-0 bg-transparent", disableRemove && "pointer-events-none opacity-40")}
        >
          <Image src="/minus-blue.svg" alt="" width={24} height={24} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <FieldRow label="Name" htmlFor={`roommate-${index}-name`}>
          <input
            id={`roommate-${index}-name`}
            type="text"
            value={value.name ?? ""}
            onChange={(event) => updateDraft("name", event.target.value)}
            placeholder="Full name"
            className="w-full rounded-2xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] px-4 py-3 text-base font-medium text-[color:var(--color-primary-900)] placeholder:text-[color:var(--muted-foreground)] focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]"
          />
        </FieldRow>
        {DROPDOWN_CONFIG.map(({ key, label, placeholder, options }) => (
          <FieldRow key={key} label={label} htmlFor={`roommate-${index}-${key}`}>
            <DropdownBox
              id={`roommate-${index}-${key}`}
              value={value[key] ?? null}
              onChange={(next) => updateDropdown(key, next)}
              options={options}
              placeholder={placeholder}
            />
          </FieldRow>
        ))}
        <FieldRow label="Interests">
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={cn(
                  "rounded-full border-[3px] px-4 py-2 text-sm font-medium focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-[color:var(--color-primary-200)]",
                  value.interests.includes(interest)
                    ? "border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-900)]"
                    : "border-[color:var(--color-primary-300)] bg-[color:var(--background)] text-[color:var(--color-primary-700)]",
                )}
              >
                {interest}
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Major/Minor" htmlFor={`roommate-${index}-major`}>
          <input
            id={`roommate-${index}-major`}
            type="text"
            value={value.majorMinor ?? ""}
            onChange={(event) => updateDraft("majorMinor", event.target.value)}
            placeholder="Add major or minor"
            className="w-full rounded-2xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] px-4 py-3 text-base font-medium text-[color:var(--color-primary-900)] placeholder:text-[color:var(--muted-foreground)] focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]"
          />
        </FieldRow>
      </div>
    </section>
  );
}

// <RoommateCard index={0} value={roommate} onChange={updateRoommate} onRemove={removeRoommate} />
