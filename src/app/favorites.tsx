import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button, Text } from 'react-native-paper';
import { auth } from '../firebase/firebaseConfig';
import { getFavorites, removeFavorite } from '../firebase/recipes';
import { NavBar, Page, RecipeCard, type Recipe } from '../components/recipe-ui';

export default function FavoritesScreen() {
  const [items, setItems] = useState<Recipe[]>([]);
  useFocusEffect(useCallback(() => { const user = auth.currentUser; if (user) getFavorites(user.uid).then(setItems).catch((e) => Alert.alert('Saved recipes unavailable', e.message)); }, []));
  const remove = async (recipe: Recipe) => { const user = auth.currentUser; if (!user) return; try { await removeFavorite(user.uid, recipe.id); setItems((old) => old.filter((item) => item.id !== recipe.id)); } catch (e: any) { Alert.alert('Could not remove recipe', e.message); } };
  return <><Page title="Saved recipes">{!auth.currentUser ? <Text>Please log in to see your saved recipes.</Text> : items.length ? items.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} saved onSave={() => remove(recipe)} />) : <Text>You have not saved any recipes yet. Open a recipe and tap “Save this recipe”.</Text>}
    {!auth.currentUser && <Button mode="contained" onPress={() => router.push('/login')}>Log in</Button>}
  </Page><NavBar /></>;
}
