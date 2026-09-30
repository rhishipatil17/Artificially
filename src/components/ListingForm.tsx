import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import type { Category, ExtraField, ListingInput } from '../types/models';
import { Button, CategoryChips, colors, Field, styles } from './ui';

const EMPTY: ListingInput = {
  title: '',
  category: 'Music',
  description: '',
  area: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  pricing: '',
  timings: '',
  extraFields: [],
};

interface Props {
  initial?: ListingInput;
  submitLabel: string;
  onSubmit(input: ListingInput): Promise<void>;
}

export function ListingForm({ initial, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState<ListingInput>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ListingInput>(key: K, value: ListingInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setExtra = (index: number, patch: Partial<ExtraField>) =>
    set(
      'extraFields',
      form.extraFields.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    );

  async function submit() {
    const trimmed: ListingInput = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      area: form.area.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      pricing: form.pricing.trim(),
      timings: form.timings.trim(),
      extraFields: form.extraFields
        .map((e) => ({ label: e.label.trim(), value: e.value.trim() }))
        .filter((e) => e.label && e.value),
    };
    if (!trimmed.title) return setError('Please enter a class name.');
    if (!trimmed.area || !trimmed.city) return setError('Please enter the area and city so people nearby can find you.');
    if (!trimmed.phone && !trimmed.email) return setError('Please add at least a phone number or an email.');

    setError(null);
    setSaving(true);
    try {
      await onSubmit(trimmed);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>About the class</Text>
        <Field label="Class name *" value={form.title} onChangeText={(v) => set('title', v)} placeholder="e.g. Guitar lessons for beginners" />
        <Text style={styles.label}>Category *</Text>
        <View style={{ marginBottom: 14 }}>
          <CategoryChips value={form.category} onChange={(c) => c && set('category', c as Category)} allowNone={false} />
        </View>
        <Field
          label="Description"
          value={form.description}
          onChangeText={(v) => set('description', v)}
          placeholder="What will students learn? Who is it for?"
          multiline
        />

        <Text style={styles.sectionTitle}>Location</Text>
        <Field label="Area / Locality *" value={form.area} onChangeText={(v) => set('area', v)} placeholder="e.g. Koramangala" />
        <Field label="City *" value={form.city} onChangeText={(v) => set('city', v)} placeholder="e.g. Bengaluru" />
        <Field label="Full address" value={form.address} onChangeText={(v) => set('address', v)} multiline />

        <Text style={styles.sectionTitle}>Pricing & timings</Text>
        <Field label="Pricing" value={form.pricing} onChangeText={(v) => set('pricing', v)} placeholder="e.g. ₹2,000 / month, first class free" />
        <Field
          label="Timings"
          value={form.timings}
          onChangeText={(v) => set('timings', v)}
          placeholder={'e.g. Mon, Wed, Fri 5–7 PM\nSat 10 AM–1 PM'}
          multiline
        />

        <Text style={styles.sectionTitle}>Contact</Text>
        <Field label="Phone" value={form.phone} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" />
        <Field label="Email" value={form.email} onChangeText={(v) => set('email', v)} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Website / social link" value={form.website} onChangeText={(v) => set('website', v)} autoCapitalize="none" keyboardType="url" />

        <Text style={styles.sectionTitle}>Additional information</Text>
        <Text style={{ color: colors.muted, marginBottom: 10 }}>
          Add anything else students should know — batch size, age group, teacher qualifications, what to bring…
        </Text>
        {form.extraFields.map((extra, i) => (
          <View key={i} style={[styles.card, { marginBottom: 10, paddingBottom: 2 }]}>
            <Pressable
              onPress={() => set('extraFields', form.extraFields.filter((_, j) => j !== i))}
              style={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
              hitSlop={8}
              accessibilityLabel="Remove field"
            >
              <Ionicons name="close-circle" size={22} color={colors.muted} />
            </Pressable>
            <Field label="Label" value={extra.label} onChangeText={(v) => setExtra(i, { label: v })} placeholder="e.g. Age group" />
            <Field label="Details" value={extra.value} onChangeText={(v) => setExtra(i, { value: v })} placeholder="e.g. 8–15 years" multiline />
          </View>
        ))}
        <Button
          title="Add a field"
          icon="add"
          variant="secondary"
          onPress={() => set('extraFields', [...form.extraFields, { label: '', value: '' }])}
          style={{ marginBottom: 24 }}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        <Button title={submitLabel} onPress={submit} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
