import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Button, Card, Text } from 'react-native-paper';
import { useOrder } from './order-store';

export type Recipe = {
  id: string; name: string; category: string; area?: string; image: string;
  instructions?: string; ingredients?: string[];
};

export const COLORS = { ink: '#332B25', muted: '#82776E', paper: '#FAF7F2', accent: '#B55436', green: '#667B50' };

export function Page({ title, children }: PropsWithChildren<{ title: string }>) {
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <Text variant="headlineMedium" style={styles.title}>{title}</Text>{children}
  </ScrollView>;
}

export function NavBar() {
  const { items } = useOrder();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return <View style={styles.nav}>
    <Link href="/home" asChild><Button compact>Home</Button></Link>
    <Link href="/search" asChild><Button compact>Discover</Button></Link>
    <Link href="/cart" asChild><Button compact>Cart{cartCount ? ` (${cartCount})` : ''}</Button></Link>
    <Link href="/favorites" asChild><Button compact>Favorites</Button></Link>
    <Link href="/profile" asChild><Button compact>Profile</Button></Link>
  </View>;
}

export function RecipeCard({ recipe, saved = false, onSave }: { recipe: Recipe; saved?: boolean; onSave?: () => void }) {
  const { add } = useOrder();
  return <Card style={styles.card} onPress={() => router.push({ pathname: '/details', params: { id: recipe.id } })}>
    {!!recipe.image && <Card.Cover source={{ uri: recipe.image }} style={styles.cover} />}
    <Card.Content style={styles.cardContent}>
      <Text variant="titleMedium" style={{ color: COLORS.ink }}>{recipe.name}</Text>
      <Text variant="bodySmall" style={{ color: COLORS.muted }}>{recipe.area || recipe.category}</Text>
    </Card.Content>
    <Card.Actions style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <Button mode="contained-tonal" icon="cart-plus" onPress={() => add(recipe)}>Add to cart</Button>
      {onSave && <Button onPress={onSave}>{saved ? 'Remove saved' : 'Save recipe'}</Button>}
    </Card.Actions>
  </Card>;
}

export const styles = StyleSheet.create({
  page: { padding: 20, paddingTop: 26, paddingBottom: 100, gap: 14, backgroundColor: COLORS.paper, flexGrow: 1 },
  title: { color: COLORS.ink, fontWeight: '700', marginBottom: 4 },
  card: { marginBottom: 4, overflow: 'hidden', backgroundColor: 'white' },
  cover: { height: 190 }, cardContent: { paddingTop: 14, gap: 4 },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 8, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white', borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
});
