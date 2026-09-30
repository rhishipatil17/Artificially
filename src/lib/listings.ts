import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';

import type { Category, Listing, ListingInput, Review } from '../types/models';
import { db } from './firebase';

const listingsCol = collection(db, 'listings');
const reviewsCol = (listingId: string) => collection(db, 'listings', listingId, 'reviews');

/** Splits free text into lower-case search tokens ("Koramangala, Bengaluru" → ["koramangala", "bengaluru"]). */
export function tokenize(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((t) => t.length > 1),
    ),
  );
}

function toListing(id: string, data: DocumentData): Listing {
  return { id, ...data } as Listing;
}

export async function createListing(ownerId: string, ownerName: string, input: ListingInput): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(listingsCol, {
    ...input,
    ownerId,
    ownerName,
    locationKeywords: tokenize(`${input.area} ${input.city}`),
    ratingSum: 0,
    ratingCount: 0,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateListing(id: string, input: ListingInput): Promise<void> {
  await updateDoc(doc(db, 'listings', id), {
    ...input,
    locationKeywords: tokenize(`${input.area} ${input.city}`),
    updatedAt: Date.now(),
  });
}

export async function deleteListing(id: string): Promise<void> {
  await deleteDoc(doc(db, 'listings', id));
}

export async function getListing(id: string): Promise<Listing | null> {
  const snap = await getDoc(doc(db, 'listings', id));
  return snap.exists() ? toListing(snap.id, snap.data()) : null;
}

export async function getMyListings(ownerId: string): Promise<Listing[]> {
  const snap = await getDocs(query(listingsCol, where('ownerId', '==', ownerId)));
  return snap.docs.map((d) => toListing(d.id, d.data())).sort((a, b) => b.updatedAt - a.updatedAt);
}

export interface SearchParams {
  location: string;
  category?: Category | null;
  keyword?: string;
}

/**
 * Finds listings in an area. Firestore has no full-text search, so we match the
 * first location word server-side and apply the remaining filters on the client.
 */
export async function searchListings({ location, category, keyword }: SearchParams): Promise<Listing[]> {
  const locationTokens = tokenize(location);
  const constraints: QueryConstraint[] = [];
  if (locationTokens.length > 0) {
    constraints.push(where('locationKeywords', 'array-contains', locationTokens[0]));
  }
  if (category) {
    constraints.push(where('category', '==', category));
  }
  constraints.push(limit(200));

  const snap = await getDocs(query(listingsCol, ...constraints));
  const keywordTokens = tokenize(keyword ?? '');

  return snap.docs
    .map((d) => toListing(d.id, d.data()))
    .filter((l) => locationTokens.every((t) => l.locationKeywords.includes(t)))
    .filter((l) => {
      if (keywordTokens.length === 0) return true;
      const haystack = `${l.title} ${l.description} ${l.category}`.toLowerCase();
      return keywordTokens.every((t) => haystack.includes(t));
    })
    .sort((a, b) => b.ratingCount - a.ratingCount || b.updatedAt - a.updatedAt);
}

export async function getReviews(listingId: string): Promise<Review[]> {
  const snap = await getDocs(query(reviewsCol(listingId), orderBy('updatedAt', 'desc'), limit(100)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review);
}

/** Creates or replaces the current user's review and keeps the listing's rating totals in sync. */
export async function saveReview(
  listingId: string,
  userId: string,
  userName: string,
  rating: number,
  comment: string,
): Promise<void> {
  const listingRef = doc(db, 'listings', listingId);
  const reviewRef = doc(db, 'listings', listingId, 'reviews', userId);

  await runTransaction(db, async (tx) => {
    const [listingSnap, reviewSnap] = await Promise.all([tx.get(listingRef), tx.get(reviewRef)]);
    if (!listingSnap.exists()) throw new Error('This listing no longer exists.');
    const listing = listingSnap.data() as Listing;
    if (listing.ownerId === userId) throw new Error("You can't review your own listing.");

    const now = Date.now();
    const previous = reviewSnap.exists() ? (reviewSnap.data() as Review) : null;
    tx.set(reviewRef, {
      userId,
      userName,
      rating,
      comment,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    });
    tx.update(listingRef, {
      ratingSum: listing.ratingSum - (previous?.rating ?? 0) + rating,
      ratingCount: listing.ratingCount + (previous ? 0 : 1),
    });
  });
}

export async function deleteReview(listingId: string, userId: string): Promise<void> {
  const listingRef = doc(db, 'listings', listingId);
  const reviewRef = doc(db, 'listings', listingId, 'reviews', userId);

  await runTransaction(db, async (tx) => {
    const [listingSnap, reviewSnap] = await Promise.all([tx.get(listingRef), tx.get(reviewRef)]);
    if (!listingSnap.exists() || !reviewSnap.exists()) return;
    const listing = listingSnap.data() as Listing;
    const review = reviewSnap.data() as Review;
    tx.delete(reviewRef);
    tx.update(listingRef, {
      ratingSum: listing.ratingSum - review.rating,
      ratingCount: Math.max(0, listing.ratingCount - 1),
    });
  });
}
