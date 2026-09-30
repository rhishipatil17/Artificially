import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { ListingCard } from '../../components/ListingCard';
import { Button, CategoryChips, colors, EmptyState, Field, styles } from '../../components/ui';
import { searchListings } from '../../lib/listings';
import type { Category, Listing } from '../../types/models';

export default function SearchScreen() {
  const [location, setLocation] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [results, setResults] = useState<Listing[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(nextCategory = category) {
    if (!location.trim()) {
      setError('Enter an area or city to search in.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      setResults(await searchListings({ location, category: nextCategory, keyword }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const header = (
    <View style={{ marginBottom: 12 }}>
      <Field
        label="Area or city"
        value={location}
        onChangeText={setLocation}
        placeholder="e.g. Koramangala or Pune"
        returnKeyType="search"
        onSubmitEditing={() => runSearch()}
      />
      <Field
        label="Keyword (optional)"
        value={keyword}
        onChangeText={setKeyword}
        placeholder="e.g. guitar, maths, watercolour"
        returnKeyType="search"
        onSubmitEditing={() => runSearch()}
      />
      <View style={{ marginBottom: 14 }}>
        <CategoryChips
          value={category}
          onChange={(c) => {
            setCategory(c);
            if (results) runSearch(c);
          }}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Search" icon="search" onPress={() => runSearch()} loading={loading} />
      {results && !loading && (
        <Text style={{ color: colors.muted, marginTop: 16 }}>
          {results.length} {results.length === 1 ? 'class' : 'classes'} found
        </Text>
      )}
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={{ padding: 16 }}
      data={loading ? [] : (results ?? [])}
      keyExtractor={(l) => l.id}
      renderItem={({ item }) => <ListingCard listing={item} />}
      ListHeaderComponent={header}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
        ) : results ? (
          <EmptyState icon="sad-outline" title="No classes found" message="Try a nearby area, a different category, or fewer keywords." />
        ) : (
          <EmptyState icon="compass-outline" title="Discover classes near you" message="Search by your area or city to see music, study, art and other classes." />
        )
      }
    />
  );
}
