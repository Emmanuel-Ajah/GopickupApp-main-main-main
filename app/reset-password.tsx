import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { forgotPassword, resetPassword } from '../services/api';
export default function Recovery() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (reset: boolean) => {
    setBusy(true);
    try {
      const { data } = reset ? await resetPassword({ token, password }) : await forgotPassword({ email });
      if (data.localToken) setToken(data.localToken);
      Alert.alert('Password recovery', data.message);
      if (reset) router.replace('/login');
    } catch (e: any) { Alert.alert('Error', e.response?.data?.message || 'Check your connection.'); }
    finally { setBusy(false); }
  };
  return <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 70 }}>
    <TouchableOpacity onPress={() => router.back()}><Text>Back</Text></TouchableOpacity>
    <Text style={{ fontSize: 28, marginVertical: 24 }}>Reset password</Text>
    {__DEV__ && <Text>Local testing: the recovery code appears here instead of being emailed.</Text>}
    <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ padding: 16 }} />
    <TouchableOpacity disabled={busy} onPress={() => run(false)}><Text style={{ padding: 16, color: '#439D25' }}>Request code</Text></TouchableOpacity>
    <TextInput placeholder="Recovery code" value={token} onChangeText={setToken} autoCapitalize="none" style={{ padding: 16 }} />
    <TextInput placeholder="New password (8+ characters)" value={password} onChangeText={setPassword} secureTextEntry style={{ padding: 16 }} />
    <TouchableOpacity disabled={busy} onPress={() => run(true)}><Text style={{ padding: 16, color: '#439D25' }}>{busy ? 'Please wait…' : 'Save password'}</Text></TouchableOpacity>
  </ScrollView>;
}
