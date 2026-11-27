import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Recipe } from '../components/recipe-ui';

const API = 'https://www.themealdb.com/api/json/v1/1';

function convertMeal(meal: any): Recipe {
  const ingredients = Array.from({ length: 20 }, (_, i) => {
    const ingredient = meal[`strIngredient${i + 1}`]?.trim();
    const measure = meal[`strMeasure${i + 1}`]?.trim();
    return ingredient ? `${measure ? `${measure} ` : ''}${ingredient}` : '';
  }).filter(Boolean);
  return {
    id: String(meal.idMeal), name: meal.strMeal, category: meal.strCategory || 'Meal',
    area: meal.strArea, image: meal.strMealThumb, instructions: meal.strInstructions, ingredients,
  };
}

export async function searchMeals(query: string): Promise<Recipe[]> {
  const response = await fetch(`${API}/search.php?s=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Could not load recipes. Check your connection.');
  const data = await response.json();
  return (data.meals || []).map(convertMeal);
}

export async function getMeal(id: string): Promise<Recipe> {
  const response = await fetch(`${API}/lookup.php?i=${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error('Could not load this recipe.');
  const data = await response.json();
  const meal = data.meals?.[0];
  if (!meal) throw new Error('Recipe not found.');
  return convertMeal(meal);
}

export async function getFavorites(uid: string): Promise<Recipe[]> {
  const snapshot = await getDocs(collection(db, 'users', uid, 'favorites'));
  return snapshot.docs.map((item) => item.data() as Recipe);
}

export async function saveFavorite(uid: string, recipe: Recipe) {
  await setDoc(doc(db, 'users', uid, 'favorites', recipe.id), recipe);
}

export async function removeFavorite(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'favorites', id));
}
