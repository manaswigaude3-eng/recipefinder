import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';


import { auth } from '../firebase/firebaseConfig';

type Recipe = {
  id: string;
  name: string;
  category: string;
  description: string;
  ingredients: string[];
  steps: string[];
  time: string;
  image: string;
};

type CartItem = {
  name: string;
  quantity: number;
};

const API = 'https://www.themealdb.com/api/json/v1/1';

const COLORS = {
  background: '#F8F6F2',
  white: '#FFFFFF',
  brown: '#332B25',
  terracotta: '#9A4D2A',
  olive: '#566B46',
  muted: '#82776E',
  border: '#E8DFD5',
};

const starterRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Creamy Tomato Pasta',
    category: 'Italian',
    description: 'A creamy tomato pasta perfect for a comforting meal.',
    ingredients: [
      '200g pasta',
      '2 tomatoes',
      '2 garlic cloves',
      '1/2 cup cream',
      '2 tbsp olive oil',
      'Salt',
      'Pepper',
    ],
    steps: [
      'Boil pasta in salted water until cooked.',
      'Chop tomatoes and garlic.',
      'Heat olive oil and saute garlic.',
      'Add tomatoes and cook until soft.',
      'Add cream and mix well.',
      'Add pasta and combine.',
      'Serve warm.',
    ],
    time: '25 min',
    image:
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601',
  },
  {
    id: '2',
    name: 'Vegetable Fried Rice',
    category: 'Asian',
    description: 'Quick fried rice with vegetables and delicious seasoning.',
    ingredients: [
      '2 cups cooked rice',
      '1 carrot',
      '1 capsicum',
      '1/2 cup peas',
      '2 tbsp soy sauce',
      '1 tbsp oil',
      'Salt',
    ],
    steps: [
      'Chop all the vegetables.',
      'Heat oil in a pan.',
      'Add vegetables and saute.',
      'Add cooked rice.',
      'Add soy sauce and salt.',
      'Mix well and serve.',
    ],
    time: '20 min',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19',
  },
  {
    id: '3',
    name: 'Chocolate Pancakes',
    category: 'Dessert',
    description: 'Soft chocolate pancakes for a sweet breakfast.',
    ingredients: [
      '1 cup flour',
      '2 tbsp cocoa powder',
      '1 egg',
      '1 cup milk',
      '2 tbsp sugar',
      '1 tsp baking powder',
    ],
    steps: [
      'Mix flour, cocoa and baking powder.',
      'Add milk, egg and sugar.',
      'Whisk until smooth.',
      'Heat a pan.',
      'Pour the batter.',
      'Flip when bubbles appear.',
      'Cook the other side and serve.',
    ],
    time: '20 min',
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
  },
  {
    id: '4',
    name: 'Paneer Butter Masala',
    category: 'Indian',
    description: 'Paneer in a rich tomato-based gravy.',
    ingredients: [
      '200g paneer',
      '2 tomatoes',
      '1 onion',
      '1 tbsp butter',
      '1/2 cup cream',
      '1 tsp garam masala',
      'Salt',
    ],
    steps: [
      'Chop onion and tomatoes.',
      'Cook onion and tomatoes in a pan.',
      'Blend into a smooth sauce.',
      'Add butter and spices.',
      'Add paneer cubes.',
      'Add cream and simmer.',
      'Serve with rice or roti.',
    ],
    time: '30 min',
    image:
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7',
  },
  {
    id: '5',
    name: 'Fresh Garden Salad',
    category: 'Healthy',
    description: 'Fresh vegetables with a simple dressing.',
    ingredients: [
      '1 cucumber',
      '2 tomatoes',
      '1 onion',
      'Lettuce',
      '1 tbsp lemon juice',
      'Salt',
    ],
    steps: [
      'Wash all vegetables.',
      'Chop cucumber and tomatoes.',
      'Slice onion.',
      'Tear lettuce into pieces.',
      'Combine in a bowl.',
      'Add lemon juice and salt.',
      'Mix and serve.',
    ],
    time: '10 min',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  },
  {
    id: '6',
    name: 'Banana Smoothie',
    category: 'Breakfast',
    description: 'A simple banana smoothie.',
    ingredients: [
      '2 bananas',
      '1 cup milk',
      '1 tbsp honey',
      'Ice cubes',
    ],
    steps: [
      'Peel and slice the bananas.',
      'Add bananas and milk to a blender.',
      'Add honey and ice.',
      'Blend until smooth.',
      'Serve chilled.',
    ],
    time: '5 min',
    image:
      'https://images.unsplash.com/photo-1505252585461-04db1eb84625',
  },
];

