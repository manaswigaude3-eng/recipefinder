import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { Text } from 'react-native-paper';
import { auth } from '../firebase/firebaseConfig';

export default function SplashRoute() {
  useEffect(() => onAuthStateChanged(auth, (user) => router.replace(user ? '/home' : '/login')), []);
  return <View style={styles.container}>
    <Image source={require('../../assets/images/icon.png')} style={styles.icon} />
    <Text variant="headlineMedium" style={styles.title}>Recipe Genie</Text>
    <Text style={styles.sub}>Discover · Cook · Enjoy</Text>
    <ActivityIndicator color="#B55436" style={{ marginTop: 24 }} />
  </View>;
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2' }, icon: { width: 112, height: 112, borderRadius: 28 }, title: { marginTop: 20, color: '#332B25', fontWeight: '700' }, sub: { marginTop: 6, color: '#82776E' } });
