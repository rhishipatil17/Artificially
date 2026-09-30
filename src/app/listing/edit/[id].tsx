import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { ListingForm } from '../../../components/ListingForm';
import { colors, EmptyState } from '../../../components/ui';
import { useAuth } from '../../../lib/auth-context';
import { getListing, updateListing } from '../../../lib/listings';
import type { Listing } from '../../../types/models';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);

  useEffect(() => {
    getListing(id).then(setListing, () => setListing(null));
  }, [id]);

  if (listing === undefined) return <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />;
  if (!listing || listing.ownerId !== user?.uid) {
    return <EmptyState icon="lock-closed-outline" title="You can only edit your own listings." />;
  }

  const { title, category, description, area, city, address, phone, email, website, pricing, timings, extraFields } = listing;
  return (
    <ListingForm
      initial={{ title, category, description, area, city, address, phone, email, website, pricing, timings, extraFields }}
      submitLabel="Save changes"
      onSubmit={async (input) => {
        await updateListing(id, input);
        router.back();
      }}
    />
  );
}
