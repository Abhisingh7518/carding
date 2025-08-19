export interface Card {
  id: string | number;
  name: string;
  category: string;
  price: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  rating: number;
  inStock: boolean;
  stock?: number;
  imageUrl?: string;
  description?: string;
  // Optional Buy X Get Y promotion
  promoActive?: boolean;
  promoBuyQty?: number;
  promoGetQty?: number;
  // Admin controlled dollar get amount to show next to price
  promoGetAmount?: number;
}

export interface CartItem extends Card {
  quantity: number;
}

export interface UserData {
  id: string;
  email: string;
  password?: string; // optional for backward compatibility
  name: string;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  cardId?: string; // optional mapping to backend Card _id when available
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  user: { id: string; name: string; email: string };
  items: OrderItem[];
  total: number;
  address: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
