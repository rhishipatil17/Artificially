import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';

import { ListingCard } from '../../components/ListingCard';
import { Button, colors, EmptyState, styles } from '../../components/ui';
import { useAuth } from '../../lib/auth-context';
import { getMyListings } from '../../lib/listings';
import type { Listing } from '../../types/models';

export default function MyListingsScreen() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setListings(await getMyListings(user.uid));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reload whenever the tab regains focus, e.g. after creating or editing a listing.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={{ padding: 16 }}
      data={listings}
      keyExtractor={(l) => l.id}
      renderItem={({ item }) => <ListingCard listing={item} />}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={[colors.primary]} />}
      ListHeaderComponent={
        <View style={{ marginBottom: 16 }}>
          <Button title="Create a listing" icon="add-circle-outline" onPress={() => router.push('/listing/new')} />
          {error && <Text style={[styles.error, { marginTop: 12 }]}>{error}</Text>}
        </View>
      }
      ListEmptyComponent={
        loading ? null : (
          <EmptyState
            icon="megaphone-outline"
            title="You haven't listed any classes yet"
            message="Teach music, tuition, art or anything else? Create a listing so students in your area can find you."
          />
        )
      }
    />
  );
}
