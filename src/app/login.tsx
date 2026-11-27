import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button, Text, TextInput } from 'react-native-paper';
import { auth } from '../firebase/firebaseConfig';
import { COLORS } from '../components/recipe-ui';

export default function LoginScreen() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  const login = async () => {
    if (!email.trim() || !password) return Alert.alert('Missing details', 'Enter your email and password.');
    setBusy(true);
    try { await signInWithEmailAndPassword(auth, email.trim(), password); router.replace('/home'); }
    catch (error: any) { Alert.alert('Login failed', error.message); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
    <View style={styles.form}><Text variant="headlineMedium" style={styles.title}>Welcome back</Text><Text style={styles.sub}>Sign in to find your next favourite meal.</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" mode="outlined" style={styles.input} />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} />
      <Button mode="contained" onPress={login} loading={busy} disabled={busy} style={styles.button}>Log in</Button>
      <Link href="/register" asChild><Button mode="text">New here? Create an account</Button></Link>
    </View>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 22, backgroundColor: COLORS.paper }, form: { gap: 12 }, title: { color: COLORS.ink, fontWeight: '700' }, sub: { color: COLORS.muted, marginBottom: 12 }, input: { backgroundColor: 'white' }, button: { marginTop: 8, paddingVertical: 5 } });
