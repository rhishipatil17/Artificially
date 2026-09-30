import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, Text, View } from 'react-native';

import { Button, colors, styles } from '../../components/ui';
import { useAuth } from '../../lib/auth-context';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  function confirmSignOut() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
        <Ionicons name="person-circle" size={72} color={colors.primary} />
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 8 }}>
          {user?.displayName || 'Your account'}
        </Text>
        <Text style={{ color: colors.muted, marginTop: 2 }}>{user?.email}</Text>
      </View>
      <Button title="Log out" icon="log-out-outline" variant="secondary" onPress={confirmSignOut} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}
