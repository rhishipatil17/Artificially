export const CATEGORIES = [
  'Music',
  'Study / Tuition',
  'Art',
  'Dance',
  'Sports',
  'Languages',
  'Coding',
  'Yoga & Fitness',
  'Cooking',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Free-form label/value pairs the owner can add, e.g. "Batch size" → "8 students". */
export interface ExtraField {
  label: string;
  value: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  category: Category;
  description: string;
  area: string;
  city: string;
  address: string;
  /** Lower-cased words from area + city, used for area search. */
  locationKeywords: string[];
  phone: string;
  email: string;
  website: string;
  pricing: string;
  timings: string;
  extraFields: ExtraField[];
  ratingSum: number;
  ratingCount: number;
  createdAt: number;
  updatedAt: number;
}

export type ListingInput = Omit<
  Listing,
  'id' | 'ownerId' | 'ownerName' | 'locationKeywords' | 'ratingSum' | 'ratingCount' | 'createdAt' | 'updatedAt'
>;

export interface Review {
  /** The reviewer's uid — each user can leave one review per listing. */
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
  updatedAt: number;
}

export function averageRating(listing: Pick<Listing, 'ratingSum' | 'ratingCount'>): number {
  return listing.ratingCount > 0 ? listing.ratingSum / listing.ratingCount : 0;
}
