import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { CATEGORIES, type Category } from '../types/models';

export const colors = {
  primary: '#4F46E5',
  primaryText: '#FFFFFF',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  danger: '#DC2626',
  star: '#F59E0B',
};

interface ButtonProps {
  title: string;
  onPress(): void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: ComponentProps<typeof Ionicons>['name'];
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, style }: ButtonProps) {
  const filled = variant !== 'secondary';
  const bg = variant === 'danger' ? colors.danger : variant === 'primary' ? colors.primary : 'transparent';
  const fg = filled ? colors.primaryText : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: filled ? bg : colors.primary },
        (pressed || disabled) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 6 }} />}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, props.multiline && styles.multiline, style]}
        {...props}
      />
    </View>
  );
}

export function StarRating({
  value,
  size = 16,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
}) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => {
        const name = value >= n ? 'star' : value >= n - 0.5 ? 'star-half' : 'star-outline';
        const star = <Ionicons name={name} size={size} color={colors.star} />;
        return onChange ? (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={6} accessibilityLabel={`${n} stars`}>
            {star}
          </Pressable>
        ) : (
          <View key={n}>{star}</View>
        );
      })}
    </View>
  );
}

export function CategoryChips({
  value,
  onChange,
  allowNone = true,
}: {
  value: Category | null;
  onChange(value: Category | null): void;
  allowNone?: boolean;
}) {
  const options: (Category | null)[] = allowNone ? [null, ...CATEGORIES] : [...CATEGORIES];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((c) => {
        const selected = c === value;
        return (
          <Pressable
            key={c ?? 'all'}
            onPress={() => onChange(c)}
            style={[styles.chip, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Text style={{ color: selected ? colors.primaryText : colors.text }}>{c ?? 'All'}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function EmptyState({ icon, title, message }: { icon: ComponentProps<typeof Ionicons>['name']; title: string; message?: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={48} color={colors.muted} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
    </View>
  );
}

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  button: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  empty: { alignItems: 'center', padding: 32, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text, textAlign: 'center' },
  emptyMessage: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  error: { color: colors.danger, marginBottom: 12 },
  screen: { flex: 1, backgroundColor: colors.background },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
});
