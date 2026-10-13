import React, { useEffect } from 'react';
import { Platform, Text, TouchableOpacity } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { GOOGLE_CONFIG } from '../constants/Config';
export default function GoogleAuthButton(props: { onToken: (token: string) => void; disabled: boolean }) {
  const id = Platform.OS === 'ios' ? GOOGLE_CONFIG.iosClientId : Platform.OS === 'android' ? GOOGLE_CONFIG.androidClientId : GOOGLE_CONFIG.webClientId;
  return id ? <ConfiguredButton {...props} /> : null;
}
function ConfiguredButton({ onToken, disabled }: { onToken: (token: string) => void; disabled: boolean }) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(GOOGLE_CONFIG);
  useEffect(() => { if (response?.type === 'success' && response.params.id_token) onToken(response.params.id_token); }, [response]);
  return <TouchableOpacity disabled={!request || disabled} onPress={() => promptAsync()}><Text style={{ color: 'white', padding: 12 }}>Continue with Google</Text></TouchableOpacity>;
}