function convertMeal(meal: any): Recipe {
  const ingredients: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();

    if (ingredient) {
      ingredients.push(
        `${measure ? measure + ' ' : ''}${ingredient}`
      );
    }
  }

  const steps = String(meal.strInstructions || '')
    .split(/\r?\n/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0);

  return {
    id: String(meal.idMeal),
    name: meal.strMeal || 'Recipe',
    category: meal.strCategory || 'Food',
    description: `A delicious ${meal.strArea || ''} recipe.`,
    ingredients,
    steps: steps.length ? steps : ['No instructions available.'],
    time: 'See instructions',
    image: meal.strMealThumb || '',
  };
}

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [screen, setScreen] = useState('splash');
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [recipes, setRecipes] = useState<Recipe[]>(starterRecipes);
  const [onlineRecipes, setOnlineRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);

  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [collections, setCollections] = useState<Recipe[]>([]);
  const [notes, setNotes] = useState('');

  const [cookingStep, setCookingStep] = useState(0);

  const [kitchenInput, setKitchenInput] = useState('');
  const [kitchenResults, setKitchenResults] = useState<Recipe[]>([]);
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);

  const [mood, setMood] = useState('');
  const [planner, setPlanner] = useState<{day: string; meal: string; recipe: string}[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      setScreen(currentUser ? 'home' : 'login');
    });

    return unsubscribe;
  }, []);

  const showError = (error: any) => {
    Alert.alert(
      'Something went wrong',
      error?.message || 'Please try again.'
    );
  };

  const login = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Enter your email and password.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      showError(error);
    }
  };

  const register = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Enter your email and password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password', 'Password must be at least 6 characters.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (error: any) {
      showError(error);
    }
  };

  const logout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error: any) {
            showError(error);
          }
        },
      },
    ]);
  };

  const searchRecipes = async () => {
    if (!search.trim()) {
      Alert.alert('Search', 'Enter a recipe name.');
      return;
    }

    setSearchLoading(true);

    try {
      const response = await fetch(
        `${API}/search.php?s=${encodeURIComponent(search.trim())}`
      );

      const data = await response.json();

      const found = data.meals
        ? data.meals.map(convertMeal)
        : [];

      setOnlineRecipes(found);

      if (!found.length) {
        Alert.alert('No recipes', 'Try another recipe name.');
      }
    } catch (error: any) {
      showError(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const randomRecipe = async () => {
    setSearchLoading(true);

    try {
      const response = await fetch(`${API}/random.php`);
      const data = await response.json();

      if (data.meals?.[0]) {
        const recipe = convertMeal(data.meals[0]);
        setSelected(recipe);
        setCookingStep(0);
        setScreen('details');
      }
    } catch (error: any) {
      showError(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const findByIngredient = async () => {
    if (!kitchenInput.trim()) {
      Alert.alert('Ingredients', 'Enter at least one ingredient.');
      return;
    }

    const ingredients = kitchenInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const all: Recipe[] = [];

    setSearchLoading(true);

    try {
      for (const ingredient of ingredients.slice(0, 5)) {
        const response = await fetch(
          `${API}/filter.php?i=${encodeURIComponent(ingredient)}`
        );
        const data = await response.json();

        if (data.meals) {
          for (const meal of data.meals.slice(0, 6)) {
            const recipe: Recipe = {
              id: meal.idMeal,
              name: meal.strMeal,
              category: 'Ingredient Match',
              description: 'Recipe matching your ingredients.',
              ingredients: [ingredient],
              steps: ['Loading recipe details...'],
              time: 'See instructions',
              image: meal.strMealThumb || '',
            };

            if (!all.some((r) => r.id === recipe.id)) {
              all.push(recipe);
            }
          }
        }
      }

      setKitchenResults(all);

      if (!all.length) {
        Alert.alert('No matches', 'Try different ingredients.');
      }
    } catch (error: any) {
      showError(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const openRecipe = async (recipe: Recipe) => {
    setSelected(recipe);
    setCookingStep(0);
    setScreen('details');

    if (/^\d+$/.test(recipe.id)) {
      try {
        const response = await fetch(
          `${API}/lookup.php?i=${recipe.id}`
        );
        const data = await response.json();

        if (data.meals?.[0]) {
          const detailed = convertMeal(data.meals[0]);
          setSelected(detailed);
        }
      } catch {
        // The recipe card remains available if the API fails.
      }
    }
  };

  const toggleFavorite = (recipe: Recipe) => {
    setFavorites((prev) =>
      prev.some((r) => r.id === recipe.id)
        ? prev.filter((r) => r.id !== recipe.id)
        : [...prev, recipe]
    );
  };

  const toggleCollection = (recipe: Recipe) => {
    setCollections((prev) =>
      prev.some((r) => r.id === recipe.id)
        ? prev.filter((r) => r.id !== recipe.id)
        : [...prev, recipe]
    );
  };

  const addToCart = (ingredient: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === ingredient);

      if (existing) {
        return prev.map((item) =>
          item.name === ingredient
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { name: ingredient, quantity: 1 }];
    });
  };

  const addRecipeIngredients = () => {
    if (!selected) return;

    selected.ingredients.forEach((ingredient) => addToCart(ingredient));

    Alert.alert(
      'Added',
      'Recipe ingredients have been added to your cart.',
      [{ text: 'OK', onPress: () => setScreen('cart') }]
    );
  };

  const changeQuantity = (name: string, amount: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.name === name
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.quantity * 50,
    0
  );

  const placeOrder = () => {
    if (!customerName.trim() || !address.trim()) {
      Alert.alert(
        'Required',
        'Enter your name and delivery address.'
      );
      return;
    }

    if (!cart.length) {
      Alert.alert('Empty Cart', 'Add items before placing an order.');
      return;
    }

    const order = {
      id: 'RG' + Date.now().toString().slice(-6),
      items: [...cart],
      total: cartTotal,
      name: customerName,
      address,
      date: new Date().toLocaleDateString(),
      status: 'Demo order confirmed',
    };

    setOrders((prev) => [order, ...prev]);
    setCurrentOrder(order);
    setCart([]);
    setScreen('confirmation');
  };

  const addPlanner = (recipe: Recipe, day: string, meal: string) => {
    setPlanner((prev) => [
      ...prev,
      { day, meal, recipe: recipe.name },
    ]);

    Alert.alert('Saved', 'Recipe added to your meal planner.');
  };

  const moodRecipes = recipes.filter((recipe) => {
    if (!mood) return true;

    const value = mood.toLowerCase();

    if (value === 'comfort') {
      return ['Indian', 'Italian'].includes(recipe.category);
    }
    if (value === 'quick') {
      return recipe.time.includes('5') || recipe.time.includes('10') ||
        recipe.time.includes('20');
    }
    if (value === 'sweet') {
      return recipe.category === 'Dessert' ||
        recipe.name.toLowerCase().includes('chocolate');
    }
    if (value === 'fresh') {
      return recipe.category === 'Healthy' ||
        recipe.category === 'Breakfast';
    }

    return true;
  });

  const allRecipes = [...recipes, ...onlineRecipes];

  const substitutions: Record<string, string> = {
    'butter': 'Olive oil (for many sauteing recipes)',
    'cream': 'Milk with a little flour (depending on recipe)',
    'lemon': 'Lime',
    'parsley': 'Coriander',
    'coriander': 'Parsley (depending on the recipe)',
    'milk': 'A suitable unsweetened plant-based milk',
    'egg': 'A recipe-specific egg substitute',
    'tomato': 'Canned tomatoes',
  };

  const renderImage = (image: string, height = 190) => (
    <Image
      source={{ uri: image }}
      style={{ width: '100%', height, borderRadius: 16 }}
      resizeMode="cover"
    />
  );

  const button = (
    title: string,
    action: () => void,
    color = COLORS.terracotta
  ) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={action}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const smallButton = (title: string, action: () => void) => (
    <TouchableOpacity style={styles.smallButton} onPress={action}>
      <Text style={styles.smallButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  const card = (recipe: Recipe) => (
    <View style={styles.recipeCard} key={recipe.id}>
      {renderImage(recipe.image, 175)}
      <Text style={styles.cardTitle}>{recipe.name}</Text>
      <Text style={styles.muted}>{recipe.category} • {recipe.time}</Text>
      <Text style={styles.description}>{recipe.description}</Text>

      <View style={styles.row}>
        {smallButton('View Recipe', () => openRecipe(recipe))}
        {smallButton(
          favorites.some((r) => r.id === recipe.id)
            ? '♥ Saved'
            : '♡ Save',
          () => toggleFavorite(recipe)
        )}
      </View>
    </View>
  );

  const header = (title: string) => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={() => setScreen('profile')}>
        <Text style={styles.profileButton}>◉</Text>
      </TouchableOpacity>
    </View>
  );

  const bottomNav = () => (
    <View style={styles.bottomNav}>
      {[
        ['Home', 'home'],
        ['Explore', 'explore'],
        ['Saved', 'favorites'],
        ['Cart', 'cart'],
        ['Profile', 'profile'],
      ].map(([label, destination]) => (
        <TouchableOpacity
          key={destination}
          style={styles.navItem}
          onPress={() => setScreen(destination)}
        >
          <Text
            style={[
              styles.navText,
              screen === destination && styles.navActive,
            ]}
          >
            {label}
          </Text>
          {destination === 'cart' && cart.length > 0 ? (
            <Text style={styles.navCount}>{cart.length}</Text>
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loadingAuth || screen === 'splash') {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>Recipe Genie</Text>
        <Text style={styles.tagline}>Discover. Cook. Enjoy.</Text>
        <ActivityIndicator color={COLORS.terracotta} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.logo}>Recipe Genie</Text>
          <Text style={styles.tagline}>
            Discover something delicious.
          </Text>

          <Text style={styles.authTitle}>
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>

          <Text style={styles.muted}>
            {authMode === 'login'
              ? 'Login to explore recipes.'
              : 'Register to start your food journey.'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password (at least 6 characters)"
            placeholderTextColor={COLORS.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {button(
            authMode === 'login' ? 'Login' : 'Register',
            authMode === 'login' ? login : register
          )}

          <TouchableOpacity
            onPress={() =>
              setAuthMode(authMode === 'login' ? 'register' : 'login')
            }
          >
            <Text style={styles.link}>
              {authMode === 'login'
                ? "Don't have an account? Register"
                : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {screen === 'home' && (
          <>
            {header('Recipe Genie')}
            <Text style={styles.welcome}>
              Hello, food lover!
            </Text>
            <Text style={styles.subtitle}>
              What would you like to cook today?
            </Text>

            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>
                Good food, good mood.
              </Text>
              <Text style={styles.bannerText}>
                Discover your next favourite dish.
              </Text>
              {button('Explore Recipes', () => setScreen('explore'))}
            </View>

            <Text style={styles.sectionTitle}>Mood Cooking</Text>
            <View style={styles.rowWrap}>
              {['Comfort', 'Quick', 'Sweet', 'Fresh'].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.chip,
                    mood === m.toLowerCase() && styles.chipActive,
                  ]}
                  onPress={() => setMood(m.toLowerCase())}
                >
                  <Text style={styles.chipText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {button('Clear Mood', () => setMood(''), COLORS.olive)}

            <Text style={styles.sectionTitle}>Mystery Meal</Text>
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>
                Let us surprise you!
              </Text>
              {button('Surprise Me', randomRecipe)}
            </View>

            <Text style={styles.sectionTitle}>Featured Recipes</Text>
            {moodRecipes.map(card)}

            <Text style={styles.sectionTitle}>Popular Today</Text>
            {starterRecipes.slice(0, 3).map(card)}
          </>
        )}

        {screen === 'explore' && (
          <>
            {header('Explore Recipes')}
            <Text style={styles.subtitle}>
              Search recipes from around the world.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Search any recipe..."
              placeholderTextColor={COLORS.muted}
              value={search}
              onChangeText={setSearch}
            />

            {button('Search Online Recipes', searchRecipes)}
            {button('Surprise Me', randomRecipe, COLORS.olive)}

            {searchLoading && (
              <ActivityIndicator color={COLORS.terracotta} />
            )}

            <Text style={styles.sectionTitle}>Online Results</Text>
            {onlineRecipes.map(card)}

            <Text style={styles.sectionTitle}>Local Recipes</Text>
            {starterRecipes.map(card)}

            <Text style={styles.sectionTitle}>Browse Categories</Text>
            {['Indian', 'Italian', 'Asian', 'Healthy', 'Dessert', 'Breakfast'].map(
              (category) => (
                <TouchableOpacity
                  style={styles.category}
                  key={category}
                  onPress={() => {
                    setSearch(category);
                    setOnlineRecipes([]);
                    setScreen('explore');
                  }}
                >
                  <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
              )
            )}
          </>
        )}

        {screen === 'details' && selected && (
          <>
            {header('Recipe Details')}
            {renderImage(selected.image, 240)}
            <Text style={styles.title}>{selected.name}</Text>
            <Text style={styles.muted}>
              {selected.category} • {selected.time}
            </Text>
            <Text style={styles.description}>
              {selected.description}
            </Text>

            <Text style={styles.sectionTitle}>Ingredients</Text>
            {selected.ingredients.map((ingredient, i) => (
              <View style={styles.listItem} key={i}>
                <Text style={styles.listText}>• {ingredient}</Text>
                {smallButton('Add', () => addToCart(ingredient))}
              </View>
            ))}

            <Text style={styles.sectionTitle}>Cooking Instructions</Text>
            {selected.steps.map((step, i) => (
              <View style={styles.stepCard} key={i}>
                <Text style={styles.stepNumber}>Step {i + 1}</Text>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}

            {button('Start Cooking Mode', () => {
              setCookingStep(0);
              setScreen('cooking');
            })}

            {button('Add All Ingredients to Cart', addRecipeIngredients)}

            {button(
              favorites.some((r) => r.id === selected.id)
                ? 'Remove from Favorites'
                : 'Add to Favorites',
              () => toggleFavorite(selected),
              COLORS.olive
            )}

            {button(
              collections.some((r) => r.id === selected.id)
                ? 'Remove from Collection'
                : 'Add to Collection',
              () => toggleCollection(selected)
            )}

            <Text style={styles.sectionTitle}>Personal Recipe Note</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Write your own cooking notes..."
              placeholderTextColor={COLORS.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <Text style={styles.sectionTitle}>Ingredient Substitutions</Text>
            {selected.ingredients.map((ingredient, i) => {
              const key = ingredient.toLowerCase().replace(/^\d+[\s/]*|^[^a-z]*/i, '');
              const substitute = Object.keys(substitutions).find((k) =>
                key.includes(k)
              );

              return substitute ? (
                <Text style={styles.listText} key={i}>
                  {ingredient} → {substitutions[substitute]}
                </Text>
              ) : null;
            })}

            <Text style={styles.sectionTitle}>Plan This Recipe</Text>
            {button('Add to Meal Planner', () =>
              addPlanner(selected, 'Tomorrow', 'Dinner')
            )}
          </>
        )}

        {screen === 'cooking' && selected && (
          <>
            {header('Cooking Mode')}
            {renderImage(selected.image, 200)}
            <Text style={styles.title}>{selected.name}</Text>

            <Text style={styles.subtitle}>
              Step {Math.min(cookingStep + 1, selected.steps.length)} of{' '}
              {selected.steps.length}
            </Text>

            <View style={styles.progress}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((cookingStep + 1) / selected.steps.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>

            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>
                Step {cookingStep + 1}
              </Text>
              <Text style={styles.cookingText}>
                {selected.steps[cookingStep]}
              </Text>
            </View>

            <View style={styles.row}>
              {smallButton('Previous', () =>
                setCookingStep(Math.max(0, cookingStep - 1))
              )}
              {smallButton('Next', () =>
                setCookingStep(
                  Math.min(selected.steps.length - 1, cookingStep + 1)
                )
              )}
            </View>

            {button('Finish Cooking', () => setScreen('details'))}
          </>
        )}

        {screen === 'favorites' && (
          <>
            {header('My Favorites')}
            {favorites.length === 0 ? (
              <Text style={styles.empty}>
                No favorites yet. Save recipes you love!
              </Text>
            ) : (
              favorites.map(card)
            )}

            <Text style={styles.sectionTitle}>My Collections</Text>
            {collections.length === 0 ? (
              <Text style={styles.empty}>
                Add recipes to your collection from Recipe Details.
              </Text>
            ) : (
              collections.map(card)
            )}
          </>
        )}

        {screen === 'planner' && (
          <>
            {header('Meal Planner')}
            <Text style={styles.subtitle}>
              Plan your meals ahead.
            </Text>

            {planner.length === 0 ? (
              <Text style={styles.empty}>
                Your planner is empty.
              </Text>
            ) : (
              planner.map((item, i) => (
                <View style={styles.stepCard} key={i}>
                  <Text style={styles.cardTitle}>{item.day}</Text>
                  <Text style={styles.listText}>{item.meal}</Text>
                  <Text style={styles.listText}>{item.recipe}</Text>
                </View>
              ))
            )}

            <Text style={styles.sectionTitle}>Add Recipes</Text>
            {allRecipes.map((recipe) => (
              <View key={recipe.id} style={styles.recipeCard}>
                <Text style={styles.cardTitle}>{recipe.name}</Text>
                {button('Plan for Tomorrow', () =>
                  addPlanner(recipe, 'Tomorrow', 'Dinner')
                )}
              </View>
            ))}
          </>
        )}

        {screen === 'kitchen' && (
          <>
            {header("What's in My Kitchen?")}
            <Text style={styles.subtitle}>
              Enter ingredients separated by commas.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Tomato, egg, potato..."
              placeholderTextColor={COLORS.muted}
              value={kitchenInput}
              onChangeText={setKitchenInput}
            />

            {button('Find Recipes', findByIngredient)}

            {searchLoading && (
              <ActivityIndicator color={COLORS.terracotta} />
            )}

            <Text style={styles.sectionTitle}>Matching Recipes</Text>
            {kitchenResults.map((recipe) => (
              <View key={recipe.id} style={styles.recipeCard}>
                {renderImage(recipe.image, 160)}
                <Text style={styles.cardTitle}>{recipe.name}</Text>
                {button('View Recipe', () => openRecipe(recipe))}
              </View>
            ))}

            <Text style={styles.sectionTitle}>Zero-Waste Ideas</Text>
            <Text style={styles.description}>
              Try using leftover vegetables in soups, stir-fries,
              salads or rice dishes. Store ingredients safely and
              avoid using food that has spoiled.
            </Text>
          </>
        )}

        {screen === 'cart' && (
          <>
            {header('Shopping Basket')}
            {cart.length === 0 ? (
              <Text style={styles.empty}>
                Your basket is empty.
              </Text>
            ) : (
              cart.map((item, i) => (
                <View style={styles.cartItem} key={i}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.muted}>
                      Demo price: ₹50 per quantity
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => changeQuantity(item.name, -1)}
                  >
                    <Text style={styles.quantityText}>−</Text>
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>
                    {item.quantity}
                  </Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => changeQuantity(item.name, 1)}
                  >
                    <Text style={styles.quantityText}>+</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            <Text style={styles.total}>
              Total: ₹{cartTotal}
            </Text>

            {button('Continue Shopping', () => setScreen('explore'))}
            {button('Proceed to Checkout', () => setScreen('checkout'))}
          </>
        )}

        {screen === 'checkout' && (
          <>
            {header('Checkout')}
            <Text style={styles.sectionTitle}>Delivery Details</Text>

            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={COLORS.muted}
              value={customerName}
              onChangeText={setCustomerName}
            />

            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Delivery address"
              placeholderTextColor={COLORS.muted}
              value={address}
              onChangeText={setAddress}
              multiline
            />

            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cart.map((item, i) => (
              <Text style={styles.listText} key={i}>
                {item.name} × {item.quantity}
              </Text>
            ))}

            <Text style={styles.total}>Total: ₹{cartTotal}</Text>

            <Text style={styles.sectionTitle}>Payment</Text>
            <Text style={styles.listText}>
              Cash on Delivery (Demo)
            </Text>

            {button('Confirm Demo Order', placeOrder)}
            {button('Back to Cart', () => setScreen('cart'), COLORS.olive)}
          </>
        )}

        {screen === 'confirmation' && currentOrder && (
          <>
            {header('Order Confirmation')}
            <View style={styles.confirmation}>
              <Text style={styles.confirmationIcon}>✓</Text>
              <Text style={styles.confirmationTitle}>
                Order Confirmed!
              </Text>
              <Text style={styles.subtitle}>
                Your demo order has been placed.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Order ID</Text>
            <Text style={styles.orderID}>{currentOrder.id}</Text>

            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <Text style={styles.listText}>{currentOrder.name}</Text>
            <Text style={styles.listText}>{currentOrder.address}</Text>

            <Text style={styles.sectionTitle}>Items</Text>
            {currentOrder.items.map((item: CartItem, i: number) => (
              <Text style={styles.listText} key={i}>
                {item.name} × {item.quantity}
              </Text>
            ))}

            <Text style={styles.total}>
              Total: ₹{currentOrder.total}
            </Text>

            {button('View Order History', () => setScreen('profile'))}
            {button('Back to Home', () => setScreen('home'), COLORS.olive)}
          </>
        )}

        {screen === 'profile' && (
          <>
            {header('My Profile')}
            <View style={styles.profileCard}>
              <Text style={styles.profileIcon}>◉</Text>
              <Text style={styles.title}>Recipe Genie User</Text>
              <Text style={styles.listText}>{user.email}</Text>
            </View>

            <Text style={styles.sectionTitle}>Account</Text>
            {button('My Favorites', () => setScreen('favorites'))}
            {button('Meal Planner', () => setScreen('planner'))}
            {button('Kitchen Finder', () => setScreen('kitchen'))}
            {button('Shopping Cart', () => setScreen('cart'))}

            <Text style={styles.sectionTitle}>Order History</Text>
            {orders.length === 0 ? (
              <Text style={styles.empty}>
                No orders have been placed.
              </Text>
            ) : (
              orders.map((order, i) => (
                <View style={styles.stepCard} key={i}>
                  <Text style={styles.cardTitle}>
                    Order {order.id}
                  </Text>
                  <Text style={styles.listText}>
                    {order.date}
                  </Text>
                  <Text style={styles.listText}>
                    {order.status}
                  </Text>
                  <Text style={styles.listText}>
                    Total: ₹{order.total}
                  </Text>
                </View>
              ))
            )}

            <Text style={styles.sectionTitle}>Account Settings</Text>
            {button('Logout', logout, '#8C3D30')}
          </>
        )}
      </ScrollView>

      {bottomNav()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  authContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  authContent: {
    padding: 25,
    paddingTop: 80,
    justifyContent: 'center',
  },
  splash: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.terracotta,
    textAlign: 'center',
  },
  tagline: {
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },
  authTitle: {
    fontSize: 25,
    color: COLORS.brown,
    fontWeight: 'bold',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: COLORS.brown,
  },
  profileButton: {
    fontSize: 27,
    color: COLORS.terracotta,
  },
  welcome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.brown,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 5,
    marginBottom: 15,
  },
  banner: {
    backgroundColor: '#EDE2D5',
    padding: 20,
    borderRadius: 20,
    marginVertical: 15,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.brown,
    marginBottom: 6,
  },
  bannerText: {
    color: COLORS.muted,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: COLORS.brown,
    marginTop: 22,
    marginBottom: 12,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: COLORS.brown,
    marginTop: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brown,
    marginTop: 10,
  },
  description: {
    fontSize: 15,
    color: COLORS.muted,
    marginVertical: 10,
    lineHeight: 22,
  },
  muted: {
    color: COLORS.muted,
    marginTop: 6,
  },
  recipeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    padding: 15,
    borderRadius: 13,
    alignItems: 'center',
    marginVertical: 7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  smallButton: {
    backgroundColor: COLORS.terracotta,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    margin: 4,
  },
  smallButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginVertical: 10,
    color: COLORS.brown,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  link: {
    color: COLORS.terracotta,
    textAlign: 'center',
    marginTop: 18,
    fontWeight: 'bold',
  },
  chip: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.olive,
  },
  chipText: {
    color: COLORS.brown,
    fontWeight: 'bold',
  },
  category: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryText: {
    color: COLORS.brown,
    fontWeight: 'bold',
    fontSize: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    marginVertical: 5,
  },
  listText: {
    fontSize: 15,
    color: COLORS.brown,
    lineHeight: 23,
    flex: 1,
  },
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 17,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepNumber: {
    fontSize: 16,
    color: COLORS.terracotta,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cookingText: {
    fontSize: 22,
    color: COLORS.brown,
    lineHeight: 34,
  },
  progress: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 15,
  },
  progressFill: {
    height: 8,
    backgroundColor: COLORS.olive,
  },
  empty: {
    color: COLORS.muted,
    textAlign: 'center',
    padding: 25,
    fontSize: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 13,
    borderRadius: 15,
    marginVertical: 7,
  },
  quantityButton: {
    backgroundColor: '#EDE2D5',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 7,
  },
  quantityText: {
    fontSize: 18,
    color: COLORS.brown,
    fontWeight: 'bold',
  },
  total: {
    fontSize: 23,
    fontWeight: 'bold',
    color: COLORS.terracotta,
    marginVertical: 20,
  },
  confirmation: {
    backgroundColor: '#E5EBDD',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  confirmationIcon: {
    fontSize: 50,
    color: COLORS.olive,
    fontWeight: 'bold',
  },
  confirmationTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: COLORS.olive,
    marginTop: 10,
  },
  orderID: {
    fontSize: 25,
    fontWeight: 'bold',
    color: COLORS.terracotta,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 45,
    color: COLORS.terracotta,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 12,
    paddingBottom: 18,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: 'bold',
  },
  navActive: {
    color: COLORS.terracotta,
  },
  navCount: {
    color: COLORS.terracotta,
    fontSize: 11,
    fontWeight: 'bold',
  },
});