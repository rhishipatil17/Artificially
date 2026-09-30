import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, colors, Field, styles } from '../../components/ui';
import { authErrorMessage, useAuth } from '../../lib/auth-context';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name.trim()) return setError('Please enter your name.');
    if (!email) return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setError(null);
    setLoading(true);
    try {
      await signUp(name, email, password);
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
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 4 }}>Create your account</Text>
          <Text style={{ color: colors.muted, marginBottom: 24 }}>
            Search for classes nearby, leave reviews, or list your own classes.
          </Text>

          <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" />
          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
          <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title="Sign up" onPress={submit} loading={loading} />

          <View style={[styles.row, { justifyContent: 'center', marginTop: 20 }]}>
            <Text style={{ color: colors.muted }}>Already have an account? </Text>
            <Link href="/login" replace>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Log in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
