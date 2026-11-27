import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Text } from 'react-native-paper';
import { NavBar, Page, RecipeCard, type Recipe } from '../components/recipe-ui';
import { searchMeals } from '../firebase/recipes';

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { searchMeals('chicken').then(setRecipes).catch((e) => Alert.alert('Recipes unavailable', e.message)).finally(() => setLoading(false)); }, []);
  return <><Page title="Recipe Genie"><Text variant="titleLarge">Good food, good mood.</Text><Text>Find something delicious to make today.</Text>
    <Button mode="contained" onPress={() => router.push('/search')}>Search recipes</Button>
    <Button mode="outlined" icon="cart-outline" onPress={() => router.push('/cart')}>View cart and order</Button>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Button compact mode="outlined" icon="receipt-text-outline" onPress={() => router.push('/orders')}>My orders</Button>
      <Button compact mode="outlined" icon="heart-outline" onPress={() => router.push('/favorites')}>Favorites</Button>
      <Button compact mode="outlined" icon="map-marker-path" onPress={() => router.push('/tracking')}>Track order</Button>
    </View>
    <View style={{ marginTop: 6 }}><Text variant="titleLarge">Popular ideas</Text><Text>{loading ? 'Loading recipes…' : `${recipes.length} recipes from TheMealDB`}</Text></View>
    {recipes.slice(0, 8).map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
  </Page><NavBar /></>;
}
