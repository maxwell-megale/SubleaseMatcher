export type RoommateDraft = {
  name: string;
  sleepingHabits?: "Night Owl" | "Early Bird" | "In Fluctuation";
  gender?: "Male" | "Female" | "Non-Binary" | "Prefer not to say";
  pronouns?: "They/Them" | "He/Him" | "She/Her" | "He/They" | "She/They" | "Prefer not to say";
  interests: string[];
  majorMinor?: string;
  photo?: File | string | null;
};

export type ListerProfileDraft = {
  bio: string;
  availableFrom: string | null;
  availableTo: string | null;
  rentPlusUtilities?: number | null;
  roommatesCount: number;
  bathrooms?: number | null;
  roommates: RoommateDraft[];
  photos: (File | string | null)[];
  city: string | null;
  state: string | null;
};


export const INTEREST_OPTIONS = ["Reading", "Working Out", "Gaming", "Hiking", "Festivals"] as const;
