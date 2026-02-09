import React, { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type PhotoUploaderProps = {
  photos: (File | string | null)[];
  onChange: (next: (File | string | null)[]) => void;
  maxAdditional?: number;
  className?: string;
};

const EMPTY_TEXT = ["Add primary photo", "Add additional photo 1", "Add additional photo 2", "Add additional photo 3", "Add additional photo 4"];

export default function PhotoUploader({
  photos,
  onChange,
  maxAdditional = 4,
  className,
}: PhotoUploaderProps): React.ReactElement {
  const total = 1 + Math.min(maxAdditional, 4);
  const normalized = useMemo(() => {
    if (photos.length >= total) return photos.slice(0, total);
    return [...photos, ...Array.from({ length: total - photos.length }, () => null)];
  }, [photos, total]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const objectUrls = useRef<Map<number, string>>(new Map());

  const previews = useMemo(() => {
    const result: string[] = [];
    normalized.forEach((item, index) => {
      if (item instanceof File) {
        let url = objectUrls.current.get(index);
        if (!url) {
          url = URL.createObjectURL(item);
          objectUrls.current.set(index, url);
        }
        result[index] = url;
      } else {
        const existing = objectUrls.current.get(index);
        if (existing) {
          URL.revokeObjectURL(existing);
          objectUrls.current.delete(index);
        }
        result[index] = typeof item === "string" ? item : "";
      }
    });
    for (const [index, url] of objectUrls.current.entries()) {
      if (index >= normalized.length) {
        URL.revokeObjectURL(url);
        objectUrls.current.delete(index);
      }
    }
    return result;
  }, [normalized]);

  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
    },
    [],
  );

  const updatePhoto = (index: number, value: File | string | null) => {
    const next = [...normalized];
    const previous = next[index];
    if (previous instanceof File) {
      const existing = objectUrls.current.get(index);
      if (existing) {
        URL.revokeObjectURL(existing);
        objectUrls.current.delete(index);
      }
    }
    next[index] = value;
    onChange(next);
  };

  const handleTileClick = (index: number) => {
    const input = inputRefs.current[index];
    if (!input) return;
    input.value = "";
    input.click();
  };

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) updatePhoto(index, file);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div>
        {renderTile(0, true)}
        {renderInput(0)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {normalized.slice(1).map((_, offset) => {
          const index = offset + 1;
          return (
            <React.Fragment key={index}>
              {renderTile(index, false)}
              {renderInput(index)}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  function renderInput(index: number) {
    return (
      <input
        key={`input-${index}`}
        ref={(node) => {
          inputRefs.current[index] = node;
        }}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => handleFileChange(index, event)}
      />
    );
  }

  function renderTile(index: number, isPrimary: boolean) {
    const value = normalized[index];
    const preview = previews[index];
    const size = isPrimary ? "h-40" : "h-24";
    const emptyLabel = EMPTY_TEXT[index] ?? `Add additional photo ${index}`;

    if (!value) {
      return (
        <button
          type="button"
          onClick={() => handleTileClick(index)}
          className={cn(
            "group relative w-full overflow-hidden rounded-2xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]",
            size,
          )}
          aria-label={emptyLabel}
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-[5px] border-dashed border-[color:var(--color-primary-400)] bg-[color:var(--color-primary-100)] p-4 text-sm font-medium text-[color:var(--color-primary-800)]">
            <Image src="/upload.svg" alt="" width={32} height={32} aria-hidden="true" className="h-8 w-8 shrink-0" />
            <span>Add photo</span>
          </div>
        </button>
      );
    }

    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)]",
          size,
        )}
      >
        <button
          type="button"
          onClick={() => handleTileClick(index)}
          aria-label={`Change photo ${index + 1}`}
          className="absolute inset-0 h-full w-full focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]"
        >
          {preview ? (
            <Image
              src={preview}
              alt={`Selected photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
              unoptimized
            />
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => updatePhoto(index, null)}
          aria-label={`Remove photo ${index + 1}`}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-[color:var(--background)] text-[color:var(--color-primary-900)] shadow-sm focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)]"
        >
          <Image src="/x.svg" alt="" width={20} height={20} aria-hidden="true" />
        </button>
      </div>
    );
  }
}

// <PhotoUploader photos={photos} onChange={setPhotos} />
