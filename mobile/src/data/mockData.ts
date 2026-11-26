export type Restaurant = {
  id: string
  name: string
  rating: number
  delivery: string
  time: string
  description: string
  offers: string[]
}

export type Food = {
  id: string
  name: string
  restaurantId: string
  restaurant: string
  category: string
  price: number
  description: string
}

export type IngredientCategory = 'Basic' | 'Fruit'

export type Ingredient = {
  id: string
  name: string
  category: IngredientCategory
}

export type DataType = {
  label: string;
  value: number;
};

const LOREM =
  'Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.'


export const INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Salt', category: 'Basic' },
  { id: '2', name: 'Chicken', category: 'Basic' },
  { id: '3', name: 'Onion', category: 'Basic' },
  { id: '4', name: 'Garlic', category: 'Basic' },
  { id: '5', name: 'Peppers', category: 'Basic' },
  { id: '6', name: 'Ginger', category: 'Basic' },
  { id: '7', name: 'Avocado', category: 'Fruit' },
  { id: '8', name: 'Apple', category: 'Fruit' },
  { id: '9', name: 'Blueberry', category: 'Fruit' },
  { id: '10', name: 'Broccoli', category: 'Fruit' },
  { id: '11', name: 'Orange', category: 'Fruit' },
  { id: '12', name: 'Walnut', category: 'Fruit' },
]

export const RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Pansi Restaurant', rating: 4.7, delivery: 'Free', time: '20 min', description: LOREM, offers: ['Delivery', 'Pick Up', 'Online payment available'] },
  { id: '2', name: 'American Spicy Burger Shop', rating: 4.3, delivery: 'Free', time: '25 min', description: LOREM, offers: ['Delivery', 'Offer', 'Online payment available'] },
  { id: '3', name: 'Cafenio Coffee Club', rating: 4.0, delivery: 'Free', time: '30 min', description: LOREM, offers: ['Pick Up', 'Offer'] },
  { id: '4', name: 'Uttora Coffee House', rating: 4.5, delivery: 'Free', time: '20 min', description: LOREM, offers: ['Delivery', 'Pick Up', 'Offer', 'Online payment available'] },
  { id: '5', name: 'Rose Garden', rating: 4.6, delivery: 'Free', time: '15 min', description: LOREM, offers: ['Delivery', 'Online payment available'] },
  { id: '6', name: 'Kaji Firm Kitchen', rating: 4.2, delivery: 'Free', time: '35 min', description: LOREM, offers: ['Delivery', 'Pick Up'] },
  { id: '7', name: 'Kabab Restaurant', rating: 4.4, delivery: 'Free', time: '25 min', description: LOREM, offers: ['Delivery', 'Pick Up', 'Offer'] },
]

const restaurantName = (restaurantId: string) =>
  RESTAURANTS.find((restaurant) => restaurant.id === restaurantId)?.name ?? ''

const RAW_FOODS: Omit<Food, 'restaurant'>[] = [
  { id: '1', name: 'Burger Bistro', restaurantId: '5', category: 'Burger', price: 40, description: LOREM },
  { id: '2', name: "Smokin' Burger", restaurantId: '3', category: 'Burger', price: 60, description: LOREM },
  { id: '3', name: 'Buffalo Burgers', restaurantId: '6', category: 'Burger', price: 75, description: LOREM },
  { id: '4', name: 'Bullseye Burgers', restaurantId: '7', category: 'Burger', price: 94, description: LOREM },
  { id: '5', name: 'Smash Burger', restaurantId: '2', category: 'Burger', price: 55, description: LOREM },
  { id: '6', name: 'European Pizza', restaurantId: '4', category: 'Pizza', price: 45, description: LOREM },
  { id: '7', name: 'Buffalo Pizza', restaurantId: '3', category: 'Pizza', price: 52, description: LOREM },
  { id: '8', name: 'Chicken Wrap', restaurantId: '1', category: 'Sandwich', price: 30, description: LOREM },
  { id: '9', name: 'Club Sandwich', restaurantId: '1', category: 'Sandwich', price: 28, description: LOREM },
  { id: '10', name: 'Vanilla Ice Cream', restaurantId: '5', category: 'Ice Cream', price: 18, description: LOREM },
  { id: '11', name: 'Classic Hot Dog', restaurantId: '7', category: 'Hot Dog', price: 22, description: LOREM },
  { id: '12', name: 'Chili Dog', restaurantId: '2', category: 'Hot Dog', price: 26, description: LOREM },
]

export const FOODS: Food[] = RAW_FOODS.map((food) => ({
  ...food,
  restaurant: restaurantName(food.restaurantId),
}))