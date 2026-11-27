import { Alert } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Avatar, Button, Card, Text } from 'react-native-paper';
import { auth } from '../firebase/firebaseConfig';
import { COLORS, NavBar, Page } from '../components/recipe-ui';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const logout = async () => { try { await signOut(auth); router.replace('/login'); } catch (e: any) { Alert.alert('Could not log out', e.message); } };
  return <><Page title="Your profile">
    <Card><Card.Content style={{ alignItems: 'center', gap: 8, padding: 24 }}>
      <Avatar.Text size={76} label={(user?.email?.[0] || 'R').toUpperCase()} style={{ backgroundColor: COLORS.green }} />
      <Text variant="titleLarge">Recipe Genie member</Text><Text>{user?.email || 'You are not signed in'}</Text>
    </Card.Content></Card>
    <Button mode="outlined" onPress={() => router.push('/favorites')}>View saved recipes</Button>
    {user ? <Button mode="contained" onPress={logout}>Log out</Button> : <Button mode="contained" onPress={() => router.push('/login')}>Log in</Button>}
  </Page><NavBar /></>;
}
