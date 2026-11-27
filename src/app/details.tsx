import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Text } from 'react-native-paper';
import { auth } from '../firebase/firebaseConfig';
import { removeFavorite, saveFavorite, getFavorites, getMeal } from '../firebase/recipes';
import { COLORS, NavBar, Page, type Recipe } from '../components/recipe-ui';
import { useOrder } from '../components/order-store';

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState(false); const [busy, setBusy] = useState(false);
  const { add } = useOrder();
  useEffect(() => { if (id) getMeal(String(id)).then(setRecipe).catch((e) => Alert.alert('Recipe unavailable', e.message)); }, [id]);
  useEffect(() => { const user = auth.currentUser; if (user && id) getFavorites(user.uid).then((items) => setSaved(items.some((item) => item.id === String(id)))).catch(() => {}); }, [id]);
  const toggle = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert('Sign in required', 'Log in to save recipes.');
    if (!recipe) return;
    setBusy(true);
    try { if (saved) await removeFavorite(user.uid, recipe.id); else await saveFavorite(user.uid, recipe); setSaved(!saved); }
    catch (e: any) { Alert.alert('Could not update saved recipes', e.message); }
    finally { setBusy(false); }
  };
  return <><Page title="Recipe details">{!recipe ? <ActivityIndicator color={COLORS.accent} /> : <>
    <Card style={{ overflow: 'hidden' }}><Card.Cover source={{ uri: recipe.image }} /><Card.Content style={{ paddingTop: 16 }}>
      <Text variant="headlineSmall" style={{ color: COLORS.ink }}>{recipe.name}</Text><Text>{recipe.area} · {recipe.category}</Text>
    </Card.Content></Card>
    <Button mode="contained" onPress={toggle} loading={busy}>{saved ? 'Remove from saved' : 'Save this recipe'}</Button>
    <Button mode="contained-tonal" onPress={() => { add(recipe); Alert.alert('Added to cart', `${recipe.name} is in your cart.`, [{ text: 'Keep browsing' }, { text: 'View cart', onPress: () => router.push('/cart') }]); }}>Add meal to cart</Button>
    <Button onPress={() => router.push('/ingredients')}>Shop ingredients</Button>
    <Text variant="titleLarge">Ingredients</Text>{(recipe.ingredients || []).map((ingredient) => <Text key={ingredient}>• {ingredient}</Text>)}
    <Text variant="titleLarge">Instructions</Text><Text style={{ lineHeight: 24 }}>{recipe.instructions || 'No instructions provided.'}</Text>
  </>}</Page><NavBar /></>;
}
