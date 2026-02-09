export type SeekerProfile = {
  id: string;
  name: string;
  age: number;
  school: string;
  budgetMin: number;
  budgetMax: number;
  available_from: string | null;
  available_to: string | null;
  interests: string[];
  bio: string;
  major?: string;
  photos: string[];
};

export type RoommatePublic = {
  name: string;
  photo?: string | null;
  sleepingHabits: string;
  gender?: string;
  pronouns?: string;
  interests: string[];
  majorMinor?: string;
};

export type HostListing = {
  id: string;
  name: string;
  available_from: string | null;
  available_to: string | null;
  budgetMin: number;
  budgetMax: number;
  bio: string;
  interests: string[];
  photos: string[];
  roommates: RoommatePublic[];
};
