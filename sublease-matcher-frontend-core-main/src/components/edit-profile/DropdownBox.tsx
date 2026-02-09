import React, { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type DropdownBoxProps = {
  id?: string; label?: string; placeholder?: string; value: string | null;
  onChange: (value: string) => void; options: Option[];
  size?: "sm" | "md" | "lg"; disabled?: boolean; className?: string;
};

const SIZE_STYLES: Record<NonNullable<DropdownBoxProps["size"]>, string> = { sm: "h-9 px-3 text-sm", md: "h-10 px-4 text-base", lg: "h-11 px-4 text-base" };

export default function DropdownBox({
  id,
  label,
  placeholder = "Select an option",
  value,
  onChange,
  options,
  size = "md",
  disabled,
  className,
}: DropdownBoxProps): React.ReactElement {
  const generatedId = useId();
  const controlId = id ?? `dropdown-${generatedId}`;
  const labelId = label ? `${controlId}-label` : undefined;
  const listboxId = `${controlId}-listbox`;

  const containerRef = useRef<HTMLDivElement>(null),
    buttonRef = useRef<HTMLButtonElement>(null),
    listRef = useRef<HTMLUListElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const displayText =
    selectedIndex >= 0 ? options[selectedIndex]?.label : placeholder;

  const closeDropdown = () => { setIsOpen(false); setActiveIndex(null); buttonRef.current?.focus(); };

  const moveActive = (direction: 1 | -1) => {
    setActiveIndex((current) => {
      const total = options.length;
      if (!total) return null;
      const start = current ?? (selectedIndex >= 0 ? selectedIndex : 0);
      return (start + direction + total) % total;
    });
  };

  const selectByIndex = (index: number | null) => { if (index == null) return; const next = options[index]; if (!next) return; onChange(next.value); closeDropdown(); };

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : options.length ? 0 : null);
    const raf = window.requestAnimationFrame(() => options.length && listRef.current?.focus());
    return () => window.cancelAnimationFrame(raf);
  }, [isOpen, options.length, selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => { if (!containerRef.current?.contains(event.target as Node)) closeDropdown(); };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => (!prev && options.length === 0 ? prev : !prev));
  };

  const handleButtonKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) { if (options.length) setIsOpen(true); }
      else moveActive(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen) selectByIndex(activeIndex ?? selectedIndex);
      else if (options.length) setIsOpen(true);
    }
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "Tab") event.preventDefault();
    else if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); moveActive(event.key === "ArrowDown" ? 1 : -1); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectByIndex(activeIndex); }
    else if (event.key === "Escape") { event.preventDefault(); closeDropdown(); }
  };

  const activeOptionId =
    isOpen && activeIndex != null
      ? `${controlId}-option-${activeIndex}`
      : undefined;

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      {label ? (
        <label id={labelId} htmlFor={controlId} className="text-sm font-semibold leading-5 text-[color:var(--color-primary-900)]">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <button
          type="button"
          ref={buttonRef}
          id={controlId}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-labelledby={labelId ? `${labelId} ${controlId}` : undefined}
          role="combobox"
          disabled={disabled}
          onClick={toggleDropdown}
          onKeyDown={handleButtonKeyDown}
          className={cn(
            "flex w-full items-center justify-between rounded-2xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] font-medium text-[color:var(--color-primary-900)] focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[color:var(--color-primary-200)] disabled:cursor-not-allowed disabled:opacity-60",
            SIZE_STYLES[size],
            className,
          )}
        >
          <span className={cn("truncate text-left", selectedIndex < 0 && "text-[color:var(--muted-foreground)]")}>{displayText}</span>
          <Image src={isOpen ? "/chevron-up-blue.svg" : "/chevron-down-blue.svg"} alt="" width={20} height={20} aria-hidden="true" className="ml-3 h-5 w-5 shrink-0" />
        </button>
        {isOpen ? (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            className="absolute left-0 right-0 z-20 mt-2 max-h-60 overflow-auto rounded-2xl border-[5px] border-[color:var(--color-primary-900)] bg-[color:var(--color-primary-50)] py-2 shadow-lg focus:outline-none"
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${controlId}-option-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  "cursor-pointer px-4 py-3 text-sm font-medium text-[color:var(--color-primary-900)] transition-colors",
                  index === activeIndex && "bg-[color:var(--color-primary-100)]",
                  index === selectedIndex && "bg-[color:var(--color-primary-200)]",
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectByIndex(index)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Example:
 * <DropdownBox
 *   id="term"
 *   label="Term"
 *   options={[{ value: "Fall", label: "Fall" }]}
 *   value={value}
 *   onChange={setValue}
 *   size="md"
 *   placeholder="Select term"
 * />
 */
