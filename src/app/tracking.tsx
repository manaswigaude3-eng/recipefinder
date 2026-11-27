import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Text } from 'react-native-paper';
import { useOrder } from '../components/order-store';
import { COLORS, NavBar, Page } from '../components/recipe-ui';

const steps = ['Order received', 'Preparing', 'Ready', 'On the way', 'Delivered'];

export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { orders } = useOrder();
  const order = orders.find((item) => item.id === id) || orders[0];

  return <><Page title="Track your order">
    {order ? <>
      <Text variant="titleMedium">Order {order.id}</Text>
      <Text>Placed {order.placedAt} · ${order.total.toFixed(2)}</Text>
      <Card style={{ backgroundColor: 'white' }}><Card.Content style={{ gap: 12 }}>
        <Text variant="titleLarge" style={{ color: COLORS.green }}>Preparing your order</Text>
        {steps.map((step, index) => <Text key={step} style={{ color: index < 2 ? COLORS.green : COLORS.muted, fontWeight: index === 1 ? '700' : '400' }}>{index < 2 ? '●' : '○'}  {step}</Text>)}
      </Card.Content></Card>
      <Text>Demo tracking status. Live delivery updates aren’t connected.</Text>
      <Button mode="contained" onPress={() => router.push({ pathname: '/order-details', params: { id: order.id } })}>View order details</Button>
      <Button onPress={() => router.push('/orders')}>My orders</Button>
    </> : <>
      <Text>You don’t have an order to track yet.</Text>
      <Button mode="contained" onPress={() => router.push('/search')}>Find recipes</Button>
      <Button onPress={() => router.push('/orders')}>My orders</Button>
    </>}
  </Page><NavBar /></>;
}
