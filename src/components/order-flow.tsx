import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, RadioButton, Text, TextInput } from 'react-native-paper';
import { COLORS, Page, NavBar } from './recipe-ui';
import { priceFor, totalFor, useOrder } from './order-store';

const money = (value: number) => `$${value.toFixed(2)}`;
function ItemRows({ compact = false }: { compact?: boolean }) {
  const { items, change } = useOrder();
  return <>{items.map(({ recipe, quantity }) => <Card key={recipe.id} style={{ backgroundColor: 'white' }}><Card.Content style={{ gap: 6 }}>
    <Text variant="titleMedium" style={{ color: COLORS.ink }}>{recipe.name}</Text><Text>{money(priceFor(recipe))} each · Qty {quantity}</Text>
    {!compact && <View style={{ flexDirection: 'row', gap: 6 }}><Button compact onPress={() => change(recipe.id, -1)}>−</Button><Button compact onPress={() => change(recipe.id, 1)}>+</Button><Button compact onPress={() => change(recipe.id, -quantity)}>Remove</Button></View>}
  </Card.Content></Card>)}</>;
}
function Total() { const { items } = useOrder(); return <Card style={{ backgroundColor: '#F2E9DF' }}><Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="titleMedium">Total</Text><Text variant="titleMedium">{money(totalFor(items))}</Text></Card.Content></Card>; }
function Continue({ label, href, disabled = false }: { label: string; href: '/delivery' | '/payment' | '/review-order' | '/tracking'; disabled?: boolean }) {
  return <Button mode="contained" disabled={disabled} onPress={() => router.push(href)}>{label}</Button>;
}

export function OrderScreen({ page }: { page: string }) {
  const { items, orders, place } = useOrder();
  const params = useLocalSearchParams<{ id?: string }>();
  const [address, setAddress] = useState(''); const [payment, setPayment] = useState('Upon delivery');
  const order = orders.find((entry) => entry.id === params.id) || orders[0];
  const empty = items.length === 0;
  const title: Record<string, string> = { cart: 'Your cart', delivery: 'Delivery details', payment: 'Payment option', review: 'Review your order', confirmed: 'Order confirmed', tracking: 'Track your order', orders: 'My orders', details: 'Order details', ingredients: 'Ingredients to shop' };
  const finish = () => { if (!items.length) return; const id = place(); router.replace({ pathname: '/order-confirmed', params: { id } }); };
  return <><Page title={title[page] || 'Order'}>
    {page === 'cart' && <>{empty ? <><Text>Your cart is empty. Find a recipe and add a meal to get started.</Text><Button mode="contained" onPress={() => router.push('/search')}>Find recipes</Button></> : <><Text>Meals inspired by your favorite recipes.</Text><ItemRows /><Total /><Continue label="Continue to delivery" href="/delivery" /></>}</>}
    {page === 'delivery' && <>{empty ? <Text>Add a meal to your cart before checkout.</Text> : <><Text>Where should we bring your order?</Text><TextInput label="Delivery address" mode="outlined" value={address} onChangeText={setAddress} multiline /><TextInput label="Delivery notes (optional)" mode="outlined" /><Continue label="Choose payment" href="/payment" disabled={!address.trim()} /></>}</>}
    {page === 'payment' && <><Text>Choose how you’d like to pay in this demo.</Text><RadioButton.Group value={payment} onValueChange={setPayment}><RadioButton.Item label="Upon delivery" value="Upon delivery" /><RadioButton.Item label="Card (demo only)" value="Card demo" /><RadioButton.Item label="Digital wallet (demo)" value="Wallet demo" /></RadioButton.Group><Text>Checkout is a preview. No payment details are collected and no charge is made.</Text><Button mode="contained" onPress={() => router.push('/review-order')} disabled={empty}>Pay (demo)</Button></>}
    {page === 'review' && <>{empty ? <Text>Your cart is empty.</Text> : <><Text>Check everything before placing your demo order.</Text><ItemRows compact /><Total /><Text>Payment: {payment}</Text><Text>Delivery: {address || 'Add a delivery address first'}</Text><Button mode="contained" onPress={finish} disabled={!address.trim()}>Confirm order</Button></>}</>}
    {page === 'confirmed' && <><Text variant="titleLarge" style={{ color: COLORS.green }}>Thanks! Your order is in.</Text><Text>Order number: {params.id || order?.id || '—'}</Text><Text>This is a demo confirmation. No payment was processed.</Text><Button mode="contained" onPress={() => router.replace('/home')}>Back to home</Button><Button onPress={() => router.push({ pathname: '/tracking', params: { id: params.id || order?.id } })}>Track order</Button></>}
    {page === 'tracking' && <>{order ? <><Text>Order {params.id || order.id}</Text><Text variant="titleLarge" style={{ color: COLORS.green }}>● Preparing</Text><Text>Your meal is being prepared. This demo order has no live delivery updates.</Text><Text>Next: Ready for pickup → On the way → Delivered</Text><Button mode="contained" onPress={() => router.push({ pathname: '/order-details', params: { id: order.id } })}>Order details</Button></> : <><Text>No order to track yet.</Text><Button onPress={() => router.push('/orders')}>View order history</Button></>}</>}
    {page === 'orders' && <>{orders.length ? orders.map((entry) => <Card key={entry.id} onPress={() => router.push({ pathname: '/order-details', params: { id: entry.id } })}><Card.Content style={{ gap: 4 }}><Text variant="titleMedium">Order {entry.id}</Text><Text>{entry.placedAt} · {money(entry.total)} · {entry.status}</Text><Text>{entry.items.map((item) => item.recipe.name).join(', ')}</Text></Card.Content></Card>) : <Text>Your placed orders will show up here.</Text>}<Button mode="contained" onPress={() => router.push('/search')}>Find recipes</Button></>}
    {page === 'details' && <>{order ? <><Text variant="titleMedium">Order {params.id || order.id}</Text><Text>{order.placedAt} · {order.status}</Text>{order.items.map((item) => <Text key={item.recipe.id}>{item.quantity} × {item.recipe.name}</Text>)}<Text>Total: {money(order.total)}</Text><Button mode="contained" onPress={() => router.push({ pathname: '/tracking', params: { id: order.id } })}>Track order</Button></> : <Text>Choose an order from your history.</Text>}</>}
    {page === 'ingredients' && <>{empty ? <Text>Add a recipe to your cart to see its ingredients.</Text> : <>{items.map(({ recipe }) => <View key={recipe.id}><Text variant="titleMedium">{recipe.name}</Text>{(recipe.ingredients || []).map((ingredient) => <Text key={`${recipe.id}-${ingredient}`}>• {ingredient}</Text>)}</View>)}<Button mode="contained" onPress={() => router.push('/cart')}>Back to cart</Button></>}</>}
  </Page><NavBar /></>;
}
