import { router } from 'expo-router';

import { ListingForm } from '../../components/ListingForm';
import { useAuth } from '../../lib/auth-context';
import { createListing } from '../../lib/listings';

export default function NewListingScreen() {
  const { user } = useAuth();

  return (
    <ListingForm
      submitLabel="Publish listing"
      onSubmit={async (input) => {
        if (!user) return;
        const id = await createListing(user.uid, user.displayName || 'Class owner', input);
        router.replace({ pathname: '/listing/[id]', params: { id } });
      }}
    />
  );
}
