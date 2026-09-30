import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button, colors, EmptyState, StarRating, styles } from '../../components/ui';
import { useAuth } from '../../lib/auth-context';
import { deleteListing, deleteReview, getListing, getReviews, saveReview } from '../../lib/listings';
import { averageRating, type Listing, type Review } from '../../types/models';

function InfoRow({ icon, label, value }: { icon: ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: 'row', marginBottom: 12, gap: 10 }}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: 15, color: colors.text, marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
}

function ContactButton({ icon, label, url }: { icon: ComponentProps<typeof Ionicons>['name']; label: string; url: string }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url).catch(() => Alert.alert('Could not open', url))}
      style={({ pressed }) => [
        { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10, backgroundColor: '#EEF2FF' },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={{ color: colors.primary, fontWeight: '600', marginTop: 4 }}>{label}</Text>
    </Pressable>
  );
}

const withScheme = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [l, r] = await Promise.all([getListing(id), getReviews(id)]);
      setListing(l);
      setReviews(r);
      const mine = r.find((rev) => rev.userId === user?.uid);
      setRating(mine?.rating ?? 0);
      setComment(mine?.comment ?? '');
    } catch {
      setListing(null);
    }
  }, [id, user?.uid]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (listing === undefined) return <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />;
  if (listing === null) return <EmptyState icon="alert-circle-outline" title="This listing could not be found." />;

  const isOwner = listing.ownerId === user?.uid;
  const myReview = reviews.find((r) => r.userId === user?.uid);
  const avg = averageRating(listing);

  async function submitReview() {
    if (!user) return;
    if (rating < 1) return setReviewError('Tap the stars to choose a rating.');
    setReviewError(null);
    setSavingReview(true);
    try {
      await saveReview(id, user.uid, user.displayName || 'Anonymous', rating, comment.trim());
      await load();
    } catch (e) {
      setReviewError((e as Error).message);
    } finally {
      setSavingReview(false);
    }
  }

  function confirmDeleteReview() {
    Alert.alert('Delete review', 'Remove your review for this class?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          await deleteReview(id, user.uid);
          await load();
        },
      },
    ]);
  }

  function confirmDeleteListing() {
    Alert.alert('Delete listing', 'This permanently removes the listing. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteListing(id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: listing.title }} />

      <View style={styles.card}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' }}>{listing.category}</Text>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 4 }}>{listing.title}</Text>
        <Text style={{ color: colors.muted, marginTop: 2 }}>by {listing.ownerName}</Text>
        <View style={[styles.row, { marginTop: 8, gap: 6 }]}>
          <StarRating value={avg} />
          <Text style={{ color: colors.muted }}>
            {listing.ratingCount > 0
              ? `${avg.toFixed(1)} · ${listing.ratingCount} review${listing.ratingCount === 1 ? '' : 's'}`
              : 'No reviews yet'}
          </Text>
        </View>
        {!!listing.description && <Text style={{ fontSize: 15, color: colors.text, marginTop: 12, lineHeight: 22 }}>{listing.description}</Text>}
      </View>

      {(listing.phone || listing.email || listing.website) && (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          {!!listing.phone && <ContactButton icon="call" label="Call" url={`tel:${listing.phone}`} />}
          {!!listing.phone && (
            <ContactButton icon="logo-whatsapp" label="WhatsApp" url={`https://wa.me/${listing.phone.replace(/[^\d]/g, '')}`} />
          )}
          {!!listing.email && <ContactButton icon="mail" label="Email" url={`mailto:${listing.email}`} />}
          {!!listing.website && <ContactButton icon="globe-outline" label="Website" url={withScheme(listing.website)} />}
        </View>
      )}

      <View style={[styles.card, { marginTop: 12 }]}>
        <InfoRow icon="pricetag-outline" label="PRICING" value={listing.pricing} />
        <InfoRow icon="time-outline" label="TIMINGS" value={listing.timings} />
        <InfoRow icon="location-outline" label="LOCATION" value={[listing.address, listing.area, listing.city].filter(Boolean).join(', ')} />
        <InfoRow icon="call-outline" label="PHONE" value={listing.phone} />
        <InfoRow icon="mail-outline" label="EMAIL" value={listing.email} />
        <InfoRow icon="globe-outline" label="WEBSITE" value={listing.website} />
        {listing.extraFields.map((f, i) => (
          <InfoRow key={i} icon="information-circle-outline" label={f.label.toUpperCase()} value={f.value} />
        ))}
      </View>

      {isOwner && (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Button
            title="Edit"
            icon="create-outline"
            onPress={() => router.push({ pathname: '/listing/edit/[id]', params: { id } })}
            style={{ flex: 1 }}
          />
          <Button title="Delete" icon="trash-outline" variant="danger" onPress={confirmDeleteListing} style={{ flex: 1 }} />
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Reviews</Text>

      {!isOwner && (
        <View style={[styles.card, { marginBottom: 12 }]}>
          <Text style={[styles.label, { marginBottom: 8 }]}>{myReview ? 'Your review' : 'Write a review'}</Text>
          <StarRating value={rating} size={30} onChange={setRating} />
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience with this class (optional)"
            placeholderTextColor={colors.muted}
            multiline
            style={[styles.input, styles.multiline, { marginTop: 12, marginBottom: 12 }]}
          />
          {reviewError && <Text style={styles.error}>{reviewError}</Text>}
          <Button title={myReview ? 'Update review' : 'Post review'} onPress={submitReview} loading={savingReview} />
          {myReview && (
            <Button title="Delete my review" variant="secondary" onPress={confirmDeleteReview} style={{ marginTop: 8 }} />
          )}
        </View>
      )}

      {reviews.length === 0 ? (
        <Text style={{ color: colors.muted }}>No reviews yet.{isOwner ? '' : ' Be the first to review this class!'}</Text>
      ) : (
        reviews.map((r) => (
          <View key={r.id} style={[styles.card, { marginBottom: 10 }]}>
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <Text style={{ fontWeight: '700', color: colors.text }}>
                {r.userName}
                {r.userId === user?.uid ? ' (you)' : ''}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{new Date(r.updatedAt).toLocaleDateString()}</Text>
            </View>
            <View style={{ marginTop: 4 }}>
              <StarRating value={r.rating} size={14} />
            </View>
            {!!r.comment && <Text style={{ color: colors.text, marginTop: 6, lineHeight: 20 }}>{r.comment}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}
