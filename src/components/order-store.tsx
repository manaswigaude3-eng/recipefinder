import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import type { Recipe } from './recipe-ui';

export type CartItem = { recipe: Recipe; quantity: number };
export type SavedOrder = { id: string; items: CartItem[]; total: number; status: string; placedAt: string };
type OrderContextValue = {
  items: CartItem[]; orders: SavedOrder[]; add: (recipe: Recipe) => void; change: (id: string, amount: number) => void;
  clear: () => void; place: () => string;
};
const OrderContext = createContext<OrderContextValue | null>(null);
export const priceFor = (recipe: Recipe) => 8 + (Number(recipe.id.slice(-2)) % 12);
export const totalFor = (items: CartItem[]) => items.reduce((sum, item) => sum + priceFor(item.recipe) * item.quantity, 0);

export function OrderProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]); const [orders, setOrders] = useState<SavedOrder[]>([]);
  const value = useMemo<OrderContextValue>(() => ({ items, orders,
    add: (recipe) => setItems((old) => { const found = old.find((item) => item.recipe.id === recipe.id); return found ? old.map((item) => item.recipe.id === recipe.id ? { ...item, quantity: item.quantity + 1 } : item) : [...old, { recipe, quantity: 1 }]; }),
    change: (id, amount) => setItems((old) => old.map((item) => item.recipe.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0)),
    clear: () => setItems([]),
    place: () => { const id = `RG${Date.now().toString().slice(-6)}`; const order = { id, items, total: totalFor(items), status: 'Preparing', placedAt: new Date().toLocaleDateString() }; setOrders((old) => [order, ...old]); setItems([]); return id; },
  }), [items, orders]);
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
export function useOrder() { const value = useContext(OrderContext); if (!value) throw new Error('OrderProvider is missing'); return value; }
