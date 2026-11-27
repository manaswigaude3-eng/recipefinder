import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { OrderProvider } from '../components/order-store';

const theme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, primary: '#B55436', secondary: '#667B50', background: '#FAF7F2' },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}><OrderProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAF7F2' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="home" />
        <Stack.Screen name="search" />
        <Stack.Screen name="details" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="delivery" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="review-order" />
        <Stack.Screen name="order-confirmed" />
        <Stack.Screen name="tracking" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="order-details" />
        <Stack.Screen name="ingredients" />
      </Stack>
    </OrderProvider></PaperProvider>
  );
}
