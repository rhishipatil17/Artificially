import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, colors, Field, styles } from '../../components/ui';
import { authErrorMessage, useAuth } from '../../lib/auth-context';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email || !password) return setError('Please enter your email and password.');
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Ionicons name="school" size={56} color={colors.primary} />
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 8 }}>ClassFinder</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>Find music, study, art & more classes near you</Text>
          </View>

          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title="Log in" onPress={submit} loading={loading} />

          <View style={[styles.row, { justifyContent: 'center', marginTop: 20 }]}>
            <Text style={{ color: colors.muted }}>New here? </Text>
            <Link href="/register" replace>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Create an account</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
