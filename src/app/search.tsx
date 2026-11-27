import { useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput } from 'react-native-paper';
import { NavBar, Page, RecipeCard, type Recipe } from '../components/recipe-ui';
import { searchMeals } from '../firebase/recipes';

export default function SearchScreen() {
  const [query, setQuery] = useState(''); const [results, setResults] = useState<Recipe[]>([]); const [busy, setBusy] = useState(false);
  const search = async () => {
    if (!query.trim()) return Alert.alert('Search', 'Type a dish or ingredient first.');
    setBusy(true);
    try { setResults(await searchMeals(query.trim())); } catch (error: any) { Alert.alert('Search failed', error.message); }
    finally { setBusy(false); }
  };
  return <><Page title="Discover recipes"><Button mode="outlined" icon="cart-outline" onPress={() => router.push('/cart')}>View cart</Button><TextInput label="Dish name" value={query} onChangeText={setQuery} mode="outlined" onSubmitEditing={search} returnKeyType="search" />
    <Button mode="contained" loading={busy} disabled={busy} onPress={search}>Search TheMealDB</Button>
    {results.length === 0 && !busy ? <View style={{ paddingVertical: 14 }}><Button onPress={() => { setQuery('pasta'); }}>Try “pasta”</Button></View> : null}
    {results.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
  </Page><NavBar /></>;
}
