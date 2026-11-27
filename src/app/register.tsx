import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Button, Text, TextInput } from 'react-native-paper';
import { auth, db } from '../firebase/firebaseConfig';
import { COLORS } from '../components/recipe-ui';

export default function RegisterScreen() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  const register = async () => {
    if (!email.trim() || password.length < 6) return Alert.alert('Check your details', 'Enter an email and a password with at least 6 characters.');
    setBusy(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'users', result.user.uid), { uid: result.user.uid, email: result.user.email, createdAt: serverTimestamp() });
      router.replace('/home');
    } catch (error: any) { Alert.alert('Could not create account', error.message); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
    <View style={styles.form}><Text variant="headlineMedium" style={styles.title}>Create your account</Text><Text style={styles.sub}>Save recipes and keep your favourites in one place.</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" mode="outlined" style={styles.input} />
      <TextInput label="Password (6+ characters)" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} />
      <Button mode="contained" onPress={register} loading={busy} disabled={busy} style={styles.button}>Create account</Button>
      <Link href="/login" asChild><Button mode="text">Already have an account? Log in</Button></Link>
    </View>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 22, backgroundColor: COLORS.paper }, form: { gap: 12 }, title: { color: COLORS.ink, fontWeight: '700' }, sub: { color: COLORS.muted, marginBottom: 12 }, input: { backgroundColor: 'white' }, button: { marginTop: 8, paddingVertical: 5 } });
