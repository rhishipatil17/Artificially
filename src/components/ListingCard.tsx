import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { averageRating, type Listing } from '../types/models';
import { colors, StarRating, styles } from './ui';

export function ListingCard({ listing }: { listing: Listing }) {
  const avg = averageRating(listing);
  return (
    <Link href={{ pathname: '/listing/[id]', params: { id: listing.id } }} asChild>
      <Pressable style={({ pressed }) => [styles.card, { marginBottom: 12, opacity: pressed ? 0.8 : 1 }]}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' }}>
          {listing.category}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 4 }}>{listing.title}</Text>

        <View style={[styles.row, { marginTop: 6, gap: 6 }]}>
          <StarRating value={avg} size={14} />
          <Text style={{ color: colors.muted }}>
            {listing.ratingCount > 0 ? `${avg.toFixed(1)} (${listing.ratingCount})` : 'No reviews yet'}
          </Text>
        </View>

        <View style={[styles.row, { marginTop: 8, gap: 4 }]}>
          <Ionicons name="location-outline" size={14} color={colors.muted} />
          <Text style={{ color: colors.muted }} numberOfLines={1}>
            {[listing.area, listing.city].filter(Boolean).join(', ')}
          </Text>
        </View>
        {!!listing.pricing && (
          <View style={[styles.row, { marginTop: 4, gap: 4 }]}>
            <Ionicons name="pricetag-outline" size={14} color={colors.muted} />
            <Text style={{ color: colors.muted }} numberOfLines={1}>
              {listing.pricing}
            </Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}
